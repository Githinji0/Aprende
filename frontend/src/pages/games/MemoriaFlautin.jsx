import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';

const MEMORY_PAIRS = [
  { pairId: 1, label: 'Perro', side: 'es' },
  { pairId: 1, label: 'Dog 🐕', side: 'en' },
  { pairId: 2, label: 'Gato', side: 'es' },
  { pairId: 2, label: 'Cat 🐈', side: 'en' },
  { pairId: 3, label: 'Manzana', side: 'es' },
  { pairId: 3, label: 'Apple 🍎', side: 'en' },
  { pairId: 4, label: 'Libro', side: 'es' },
  { pairId: 4, label: 'Book 📖', side: 'en' },
  { pairId: 5, label: 'Sol', side: 'es' },
  { pairId: 5, label: 'Sun ☀️', side: 'en' },
  { pairId: 6, label: 'Agua', side: 'es' },
  { pairId: 6, label: 'Water 💧', side: 'en' },
  { pairId: 7, label: 'Amigo', side: 'es' },
  { pairId: 7, label: 'Friend 🤝', side: 'en' },
  { pairId: 8, label: 'Gracias', side: 'es' },
  { pairId: 8, label: 'Thanks 🙏', side: 'en' }
];

const MemoriaFlautin = ({ onBack, onGameComplete }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [flipsCount, setFlipsCount] = useState(0);
  const [pairsCleared, setPairsCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Generate card list with random unique IDs and shuffle
    const cardData = MEMORY_PAIRS.map((item, idx) => ({
      id: idx,
      pairId: item.pairId,
      label: item.label,
      side: item.side,
      isFlipped: false,
      isCleared: false
    })).sort(() => 0.5 - Math.random());
    
    setCards(cardData);
    setFlippedIndices([]);
    setFlipsCount(0);
    setPairsCleared(0);
    setGameOver(false);
  };

  const handleCardClick = (index) => {
    // Ignore if card is already flipped/cleared, or two cards are already flipped
    if (cards[index].isFlipped || cards[index].isCleared || flippedIndices.length >= 2) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setFlipsCount(prev => prev + 1);
      // Check match
      const firstCard = cards[nextFlipped[0]];
      const secondCard = cards[index];

      if (firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          const clearedCards = [...updatedCards];
          clearedCards[nextFlipped[0]].isCleared = true;
          clearedCards[index].isCleared = true;
          setCards(clearedCards);
          setFlippedIndices([]);
          
          const newPairsCleared = pairsCleared + 1;
          setPairsCleared(newPairsCleared);

          if (newPairsCleared === 8) {
            setGameOver(true);
            onGameComplete(150); // Reward 150 XP on completion
          }
        }, 600);
      } else {
        // No match, flip back over after delay
        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[nextFlipped[0]].isFlipped = false;
          resetCards[index].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

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
          Memoria Flautín
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Memoria Flautín</h2>
        <p className="text-xs text-brand-650 font-semibold leading-relaxed">
          The traditional 4x4 matching grid. Flip two cards to pair Spanish words with their corresponding English/emoji translations.
        </p>
      </div>

      {!gameOver ? (
        <div className="flex flex-col gap-6">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold shadow-sm">
            <span className="text-brand-500">Pairs Matched: <strong className="text-espana-charcoal">{pairsCleared} / 8</strong></span>
            <span className="text-brand-500">Total Flips: <strong className="text-brand-700">{flipsCount}</strong></span>
          </div>

          {/* 4x4 Memory Cards Grid */}
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto w-full aspect-square p-4 bg-brand-50/40 border border-brand-200 rounded-[2.5rem]">
            {cards.map((card, idx) => {
              const showContent = card.isFlipped || card.isCleared;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`w-full h-full aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-300 font-extrabold text-[11px] sm:text-xs select-none shadow-sm ${
                    card.isCleared
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                      : showContent
                        ? 'bg-white border-espana-red text-espana-charcoal rotate-y-180 scale-95'
                        : 'bg-espana-red hover:bg-red-700 border-white text-white hover:scale-[1.02] active:scale-95 cursor-pointer'
                  }`}
                >
                  {showContent ? (
                    <span className="px-1 text-center break-words leading-tight">{card.label}</span>
                  ) : (
                    <HelpCircle size={20} className="opacity-80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Victoria de Memoria!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              All 8 vocabulary pairs matched and cleared successfully!
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Score Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+150 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Total Flips</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{flipsCount} turns</span>
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

export default MemoriaFlautin;
