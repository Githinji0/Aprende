import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, Globe, Eye, EyeOff, RotateCcw, AlertCircle, ChevronDown, Utensils, Hotel, ShoppingBag } from 'lucide-react';
import AudioSpeaker from '../components/AudioSpeaker';
import { ChatBubble, TypingBubble, parseBoldText, THEMES } from '../components/ChatSequence';

const getScenarioCharacter = (scenarioKey) => {
  if (scenarioKey === 'receptionist') {
    return {
      name: 'Sofía',
      role: 'Recepcionista',
      avatar: '/avatars/sofia.png',
      shortName: 'Sofía'
    };
  }
  if (scenarioKey === 'market') {
    return {
      name: 'Lucas',
      role: 'Vendedor',
      avatar: '/avatars/lucas.png',
      shortName: 'Lucas'
    };
  }
  // Default: waiter
  return {
    name: 'Mateo',
    role: 'Camarero',
    avatar: '/avatars/mateo.png',
    shortName: 'Mateo'
  };
};

const scenarios = [
  {
    value: 'waiter',
    label: 'Casa Botín (Mateo, Camarero - Madrid)',
    icon: Utensils
  },
  {
    value: 'receptionist',
    label: 'Hotel Sol y Mar (Sofía, Recepcionista - Cancún)',
    icon: Hotel
  },
  {
    value: 'market',
    label: 'Mercado local (Lucas, Vendedor - Buenos Aires)',
    icon: ShoppingBag
  }
];

