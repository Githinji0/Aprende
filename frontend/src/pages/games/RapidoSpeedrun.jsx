import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Timer, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { PixelCTAButton } from '../../components/PixelCTAButton';

const VOCAB_LEVEL_1 = [
  { prompt: 'Water 💧', correct: 'Agua', incorrect: 'Leche' },
  { prompt: 'Dog 🐕', correct: 'Perro', incorrect: 'Gato' },
  { prompt: 'Cat 🐈', correct: 'Gato', incorrect: 'Pájaro' },
  { prompt: 'House 🏠', correct: 'Casa', incorrect: 'Hotel' },
  { prompt: 'Apple 🍎', correct: 'Manzana', incorrect: 'Plátano' },
  { prompt: 'Milk 🥛', correct: 'Leche', incorrect: 'Agua' },
  { prompt: 'Boy 👦', correct: 'Niño', incorrect: 'Niña' },
  { prompt: 'Girl 👧', correct: 'Niña', incorrect: 'Niño' },
  { prompt: 'Sun ☀️', correct: 'Sol', incorrect: 'Luna' },
  { prompt: 'Moon 🌙', correct: 'Luna', incorrect: 'Sol' },
  { prompt: 'Thank you 🙏', correct: 'Gracias', incorrect: 'De nada' },
  { prompt: 'Hello 👋', correct: 'Hola', incorrect: 'Adiós' },
  { prompt: 'Goodbye 👋', correct: 'Adiós', incorrect: 'Hola' },
  { prompt: 'Bread 🍞', correct: 'Pan', incorrect: 'Queso' },
  { prompt: 'Cheese 🧀', correct: 'Queso', incorrect: 'Pan' }
];

const VOCAB_LEVEL_2 = [
  { prompt: 'Book 📖', correct: 'Libro', incorrect: 'Bolígrafo' },
  { prompt: 'Car 🚗', correct: 'Coche', incorrect: 'Tren' },
  { prompt: 'Friend 🤝', correct: 'Amigo', incorrect: 'Enemigo' },
  { prompt: 'Red 🔴', correct: 'Rojo', incorrect: 'Azul' },
  { prompt: 'Blue 🔵', correct: 'Azul', incorrect: 'Rojo' },
  { prompt: 'Big 🐘', correct: 'Grande', incorrect: 'Pequeño' },
  { prompt: 'Small 🐭', correct: 'Pequeño', incorrect: 'Grande' },
  { prompt: 'To run 🏃', correct: 'Correr', incorrect: 'Caminar' },
  { prompt: 'To eat 🍽️', correct: 'Comer', incorrect: 'Beber' },
  { prompt: 'To drink 🥤', correct: 'Beber', incorrect: 'Comer' },
  { prompt: 'Five 5️⃣', correct: 'Cinco', incorrect: 'Cuatro' },
  { prompt: 'Ten 🔟', correct: 'Diez', incorrect: 'Nueve' },
  { prompt: 'Beautiful 🌸', correct: 'Bonito', incorrect: 'Feo' },
  { prompt: 'Noisy 📢', correct: 'Ruidoso', incorrect: 'Tranquilo' },
  { prompt: 'Quiet 🤫', correct: 'Tranquilo', incorrect: 'Ruidoso' }
];

