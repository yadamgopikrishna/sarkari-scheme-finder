import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function AiAssistantModal() {
  const { currentLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am your Sarkari Scheme Assistant AI. Tell me about yourself (such as your age, state, occupation, and income), or ask any question about government schemes.',
      matchedSchemes: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'I am a 65-year-old farmer from Andhra Pradesh with an income of ₹80,000.',
    'Scholarships and fee reimbursement for female college students in AP.',
    'Health insurance schemes for BPL families.',
    'Collateral-free loans for street vendors and MSMEs.',
  ];

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        language: currentLang,
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.data.reply,
            matchedSchemes: res.data.data.matchedSchemes || [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an issue retrieving verified scheme records. Please try again or browse our scheme directory directly.',
          matchedSchemes: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full shadow-2xl hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-300"
        aria-label="Open Scheme Assistant AI"
      >
        <div className="relative">
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
        </div>
        <span className="text-xs font-extrabold tracking-wide hidden sm:inline">Scheme Assistant AI</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[600px] h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-sarkari-navy text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Scheme Assistant AI
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    Grounded
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Powered by verified MongoDB scheme database</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors shrink-0"
              >
                {prompt.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-orange-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Grounded scheme cards attachment */}
                {m.matchedSchemes && m.matchedSchemes.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full max-w-[90%]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Links from Database:
                    </span>
                    {m.matchedSchemes.map((sc) => (
                      <div
                        key={sc._id}
                        className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:border-orange-300"
                      >
                        <span className="font-semibold text-slate-800 line-clamp-1">{sc.schemeName}</span>
                        <a
                          href={sc.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline font-bold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 bg-white px-3 rounded-xl border border-slate-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>Checking verified criteria in MongoDB...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about schemes or state rules..."
              className="flex-1 px-3 py-2 text-xs bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-colors focus:outline-none shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