const RoleplayZone = ({ token }) => {
  const [scenario, setScenario] = useState('waiter');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatTheme, setChatTheme] = useState('Espana');
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      initialGreeting = '¡Hola! Soy Mateo, tu camarero en Casa Botín. ¿Qué les pongo de beber? [Hello! I am Mateo, your waiter at Casa Botín. What can I get you to drink?]';
    } else if (scenario === 'receptionist') {
      initialGreeting = 'Buenos días. Soy Sofía, tu recepcionista en el Hotel Sol y Mar. ¿Tiene una reserva con nosotros? [Good morning. I am Sofía, your receptionist at Hotel Sol y Mar. Do you have a reservation with us?]';
    } else if (scenario === 'market') {
      initialGreeting = '¡Buenas tardes! Soy Lucas, tu vendedor aquí en el mercado. Pase por aquí. ¿Qué frutas o verduras frescas le andaba buscando hoy? [Good afternoon! I am Lucas, your vendor here at the market. Come on in. What fresh fruits or vegetables were you looking for today?]';
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
      <div className="glass-card p-5 rounded-3xl border border-white/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative z-30">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-brand-900">AI Roleplay Zone</h1>
          <p className="text-xs text-brand-500 mt-0.5">
            Roleplay travel scenarios with Gemini. Respond in Spanish, and learn from mistakes!
          </p>
        </div>

        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          {/* Custom Premium Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-5 py-3 bg-brand-100 hover:bg-brand-200 border border-brand-300 rounded-2xl text-sm font-bold text-brand-850 outline-none focus:border-accent-indigo transition-all duration-200 shadow-sm"
            >
              {(() => {
                const active = scenarios.find(s => s.value === scenario);
                const ActiveIcon = active?.icon || Utensils;
                return (
                  <>
                    <ActiveIcon size={16} className="text-accent-indigo shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-[240px]">{active?.label}</span>
                  </>
                );
              })()}
              <ChevronDown size={16} className={`text-brand-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-brand-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in">
                {scenarios.map((sc) => {
                  const ScIcon = sc.icon;
                  const isSelected = sc.value === scenario;
                  return (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => {
                        setScenario(sc.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition-all duration-150 ${
                        isSelected 
                          ? 'bg-indigo-50/70 text-accent-indigo' 
                          : 'text-brand-700 hover:bg-brand-50 hover:text-brand-900'
                      }`}
                    >
                      <ScIcon size={16} className={isSelected ? 'text-accent-indigo' : 'text-brand-400'} />
                      <span>{sc.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={resetChat}
            className="p-3 bg-brand-100 hover:bg-red-50 text-brand-600 hover:text-red-500 rounded-2xl border border-brand-300 hover:border-red-200 transition-all duration-200 focus:outline-none shrink-0"
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
        
        {/* Chat Header / Theme Selector */}
        <div className="px-6 py-3 border-b border-brand-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-brand-800">
              Conversación con {getScenarioCharacter(scenario).name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Chat Theme:</span>
            <div className="flex bg-brand-100 p-0.5 rounded-xl border border-brand-200/80 shadow-inner">
              {Object.keys(THEMES).map((themeKey) => (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setChatTheme(themeKey)}
                  className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all duration-200 ${
                    chatTheme === themeKey
                      ? 'bg-espana-red text-white shadow-sm'
                      : 'text-brand-700 hover:text-brand-900 hover:bg-brand-50/50'
                  }`}
                >
                  {themeKey === 'Espana' ? 'España' : themeKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat log */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          
          {messages.map((msg, idx) => {
            const isAi = msg.role === 'assistant';
            const parsed = isAi ? parseAiResponse(msg.content) : null;
            const hasTranslation = parsed && parsed.english;
            const character = getScenarioCharacter(scenario);

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 w-full max-w-[85%] md:max-w-[80%] ${
                  isAi ? 'self-start flex-row' : 'self-end flex-row-reverse'
                } animate-fade-in`}
              >
                {/* Avatar Badge */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border overflow-hidden shadow-sm bg-brand-50 flex items-center justify-center ${
                    isAi ? 'border-brand-200' : 'border-indigo-200'
                  }`}>
                    <img 
                      src={isAi ? character.avatar : '/avatars/user.png'} 
                      alt={isAi ? character.name : 'You'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Pulsing online status indicator for active AI character */}
                    {isAi && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-[9px] font-extrabold text-brand-400 mt-1 uppercase tracking-wider select-none">
                    {isAi ? character.shortName : 'You'}
                  </span>
                </div>

                {/* Content block */}
                <div className={`flex flex-col flex-1 min-w-0 ${isAi ? 'items-start' : 'items-end'}`}>
                  {/* Bubble Container */}
                  <ChatBubble sender={!isAi} theme={chatTheme}>
                    
                    {/* Spoken Spanish Sentence */}
                    <span className="font-semibold text-sm leading-relaxed">
                      {isAi ? parseBoldText(parsed.spanish) : parseBoldText(msg.content)}
                    </span>

                    {/* AI Translation section */}
                    {isAi && hasTranslation && (
                      <div className="flex flex-col gap-1 border-t border-brand-200/50 pt-1.5 mt-0.5">
                        {msg.showTranslation ? (
                          <p className="text-xs text-brand-500 font-medium italic animate-fade-in">
                            {parseBoldText(parsed.english)}
                          </p>
                        ) : null}

                        <button
                          onClick={() => toggleTranslation(idx)}
                          className={`text-[10px] font-extrabold flex items-center gap-1 mt-1 focus:outline-none ${
                            chatTheme === 'Espana' ? 'text-accent-indigo hover:text-accent-violet' :
                            chatTheme === 'WhatsApp' ? 'text-emerald-600 hover:text-emerald-800' :
                            chatTheme === 'iMessage' ? 'text-blue-600 hover:text-blue-800' :
                            'text-sky-500 hover:text-sky-700'
                          }`}
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

                  </ChatBubble>

                  {/* Bubble Footer tools (TTS for AI message) */}
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

              </div>
            );
          })}

          {/* Typing state loading placeholder */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%] md:max-w-[80%] self-start flex-row animate-fade-in">
              {/* Avatar Badge */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full border border-brand-200 overflow-hidden shadow-sm bg-brand-50 flex items-center justify-center">
                  <img 
                    src={getScenarioCharacter(scenario).avatar} 
                    alt={getScenarioCharacter(scenario).name} 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                </div>
                <span className="text-[9px] font-extrabold text-brand-400 mt-1 uppercase tracking-wider select-none">
                  {getScenarioCharacter(scenario).shortName}
                </span>
              </div>

              {/* Typing Bubble */}
              <TypingBubble theme={chatTheme} />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          className="p-4 bg-brand-100/30 border-t border-brand-200/80 flex flex-col gap-3"
        >
          {/* Onscreen Spanish Accents & Punctuation Helpers */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pb-1 select-none">
            {['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'].map(char => (
              <button
                key={char}
                type="button"
                disabled={loading}
                onClick={() => setUserInput(prev => prev + char)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-brand-100 border border-brand-200 text-sm font-bold text-brand-800 transition-colors shadow-sm focus:outline-none disabled:opacity-50"
              >
                {char}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full">
            <input
              type="text"
              disabled={loading}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Reply in Spanish to the simulation..."
              className="flex-1 p-3.5 bg-white border border-brand-200 focus:border-accent-indigo outline-none focus:ring-2 focus:ring-indigo-100 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-75"
            />

            <button
              type="submit"
              disabled={!userInput.trim() || loading}
              className="p-3.5 bg-accent-indigo hover:bg-indigo-600 disabled:opacity-50 disabled:pointer-events-none text-white rounded-2xl shadow-md shadow-indigo-200 transition-all duration-200 focus:outline-none"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RoleplayZone;
