import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { PixelCTAButton } from '../../components/PixelCTAButton';

const SENTENCE_POOL = [
  { spanish: 'El gato negro duerme', english: 'The black cat sleeps', words: ['El', 'gato', 'negro', 'duerme'] },
  { spanish: 'La casa es muy grande', english: 'The house is very big', words: ['La', 'casa', 'es', 'muy', 'grande'] },
  { spanish: 'Yo tengo un libro nuevo', english: 'I have a new book', words: ['Yo', 'tengo', 'un', 'libro', 'nuevo'] },
  { spanish: 'Nosotros estudiamos español hoy', english: 'We study Spanish today', words: ['Nosotros', 'estudiamos', 'español', 'hoy'] },
  { spanish: 'El perro corre rápido', english: 'The dog runs fast', words: ['El', 'perro', 'corre', 'rápido'] }
];

const TraficoPalabras = ({ onBack, onGameComplete }) => {
  const [sentences, setSentences] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [remainingPool, setRemainingPool] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct' | 'incorrect'

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Select all 5 or shuffle them
    const shuffled = [...SENTENCE_POOL].sort(() => 0.5 - Math.random());
    setSentences(shuffled);
    setCurrentRound(0);
    setMistakes(0);
    setGameOver(false);
    setupRound(shuffled[0]);
  };

  const setupRound = (sentenceObj) => {
    setSelectedWords([]);
    // Shuffle the words for selection
    const shuffledWords = [...sentenceObj.words].sort(() => 0.5 - Math.random());
    setRemainingPool(shuffledWords);
    setShowFeedback(null);
  };

  const handleWordTap = (word, index) => {
    if (showFeedback === 'correct') return;
    // Add to selected, remove from pool
    setSelectedWords([...selectedWords, word]);
    setRemainingPool(remainingPool.filter((_, i) => i !== index));
    setShowFeedback(null);
  };

  const handleCarriageTap = (word, index) => {
    if (showFeedback === 'correct') return;
    // Remove from selected, return to pool
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setRemainingPool([...remainingPool, word]);
    setShowFeedback(null);
  };

  const handleVerify = () => {
    const currentSentence = sentences[currentRound];
    const assembledSentence = selectedWords.join(' ');
    
    if (assembledSentence === currentSentence.spanish) {
      setShowFeedback('correct');
      setTimeout(() => {
        advanceRound();
      }, 1500);
    } else {
      setMistakes(prev => prev + 1);
      setShowFeedback('incorrect');
    }
  };

  const advanceRound = () => {
    if (currentRound + 1 >= sentences.length) {
      setGameOver(true);
      onGameComplete(150); // Reward 150 XP on completion
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setupRound(sentences[nextRound]);
    }
  };

  const resetCurrentRound = () => {
    setupRound(sentences[currentRound]);
  };

  const currentSentence = sentences[currentRound];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 text-espana-charcoal">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-brand-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-extrabold text-espana-red hover:opacity-85 transition-opacity uppercase tracking-wider focus:outline-none"
        >
          <ArrowLeft size={14} />
          <span>Volver al Hub de Juegos</span>
        </button>
        <span className="text-xs font-extrabold bg-espana-gold text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider">
          Tráfico de Palabras
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Tráfico de Palabras</h2>
        <p className="text-xs text-brand-650 font-semibold leading-relaxed">
          Assemble the Spanish sentence in the correct chronological syntax order (Subject + Verb + Adjective). Tap floating words to load them into the train carriages.
        </p>
      </div>

      {!gameOver ? (
        <div className="flex flex-col gap-6">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold shadow-sm">
            <span className="text-brand-500">Round: <strong className="text-espana-charcoal">{currentRound + 1} / 5</strong></span>
            <span className="text-brand-500">Mistakes: <strong className="text-espana-red">{mistakes}</strong></span>
          </div>

          {/* Clue Panel */}
          <div className="bg-brand-50/50 border border-brand-200 rounded-3xl p-5 flex flex-col gap-1 text-center">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">English Clue</span>
            <p className="font-bold text-sm text-brand-700 mt-1">"{currentSentence?.english}"</p>
          </div>

          {/* Train Carriages Track */}
          <div className="bg-white/70 border border-brand-200 rounded-3xl p-6 flex flex-col items-center gap-4 relative shadow-sm min-h-[140px] justify-center overflow-x-auto">
            {/* Track Line */}
            <div className="absolute left-6 right-6 h-1 bg-slate-300 top-1/2 -translate-y-1/2 pointer-events-none"></div>

            {/* Carriages */}
            <div className="flex gap-3 relative z-10 w-full justify-center py-2 min-w-[480px]">
              {currentSentence?.words.map((_, idx) => {
                const word = selectedWords[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => word && handleCarriageTap(word, idx)}
                    className={`w-24 h-16 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm ${
                      word 
                        ? 'bg-espana-red border-espana-red text-white hover:scale-95 cursor-pointer' 
                        : 'bg-brand-100/50 border-brand-200 border-dashed text-brand-300 cursor-default'
                    }`}
                  >
                    {word ? (
                      <span className="font-bold text-xs uppercase tracking-wide px-1.5 truncate max-w-full">{word}</span>
                    ) : (
                      <span className="text-lg opacity-40">🚃</span>
                    )}
                    <span className="text-[8px] font-black uppercase tracking-wider opacity-60 mt-1">Car {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floating words pool */}
          <div className="flex flex-col gap-2.5 mt-2">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider pl-1 select-none">Tap to Assemble</span>
            <div className="flex flex-wrap gap-2.5 justify-center p-5 bg-brand-50/50 border border-brand-200 rounded-3xl min-h-[80px]">
              {remainingPool.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleWordTap(word, idx)}
                  className="px-4 py-3 bg-white hover:bg-brand-50 border border-brand-200 text-espana-charcoal hover:border-espana-red hover:text-espana-red font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-90"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback message and Verify button */}
          <div className="flex flex-col items-center gap-4 mt-2">
            {showFeedback === 'correct' && (
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs px-5 py-3 rounded-2xl flex items-center gap-2 font-bold animate-bubble-pop">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>¡Excelente! Assembled correctly.</span>
              </div>
            )}
            {showFeedback === 'incorrect' && (
              <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-5 py-3 rounded-2xl flex items-center gap-2 font-bold animate-bubble-pop">
                <AlertTriangle size={16} className="text-red-500" />
                <span>Incorrect word order. Try restructuring!</span>
              </div>
            )}

            <div className="flex gap-3 w-full max-w-md">
              <button
                onClick={resetCurrentRound}
                className="flex-1 glass-button py-3.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              <PixelCTAButton
                disabled={selectedWords.length !== currentSentence?.words.length || showFeedback === 'correct'}
                onClick={handleVerify}
                className="flex-[2] py-3.5 text-xs font-black shadow-md flex items-center justify-center"
              >
                Verify Carriage Order
              </PixelCTAButton>
            </div>
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Viaje Terminado!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              All sentence carriages assembled correctly and successfully reached the station!
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Score Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+150 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Total Mistakes</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{mistakes} errors</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm mt-2">
            <button
              onClick={startNewGame}
              className="flex-1 glass-button py-3 text-xs font-extrabold"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 glass-red-button py-3 text-xs font-extrabold"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraficoPalabras;
