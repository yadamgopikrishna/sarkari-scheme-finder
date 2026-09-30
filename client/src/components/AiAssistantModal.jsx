import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ExternalLink, RefreshCw, Trash2, HelpCircle, User, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

/**
 * Lightweight helper to render markdown links [text](url) and bold **text** safely
 */
function renderFormattedMessage(content) {
  if (!content) return null;

  const paragraphs = content.split('\n');

  return paragraphs.map((para, pIdx) => {
    if (!para.trim()) return <div key={pIdx} className="h-1.5" />;

    const isHeading = para.startsWith('### ') || para.startsWith('## ');
    const headingText = isHeading ? para.replace(/^#+\s*/, '') : null;

    const isBullet = para.startsWith('• ') || para.startsWith('* ') || para.startsWith('- ');
    const cleanText = isHeading ? headingText : (isBullet ? para.substring(2) : para);

    const parts = [];
    let remaining = cleanText;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      let firstMatch = null;
      let matchType = null;
      let minIndex = remaining.length;

      if (linkMatch && linkMatch.index < minIndex) {
        minIndex = linkMatch.index;
        firstMatch = linkMatch;
        matchType = 'link';
      }
      if (boldMatch && boldMatch.index < minIndex) {
        minIndex = boldMatch.index;
        firstMatch = boldMatch;
        matchType = 'bold';
      }
      if (codeMatch && codeMatch.index < minIndex) {
        minIndex = codeMatch.index;
        firstMatch = codeMatch;
        matchType = 'code';
      }

      if (!firstMatch) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (firstMatch.index > 0) {
        parts.push(<span key={keyIdx++}>{remaining.substring(0, firstMatch.index)}</span>);
      }

      if (matchType === 'link') {
        parts.push(
          <a
            key={keyIdx++}
            href={firstMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline font-semibold inline-flex items-center gap-0.5"
          >
            {firstMatch[1]}
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
        remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
      } else if (matchType === 'bold') {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-slate-900">
            {firstMatch[1]}
          </strong>
        );
        remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
      } else if (matchType === 'code') {
        parts.push(
          <code key={keyIdx++} className="px-1 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
            {firstMatch[1]}
          </code>
        );
        remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
      }
    }

    if (isHeading) {
      return (
        <div key={pIdx} className="font-bold text-xs text-orange-950 mt-2 mb-1 flex items-center gap-1">
          {parts}
        </div>
      );
    }

    if (isBullet) {
      return (
        <div key={pIdx} className="flex items-start gap-1.5 my-0.5 ml-1">
          <span className="text-orange-600 font-bold shrink-0">•</span>
          <span className="flex-1">{parts}</span>
        </div>
      );
    }

    return (
      <p key={pIdx} className="my-1">
        {parts}
      </p>
    );
  });
}

export default function AiAssistantModal() {
  const { isAuthenticated, requireAuth } = useAuth();
  const { currentLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const initialMessage = {
    sender: 'assistant',
    text: `🙏 **Namaste! I'm your Sarkari Scheme Assistant AI.**

Think of me like **ChatGPT for Indian Government Schemes**! I can have a natural, friendly conversation with you to find welfare schemes, explain age & income criteria, give you document checklists, and walk you through how to apply online or offline.

**Feel free to ask me in plain words:**
• *"I am a farmer from Andhra Pradesh looking for crop assistance."*
• *"Scholarships and fee reimbursement for college students."*
• *"How do I check my eligibility using the 7-step wizard?"*
• *"What documents do I need to prepare before applying?"*
• *"Tell me about Ayushman Bharat health card benefits."*

How can I help you or your family today?`,
    matchedSchemes: [],
    suggestedPrompts: [
      'How do I check my eligibility?',
      'What documents are required?',
      'Schemes for farmers in AP',
      'Scholarships for college students',
    ],
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [activePrompts, setActivePrompts] = useState(initialMessage.suggestedPrompts);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleToggle = () => {
    // If not authenticated, trigger the login warning modal!
    if (!isAuthenticated) {
      requireAuth('AI Scheme Assistant Chat');
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
    setActivePrompts(initialMessage.suggestedPrompts);
  };

  const handleSend = async (queryText) => {
    // Extra safety: ensure user is authenticated
    if (!isAuthenticated) {
      requireAuth('AI Scheme Assistant Chat');
      return;
    }

    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.post('/chat', {
        message: text,
        language: currentLang,
        conversationHistory,
      });

      if (res.data.success) {
        const replyData = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: replyData.reply,
            matchedSchemes: replyData.matchedSchemes || [],
          },
        ]);
        if (replyData.suggestedPrompts && replyData.suggestedPrompts.length > 0) {
          setActivePrompts(replyData.suggestedPrompts);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I apologize, but I encountered an issue retrieving verified scheme records right now. Please try asking again or browse our scheme directory directly.',
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
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full shadow-2xl hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-300"
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
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[460px] max-h-[660px] h-[84vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-sarkari-navy text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Scheme Assistant AI
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    ChatGPT Style
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Friendly welfare advisor • Multi-turn conversational</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Restart Conversation"
                aria-label="Restart conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          {activePrompts && activePrompts.length > 0 && (
            <div className="p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
              {activePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors shrink-0 font-medium flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-sarkari-navy border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%]`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-orange-600 text-white rounded-tr-none shadow-xs font-medium'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                    }`}
                  >
                    {m.sender === 'user' ? m.text : renderFormattedMessage(m.text)}
                  </div>

                  {/* Grounded scheme cards attachment */}
                  {m.matchedSchemes && m.matchedSchemes.length > 0 && (
                    <div className="mt-2 space-y-1.5 w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Verified Government Scheme Links:
                      </span>
                      {m.matchedSchemes.map((sc) => (
                        <div
                          key={sc._id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-orange-300 hover:shadow-xs transition-all"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <span className="font-bold text-slate-800 line-clamp-1">{sc.schemeName}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {sc.governmentLevel} Govt • {sc.category}
                            </span>
                          </div>
                          <a
                            href={sc.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                          >
                            Apply <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-sarkari-navy border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-xs py-2.5 px-3.5 bg-white rounded-2xl rounded-tl-none border border-slate-200 shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span className="animate-pulse">Assistant is thinking & checking verified criteria...</span>
                </div>
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
              placeholder="Ask anything naturally (like ChatGPT)..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-colors focus:outline-none shadow-sm"
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
