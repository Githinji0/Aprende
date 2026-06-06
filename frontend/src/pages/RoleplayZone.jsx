import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, Globe, Eye, EyeOff, RotateCcw, AlertCircle } from 'lucide-react';
import AudioSpeaker from '../components/AudioSpeaker';

const RoleplayZone = ({ token }) => {
  const [scenario, setScenario] = useState('waiter');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Setup initial message when scenario changes
  useEffect(() => {
    resetChat();
  }, [scenario]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const resetChat = () => {
    let initialGreeting = '';
    
    if (scenario === 'waiter') {
      initialGreeting = '¡Hola! Bienvenidos a Casa Botín. ¿Qué les pongo de beber? [Hello! Welcome to Casa Botín. What can I get you to drink?]';
    } else if (scenario === 'receptionist') {
      initialGreeting = 'Buenos días. Bienvenido al Hotel Sol y Mar. ¿Tiene una reserva con nosotros? [Good morning. Welcome to Hotel Sol y Mar. Do you have a reservation with us?]';
    } else if (scenario === 'market') {
      initialGreeting = '¡Buenas tardes, marchante! Pase por aquí. ¿Qué frutas o verduras frescas le andaba buscando hoy? [Good afternoon, customer! Come on in. What fresh fruits or vegetables were you looking for today?]';
    }

    setMessages([
      {
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  // Helper to split Spanish response and bracketed English translation
  const parseAiResponse = (text) => {
    const regex = /(.*?)\s*\[(.*?)\]\s*$/s;
    const match = text.match(regex);
    
    if (match) {
      return {
        spanish: match[1].trim(),
        english: match[2].trim(),
        showTranslation: false
      };
    }
    
    // Fallback if brackets are missing
    return {
      spanish: text,
      english: '',
      showTranslation: false
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg = userInput.trim();
    setUserInput('');
    setError('');
    
    // Optimistic UI Update: append user message immediately
    const updatedMessages = [
      ...messages,
      {
        role: 'user',
        content: userMsg,
        timestamp: new Date()
      }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map message log to chat history for model context
      const chatHistory = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userMessage: userMsg,
          chatHistory: chatHistory,
          scenario: scenario
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to receive AI message.');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        }
      ]);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle translation view on specific messages
  const toggleTranslation = (index) => {
    setMessages(prev => 
      prev.map((msg, idx) => {
        if (idx === index) {
          return {
            ...msg,
            showTranslation: !msg.showTranslation
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in flex flex-col gap-6">
      
      {/* Scenario Selection Header */}
      <div className="glass-card p-5 rounded-3xl border border-white/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-brand-900">Zona de Inteligencia Artificial</h1>
          <p className="text-xs text-brand-500 mt-0.5">
            Roleplay travel scenarios with Gemini. Respond in Spanish, and learn from mistakes!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Selection */}
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="p-3 bg-brand-100 hover:bg-brand-200 border border-brand-300 rounded-2xl text-sm font-bold text-brand-800 outline-none focus:border-accent-indigo cursor-pointer transition-all duration-200"
          >
            <option value="waiter">🍽️ Casa Botín (Waiter - Madrid)</option>
            <option value="receptionist">🏨 Hotel Sol y Mar (Receptionist - Cancun)</option>
            <option value="market">🛍️ Mercado local (Fruit Vendor - Buenos Aires)</option>
          </select>

          {/* Reset button */}
          <button
            onClick={resetChat}
            className="p-3 bg-brand-100 hover:bg-red-50 text-brand-600 hover:text-red-500 rounded-2xl border border-brand-300 hover:border-red-200 transition-all duration-200 focus:outline-none"
            title="Reset conversation"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Error connecting to Gemini: {error}</span>
        </div>
      )}

      {/* Chat Messages Panel */}
      <div className="glass-card flex-1 min-h-[420px] max-h-[500px] border border-white/40 rounded-3xl shadow-xl flex flex-col overflow-hidden bg-white/50">
        
        {/* Chat log */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          
          {messages.map((msg, idx) => {
            const isAi = msg.role === 'assistant';
            const parsed = isAi ? parseAiResponse(msg.content) : null;
            const hasTranslation = parsed && parsed.english;

            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  isAi ? 'self-start items-start' : 'self-end items-end'
                } animate-fade-in`}
              >
                {/* Bubble Container */}
                <div className={`p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm border ${
                  isAi
                    ? 'bg-white border-brand-200 text-brand-900 rounded-tl-none'
                    : 'bg-accent-indigo border-indigo-500 text-white rounded-tr-none'
                }`}>
                  
                  {/* Spoken Spanish Sentence */}
                  <span className="font-semibold text-sm leading-relaxed">
                    {isAi ? parsed.spanish : msg.content}
                  </span>

                  {/* AI Translation section */}
                  {isAi && hasTranslation && (
                    <div className="flex flex-col gap-1 border-t border-brand-200/50 pt-1.5 mt-0.5">
                      {/* Show/Hide translation toggle */}
                      {msg.showTranslation ? (
                        <p className="text-xs text-brand-500 font-medium italic animate-fade-in">
                          {parsed.english}
                        </p>
                      ) : null}

                      <button
                        onClick={() => toggleTranslation(idx)}
                        className="text-[10px] text-accent-indigo hover:text-accent-violet font-extrabold flex items-center gap-1 mt-1 focus:outline-none"
                      >
                        {msg.showTranslation ? (
                          <>
                            <EyeOff size={12} />
                            <span>Hide Translation</span>
                          </>
                        ) : (
                          <>
                            <Eye size={12} />
                            <span>Show Translation</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>

                {/* Bubble Footer tools (like TTS for AI message) */}
                {isAi && (
                  <div className="flex items-center gap-2 mt-1.5 ml-2">
                    <AudioSpeaker 
                      text={parsed.spanish} 
                      lang={scenario === 'receptionist' ? 'es-MX' : scenario === 'waiter' ? 'es-ES' : 'es-AR'} 
                      size={14} 
                      className="p-1.5"
                    />
                    <span className="text-[10px] text-brand-400 font-medium">
                      Listen
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing state loading placeholder */}
          {loading && (
            <div className="flex flex-col max-w-[80%] self-start items-start animate-pulse">
              <div className="p-4 rounded-2xl bg-white border border-brand-200 text-brand-900 rounded-tl-none flex items-center gap-1.5">
                <span className="text-xs text-brand-400 font-bold">Gemini is typing</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          className="p-4 bg-brand-100/30 border-t border-brand-200/80 flex items-center gap-3"
        >
          <input
            type="text"
            disabled={loading}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Responde en español a la simulación..."
            className="flex-1 p-3.5 bg-white border border-brand-200 focus:border-accent-indigo outline-none focus:ring-2 focus:ring-indigo-100 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-75"
          />

          <button
            type="submit"
            disabled={!userInput.trim() || loading}
            className="p-3.5 bg-accent-indigo hover:bg-indigo-600 disabled:opacity-50 disabled:pointer-events-none text-white rounded-2xl shadow-md shadow-indigo-200 transition-all duration-200 focus:outline-none"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default RoleplayZone;