const VOCAB_LEVEL_3 = [
  { prompt: 'Near 📍', correct: 'Cerca', incorrect: 'Lejos' },
  { prompt: 'Far 🗺️', correct: 'Lejos', incorrect: 'Cerca' },
  { prompt: 'Next to 👥', correct: 'Al lado', incorrect: 'Enfrente' },
  { prompt: 'Opposite 🔄', correct: 'Enfrente', incorrect: 'Al lado' },
  { prompt: 'Excuse me 🙋', correct: 'Perdón', incorrect: 'Gracias' },
  { prompt: 'I am lost 🗺️', correct: 'Estoy perdido', incorrect: 'Estoy cansado' },
  { prompt: 'Turn right ↪️', correct: 'Gira a la derecha', incorrect: 'Gira a la izquierda' },
  { prompt: 'Turn left ↩️', correct: 'Gira a la izquierda', incorrect: 'Gira a la derecha' },
  { prompt: 'Go straight ⬆️', correct: 'Sigue recto', incorrect: 'Cruza la calle' },
  { prompt: 'Supermarket 🛒', correct: 'Supermercado', incorrect: 'Biblioteca' },
  { prompt: 'Bakery 🥖', correct: 'Panadería', incorrect: 'Frutería' },
  { prompt: 'Hospital 🏥', correct: 'Hospital', incorrect: 'Hotel' },
  { prompt: 'Excuse me, sir 🤵', correct: 'Disculpe, señor', incorrect: 'Buenas noches' },
  { prompt: 'Many shops 🛍️', correct: 'Muchas tiendas', incorrect: 'Mucho tráfico' },
  { prompt: 'There is 📦', correct: 'Hay', incorrect: 'Está' }
];

const LEVEL_CONFIGS = {
  1: {
    id: 1,
    name: 'Principiante',
    englishName: 'Beginner',
    description: 'Basic nouns & greetings to test fundamental vocabulary.',
    vocab: VOCAB_LEVEL_1,
    timeLimit: 6000,
    cardCount: 8,
    xpReward: 100,
    themeColor: 'emerald',
    cardStyle: 'bg-emerald-50/80 border-emerald-200 text-emerald-800',
    btnStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
  },
  2: {
    id: 2,
    name: 'Intermedio',
    englishName: 'Intermediate',
    description: 'Adjectives, common verbs, and numbers under medium time pressure.',
    vocab: VOCAB_LEVEL_2,
    timeLimit: 4000,
    cardCount: 10,
    xpReward: 150,
    themeColor: 'orange',
    cardStyle: 'bg-orange-50/80 border-orange-200 text-orange-800',
    btnStyle: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100'
  },
  3: {
    id: 3,
    name: 'Avanzado',
    englishName: 'Advanced',
    description: 'Conversational phrases and directional cues under rapid-fire limits.',
    vocab: VOCAB_LEVEL_3,
    timeLimit: 3000,
    cardCount: 12,
    xpReward: 200,
    themeColor: 'purple',
    cardStyle: 'bg-purple-50/80 border-purple-200 text-purple-800',
    btnStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100'
  }
};

