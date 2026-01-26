import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Hub({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = { role: 'assistant', content: 'Good evening. Ready when you are.' };
      setMessages([greeting]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const user = await base44.auth.me().catch(() => null);
      const userName = user?.full_name || 'there';

      const response = await base44.functions.invoke('grokChat', {
        messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: text }]),
        userName
      });

      const assistantMsg = { 
        role: 'assistant', 
        content: response.data.content 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Try again?' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setLoading(false);
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
            onClick={() => sendMessage(input)} 
            disabled={loading}
            style={{ borderRadius: '6px' }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}