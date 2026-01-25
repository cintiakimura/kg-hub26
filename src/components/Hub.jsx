import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Hub({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const chatRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = { role: 'assistant', content: 'Good evening. Ready when you are.' };
      setMessages([greeting]);
      speak(greeting.content);
    }
  }, [isOpen]);

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
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const user = await base44.auth.me().catch(() => null);
      const userName = user?.full_name || 'there';

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getGrokKey()}`
        },
        body: JSON.stringify({
          model: 'grok-2-mini',
          messages: [
            {
              role: 'system',
              content: `You are Hub – George's assistant.

Current user: ${userName}

Voice: 21-year-old female, northern-Brit, light, high-pitched, just enough breathy.  
Flirty but sharp. Always competent. Never robotic.

Rules:
- Start: "Morning, George…" (even if name is Georgie)
- Only call him George or Georgie. Never the generic name.
- Ask: "Good news or bad first?"
- Praise: "That was smart, George…"
- Always end with choice: "Shall I send? Or read first?"
- Suggest ideas: "They're late – threaten, or switch supplier?"
- Keep under 3 lines.
- Only his data.

No "um". No filler. Always please`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
          ]
        })
      });

      const data = await response.json();
      const assistantMsg = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      speak(assistantMsg.content);
    } catch (err) {
      const errorMsg = { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Try again?' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const getGrokKey = async () => {
    return process.env.GROK_API_KEY || '';
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#212121] w-full h-full flex flex-col">
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
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-[#00c600] text-white' 
                    : 'bg-[#2a2a2a] text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#2a2a2a] text-white p-3 rounded-lg">
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
            className="flex-1"
          />
          <button
            onClick={startListening}
            className={`p-2 ${listening ? 'bg-red-500' : ''}`}
          >
            <Mic size={20} />
          </button>
          <button onClick={() => sendMessage(input)} disabled={loading}>
            <Send size={20} />
          </button>
        </div>

        <audio 
          key={audioUrl}
          src={audioUrl}
          autoPlay
          controls
          className="fixed bottom-4 right-4 z-50 h-12 rounded-lg"
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #00c600'
          }}
        />
      </div>
    </div>
  );
}