const RapidoSpeedrun = ({ onBack, onGameComplete }) => {
  const [screenState, setScreenState] = useState('level-select'); // 'level-select' | 'countdown' | 'playing' | 'game-over'
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [countdownVal, setCountdownVal] = useState(3);

  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5000);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | 'timeout'
  
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const selectLevel = (levelId) => {
    setSelectedLevelId(levelId);
    setScreenState('countdown');
    setCountdownVal(3);
    
    let currentVal = 3;
    const interval = setInterval(() => {
      currentVal -= 1;
      if (currentVal === 0) {
        clearInterval(interval);
        setScreenState('playing');
        startNewGame(levelId);
      } else {
        setCountdownVal(currentVal);
      }
    }, 1000);
  };

  const startNewGame = (levelId) => {
    const config = LEVEL_CONFIGS[levelId];
    const shuffled = [...config.vocab].sort(() => 0.5 - Math.random()).slice(0, config.cardCount);
    setDeck(shuffled);
    setCurrentIndex(0);
    setMistakes(0);
    setSuccessCount(0);
    setStreak(0);
    setMaxStreak(0);
    setupCard(shuffled[0], config.timeLimit);
  };

  const setupCard = (card, timeLimit) => {
    setFeedback(null);
    setTimeLeft(timeLimit);
    
    // Shuffle options
    const shufOpts = [card.correct, card.incorrect].sort(() => 0.5 - Math.random());
    setOptions(shufOpts);

    // Start timer interval
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  };

  const handleTimeout = () => {
    setFeedback('timeout');
    setMistakes(prev => prev + 1);
    setStreak(0);
    setTimeout(() => {
      advanceRound();
    }, 1200);
  };

  const handleAnswer = (selectedOption) => {
    if (feedback) return; // Ignore input during feedback display
    clearInterval(timerRef.current);

    const card = deck[currentIndex];
    const config = LEVEL_CONFIGS[selectedLevelId];

    if (selectedOption === card.correct) {
      setFeedback('correct');
      setSuccessCount(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      setTimeout(() => {
        advanceRound();
      }, 800);
    } else {
      setFeedback('incorrect');
      setMistakes(prev => prev + 1);
      setStreak(0);
      setTimeout(() => {
        advanceRound();
      }, 1200);
    }
  };

  const advanceRound = () => {
    const config = LEVEL_CONFIGS[selectedLevelId];
    if (currentIndex + 1 >= deck.length) {
      setScreenState('game-over');
      onGameComplete(config.xpReward);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setupCard(deck[nextIndex], config.timeLimit);
    }
  };

  const activeConfig = selectedLevelId ? LEVEL_CONFIGS[selectedLevelId] : null;
  const currentCard = deck[currentIndex];
  const progressPercent = activeConfig ? (timeLeft / activeConfig.timeLimit) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 text-espana-charcoal">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-brand-200 pb-4">
        <button
          onClick={screenState === 'playing' || screenState === 'game-over' ? () => setScreenState('level-select') : onBack}
          className="flex items-center gap-1.5 text-xs font-extrabold text-espana-red hover:opacity-85 transition-opacity uppercase tracking-wider focus:outline-none"
        >
          <ArrowLeft size={14} />
          <span>{screenState === 'playing' || screenState === 'game-over' ? 'Volver a Niveles' : 'Volver al Hub de Juegos'}</span>
        </button>
        <span className="text-xs font-extrabold bg-espana-gold text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider">
          ¡Rápido!
        </span>
      </div>

      {screenState === 'level-select' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-black tracking-tight">Selecciona tu Nivel</h2>
            <p className="text-xs text-brand-650 font-semibold leading-relaxed">
              Choose a speedrun level. Harder levels feature shorter timers, more flashcards, and richer rewards!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
            {Object.values(LEVEL_CONFIGS).map((cfg) => (
              <div 
                key={cfg.id}
                className="glass-card hover:bg-white/90 border border-white/50 p-6 rounded-[2rem] flex flex-col justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.cardStyle}`}>
                      Level {cfg.id}
                    </span>
                    <span className="text-xs font-extrabold text-espana-red">+{cfg.xpReward} XP</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-black text-espana-charcoal leading-tight">
                      {cfg.name}
                    </h3>
                    <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wider leading-none">
                      {cfg.englishName}
                    </span>
                    <p className="text-xs text-brand-500 font-semibold leading-relaxed mt-2">
                      {cfg.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-brand-100 pt-3 text-[11px] font-bold text-brand-600">
                    <div className="flex justify-between">
                      <span>Time per card:</span>
                      <strong className="text-espana-charcoal">{cfg.timeLimit / 1000} seconds</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total cards:</span>
                      <strong className="text-espana-charcoal">{cfg.cardCount} words</strong>
                    </div>
                  </div>
                </div>

                <PixelCTAButton
                  onClick={() => selectLevel(cfg.id)}
                  className={`w-full py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 outline-none ${cfg.btnStyle}`}
                >
                  <span>Start Level</span>
                  <ArrowRight size={13} />
                </PixelCTAButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {screenState === 'countdown' && (
        <div className="flex flex-col items-center justify-center min-h-[300px] animate-fade-in text-center">
          <div className="w-24 h-24 rounded-full bg-espana-gold border border-amber-300 flex items-center justify-center text-slate-900 shadow-lg mb-4">
            <Timer size={44} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-espana-charcoal">Get ready for translation!</h2>
          <div className="text-7xl font-black text-espana-red mt-4 animate-bounce">
            {countdownVal}
          </div>
        </div>
      )}

      {screenState === 'playing' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Stats & Streak Combo Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold shadow-sm">
            <span className="text-brand-500">
              Progress: <strong className="text-espana-charcoal">{currentIndex + 1} / {deck.length}</strong> ({activeConfig?.name})
            </span>
            
            {/* Combo Streak Indicator */}
            {streak >= 3 && (
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider animate-bounce">
                <Zap size={10} className="fill-white" />
                <span>COMBO x{streak >= 7 ? 3 : 2}</span>
              </div>
            )}

            <span className="text-brand-500">Current Streak: <strong className="text-orange-500">{streak} 🔥</strong></span>
          </div>

          {/* Time Countdown Bar */}
          <div className="w-full bg-brand-100 rounded-full h-3 overflow-hidden border border-brand-200 relative">
            <div 
              className={`h-full transition-all duration-100 ${
                progressPercent > 50 ? 'bg-emerald-500' : progressPercent > 20 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Card Presentation workspace */}
          <div className="bg-white/70 border border-brand-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[160px] relative shadow-sm">
            {feedback === 'correct' && (
              <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl flex items-center justify-center z-10 pointer-events-none border border-emerald-500">
                <span className="text-emerald-600 font-black text-2xl animate-bubble-pop">¡CORRECTO!</span>
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="absolute inset-0 bg-red-500/10 rounded-3xl flex items-center justify-center z-10 pointer-events-none border border-red-500">
                <span className="text-red-600 font-black text-2xl animate-shake">INCORRECTO</span>
              </div>
            )}
            {feedback === 'timeout' && (
              <div className="absolute inset-0 bg-orange-500/10 rounded-3xl flex items-center justify-center z-10 pointer-events-none border border-orange-500">
                <span className="text-orange-600 font-black text-2xl animate-pulse">¡TIEMPO AGOTADO!</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1 select-none">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">English Word</span>
              <h3 className="text-4xl font-black text-espana-charcoal tracking-wide mt-2">{currentCard?.prompt}</h3>
            </div>
          </div>

          {/* Answer Options button choices */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleAnswer(opt)}
                className={`py-5 text-sm font-black uppercase tracking-wider rounded-2xl shadow-sm border transition-all active:scale-95 flex items-center justify-center ${
                  feedback !== null 
                    ? opt === currentCard?.correct 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : feedback === 'incorrect'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-brand-100 border-brand-200 text-brand-300'
                    : 'bg-white hover:bg-brand-50 border-brand-200 text-espana-charcoal hover:border-espana-red hover:text-espana-red'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {screenState === 'game-over' && (
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Speedrun Completado!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              Level Completed: <strong className="text-espana-red">{activeConfig?.name}</strong>. Your translation vocabulary is sharp!
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex flex-wrap justify-center items-center gap-4">
            <div className="flex flex-col text-left min-w-[70px]">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Score Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+{activeConfig?.xpReward} XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200 hidden sm:block"></div>
            <div className="flex flex-col text-left min-w-[70px]">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Correct Answers</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{successCount} / {deck.length}</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200 hidden sm:block"></div>
            <div className="flex flex-col text-left min-w-[70px]">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Max Streak</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{maxStreak} 🔥</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
            <button
              onClick={() => selectLevel(selectedLevelId)}
              className="flex-1 glass-button py-3.5 text-xs font-extrabold"
            >
              Play Again
            </button>
            <button
              onClick={() => setScreenState('level-select')}
              className="flex-1 glass-emerald-button py-3.5 text-xs font-extrabold"
            >
              Choose Level
            </button>
            <button
              onClick={onBack}
              className="flex-1 glass-red-button py-3.5 text-xs font-extrabold"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapidoSpeedrun;
