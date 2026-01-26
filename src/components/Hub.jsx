import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Hub({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const chatRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const executeAction = (action) => {
    if (action.type === 'navigate') {
      const url = createPageUrl(action.page);
      if (action.modal) {
        navigate(url + (url.includes('?') ? '&' : '?') + 'modal=' + action.modal);
      } else {
        navigate(url);
      }
    } else if (action.type === 'update') {
      base44.entities[action.entity].update(action.id, action.data).catch(err => console.error('Update failed:', err));
    } else if (action.type === 'create') {
      base44.entities[action.entity].create(action.data).catch(err => console.error('Create failed:', err));
    } else if (action.type === 'delete') {
      base44.entities[action.entity].delete(action.id).catch(err => console.error('Delete failed:', err));
    } else if (action.type === 'fill_form') {
      window.dispatchEvent(new CustomEvent('fillForm', { detail: action }));
    }
  };

  const parseActions = (content) => {
    const actionPattern = /\[ACTION: (.*?)\]/g;
    let match;
    while ((match = actionPattern.exec(content)) !== null) {
      try {
        const action = JSON.parse(match[1]);
        executeAction(action);
      } catch (e) {
        console.error('Action parse error:', e);
      }
    }
  };

  const parseVoiceForForms = async (userText) => {
    try {
      const response = await base44.functions.invoke('parseVoiceCommand', { text: userText });
      const parsed = response.data;

      if (parsed.action === 'navigate' && parsed.entity === 'calendar') {
        navigate(createPageUrl('ManagerFinancials'));
      } else if (parsed.action === 'create' || parsed.action === 'open') {
        let modalName = null;
        if (parsed.entity === 'client') modalName = 'client';
        else if (parsed.entity === 'production') modalName = 'production';
        else if (parsed.entity === 'quote') modalName = 'quote';
        else if (parsed.entity === 'supplier') modalName = 'supplier';

        if (modalName) {
          navigate(createPageUrl('ManagerDashboard') + '?modal=' + modalName);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('fillAndSaveForm', { 
              detail: { 
                modal: modalName, 
                fields: parsed.fields,
                auto_save: parsed.auto_save 
              } 
            }));
          }, 500);
        }
      }
    } catch (err) {
      console.error('Voice parse error:', err);
    }
  };

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: 'grokCommander'
      });
      setConversationId(conversation.id);
      
      // Load previous chat history
      const previousMessages = await base44.entities.ChatMessage.filter(
        { conversation_id: conversation.id },
        '-created_date',
        100
      );
      
      if (previousMessages.length > 0) {
        setMessages(previousMessages.map(m => ({ role: m.role, content: m.content })));
      } else {
        const greeting = { role: 'assistant', content: 'Good evening. Ready when you are.' };
        setMessages([greeting]);
        speak(greeting.content);
        
        await base44.entities.ChatMessage.create({
          conversation_id: conversation.id,
          role: 'assistant',
          content: greeting.content,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (error) {
      console.error('Conversation init error:', error);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = async (text) => {
    try {
      const response = await base44.functions.invoke('elevenlabsTTS', { text });
      const arrayBuffer = response.data;
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Save user message to database
      await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        role: 'user',
        content: text,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, { role: 'user', content: text });

      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages);
        
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg?.role === 'assistant') {
          parseActions(lastMsg.content);
          speak(lastMsg.content);
          
          // Save assistant message to database
          base44.entities.ChatMessage.create({
            conversation_id: conversationId,
            role: 'assistant',
            content: lastMsg.content,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }).catch(err => console.error('Failed to save message:', err));
        }
      });

      setTimeout(() => unsubscribe(), 15000);
    } catch (err) {
      const errorMsg = { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Try again?' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInput(transcript);
      if (!event.results[event.results.length - 1].isFinal) {
        return;
      }
      parseVoiceForForms(transcript);
      sendMessage(transcript);
      setInput('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-6">
      <div className="bg-white dark:bg-[#212121] w-full max-w-md h-[600px] shadow-2xl flex flex-col border border-[#00c600]" style={{ borderRadius: '6px' }}>
        <div className="p-4 border-b border-[#00c600] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/978101b2a_Gemini_Generated_Image_6erfwv6erfwv6erf.png"
              alt="Hub"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="text-lg">Hub</div>
              <div className="text-xs opacity-70">Your assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} color="#00c600" />
          </button>
        </div>

        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1a1a]"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#00c600] text-white' 
                    : 'bg-[#2a2a2a] text-white'
                }`}
                style={{ borderRadius: '6px' }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#2a2a2a] text-white p-3" style={{ borderRadius: '6px' }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#00c600] rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-[#00c600] rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-[#00c600] rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#00c600] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask Hub anything..."
            className="flex-1 bg-[#2a2a2a] text-white border-[#00c600]"
            style={{ borderRadius: '6px' }}
          />
          <button
            onClick={listening ? stopListening : startListening}
            className={`p-2 ${listening ? 'bg-red-500' : ''}`}
            style={{ borderRadius: '6px' }}
          >
            <Mic size={20} />
          </button>
          <button 
            onClick={() => sendMessage(input)} 
            disabled={loading}
            style={{ borderRadius: '6px' }}
          >
            <Send size={20} />
          </button>
        </div>

        {audioUrl && (
          <audio 
            key={audioUrl}
            src={audioUrl}
            autoPlay
            ref={audioRef}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
}