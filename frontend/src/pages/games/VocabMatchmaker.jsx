import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, Award, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const VOCAB_POOL = [
  { es: 'Perro', en: 'Dog' },
  { es: 'Gato', en: 'Cat' },
  { es: 'Hola', en: 'Hello' },
  { es: 'Gracias', en: 'Thank you' },
  { es: 'Manzana', en: 'Apple' },
  { es: 'Leche', en: 'Milk' },
  { es: 'Agua', en: 'Water' },
  { es: 'Casa', en: 'House' },
  { es: 'Libro', en: 'Book' },
  { es: 'Sol', en: 'Sun' },
  { es: 'Amigo', en: 'Friend' },
  { es: 'Comida', en: 'Food' }
];

const VocabMatchmaker = ({ onBack, onGameComplete }) => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mismatchedIds, setMismatchedIds] = useState([]);
  const [lockInput, setLockInput] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Initialize game cards on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Select 4 random pairs from pool
    const shuffledPool = [...VOCAB_POOL].sort(() => 0.5 - Math.random());
    const selectedPairs = shuffledPool.slice(0, 4);

    // Create 8 cards (4 Spanish, 4 English)
    const cardList = [];
    selectedPairs.forEach((pair, pairIdx) => {
      cardList.push({
        id: `es-${pairIdx}`,
        text: pair.es,
        lang: 'es',
        pairIdx
      });
      cardList.push({
        id: `en-${pairIdx}`,
        text: pair.en,
        lang: 'en',
        pairIdx
      });
    });

    // Scramble cards
    const scrambledCards = cardList.sort(() => 0.5 - Math.random());
    setCards(scrambledCards);
    setSelectedCard(null);
    setMatchedPairs([]);
    setMismatchedIds([]);
    setLockInput(false);
    setGameWon(false);
    setAttempts(0);
  };

  const handleCardClick = (card) => {
    if (lockInput || gameWon) return;
    if (matchedPairs.includes(card.pairIdx)) return;

    // If no card is selected, select it
    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    // If same card clicked, deselect
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    setAttempts(prev => prev + 1);

    // Check match
    if (selectedCard.pairIdx === card.pairIdx && selectedCard.lang !== card.lang) {
      // Correct Match!
      const newMatched = [...matchedPairs, card.pairIdx];
      setMatchedPairs(newMatched);
      setSelectedCard(null);

      // Check win condition
      if (newMatched.length === 4) {
        setGameWon(true);
        // Reward 150 points for success
        onGameComplete(150);
      }
    } else {
      // Mismatch
      setMismatchedIds([selectedCard.id, card.id]);
      setLockInput(true);

      setTimeout(() => {
        setSelectedCard(null);
        setMismatchedIds([]);
        setLockInput(false);
      }, 1000);
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
          Word Matchmaker
        </span>
      </div>

      {/* Intro info */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Match the Vocab Pairs</h2>
        <p className="text-xs text-brand-600 font-semibold leading-relaxed">
          Find matching Spanish and English words. Matched items lock in green; incorrect combinations shake and reset.
        </p>
      </div>

      {/* Main Game Screen */}
      {!gameWon ? (
        <div className="flex flex-col gap-5">
          {/* Dashboard Stats */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold">
            <span className="text-brand-500">Pairs Matched: <strong className="text-espana-charcoal">{matchedPairs.length} / 4</strong></span>
            <span className="text-brand-500">Attempts: <strong className="text-espana-charcoal">{attempts}</strong></span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {cards.map((card) => {
              const isMatched = matchedPairs.includes(card.pairIdx);
              const isSelected = selectedCard?.id === card.id;
              const isMismatched = mismatchedIds.includes(card.id);

              let cardStyle = 'bg-white hover:bg-brand-50 border-brand-250 text-espana-charcoal';

              if (isMatched) {
                cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-not-allowed opacity-80';
              } else if (isMismatched) {
                cardStyle = 'bg-red-50 border-espana-red text-espana-red animate-shake';
              } else if (isSelected) {
                cardStyle = 'bg-espana-red text-white border-espana-red shadow-md shadow-red-100';
              }

              return (
                <button
                  key={card.id}
                  type="button"
                  disabled={isMatched || lockInput}
                  onClick={() => handleCardClick(card)}
                  className={`w-full min-h-[90px] p-4 flex items-center justify-center text-center rounded-2xl border-2 font-black text-sm transition-all duration-200 select-none focus:outline-none ${cardStyle}`}
                >
                  {card.text}
                </button>
              );
            })}
          </div>

          {/* Reset Action */}
          <button
            onClick={startNewGame}
            className="self-center flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-espana-charcoal border border-brand-200 hover:border-brand-400 bg-white/60 hover:bg-white px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] mt-2"
          >
            <RotateCcw size={13} />
            <span>Reset Card Scramble</span>
          </button>
        </div>
      ) : (
        /* Win screen */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Excelente Trabajo!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You matched all Spanish words successfully and earned XP.
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-250 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Points Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+150 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Attempts Taken</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{attempts} turns</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm mt-2">
            <button
              onClick={startNewGame}
              className="flex-1 px-4 py-3.5 border border-brand-300 text-brand-600 rounded-2xl text-xs font-extrabold hover:bg-brand-50 bg-white transition-colors active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3.5 bg-espana-red hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-red-100 transition-all active:scale-95"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VocabMatchmaker;
