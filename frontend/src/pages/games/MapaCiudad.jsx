import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Volume2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PixelCTAButton } from '../../components/PixelCTAButton';

const MAP_CLUES = [
  {
    target: 'cafe',
    text: 'El café está a la derecha del hotel. ¿Dónde está el café?',
    english: 'The café is to the right of the hotel. Where is the café?',
    layout: {
      topLeft: 'parque',
      topRight: 'restaurante',
      bottomLeft: 'hotel',
      bottomRight: 'cafe'
    }
  },
  {
    target: 'restaurante',
    text: 'El restaurante está debajo del parque. ¿Dónde está el restaurante?',
    english: 'The restaurant is below the park. Where is the restaurant?',
    layout: {
      topLeft: 'parque',
      topRight: 'hotel',
      bottomLeft: 'restaurante',
      bottomRight: 'cafe'
    }
  },
  {
    target: 'hotel',
    text: 'El hotel está enfrente del café. ¿Dónde está el hotel?',
    english: 'The hotel is in front of the café. Where is the hotel?',
    layout: {
      topLeft: 'cafe',
      topRight: 'parque',
      bottomLeft: 'hotel',
      bottomRight: 'restaurante'
    }
  },
  {
    target: 'parque',
    text: 'El parque está a la izquierda del restaurante. ¿Dónde está el parque?',
    english: 'The park is to the left of the restaurant. Where is the park?',
    layout: {
      topLeft: 'parque',
      topRight: 'restaurante',
      bottomLeft: 'hotel',
      bottomRight: 'cafe'
    }
  },
  {
    target: 'cafe',
    text: 'El café está al lado del parque. ¿Dónde está el café?',
    english: 'The café is next to the park. Where is the café?',
    layout: {
      topLeft: 'parque',
      topRight: 'cafe',
      bottomLeft: 'hotel',
      bottomRight: 'restaurante'
    }
  }
];

const BUILDING_META = {
  parque: { name: 'Parque', emoji: '🌳', color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800' },
  cafe: { name: 'Café', emoji: '☕', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800' },
  hotel: { name: 'Hotel', emoji: '🏨', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800' },
  restaurante: { name: 'Restaurante', emoji: '🍽️', color: 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-800' }
};

const MapaCiudad = ({ onBack, onGameComplete }) => {
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct' | 'incorrect'

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = [...MAP_CLUES].sort(() => 0.5 - Math.random());
    setRounds(shuffled);
    setCurrentRound(0);
    setMistakes(0);
    setGameOver(false);
    speakClue(shuffled[0].text);
  };

  const speakClue = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBuildingClick = (buildingKey) => {
    if (showFeedback === 'correct') return;

    const roundObj = rounds[currentRound];
    if (buildingKey === roundObj.target) {
      setShowFeedback('correct');
      setTimeout(() => {
        advanceRound();
      }, 1500);
    } else {
      setMistakes(prev => prev + 1);
      setShowFeedback('incorrect');
      setTimeout(() => {
        setShowFeedback(null);
      }, 1200);
    }
  };

  const advanceRound = () => {
    setShowFeedback(null);
    if (currentRound + 1 >= rounds.length) {
      setGameOver(true);
      onGameComplete(200); // Reward 200 XP on completion
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      speakClue(rounds[nextRound].text);
    }
  };

  const roundObj = rounds[currentRound];

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
          Mapa de la Ciudad
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">El Mapa de la Ciudad</h2>
        <p className="text-xs text-brand-650 font-semibold leading-relaxed">
          Listen to the spoken Spanish description and identify the correct building location on the map. Click on a building to make your guess!
        </p>
      </div>

      {!gameOver ? (
        <div className="flex flex-col gap-6">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold shadow-sm">
            <span className="text-brand-500">Round: <strong className="text-espana-charcoal">{currentRound + 1} / 5</strong></span>
            <span className="text-brand-500">Mistakes: <strong className="text-espana-red">{mistakes}</strong></span>
          </div>

          {/* Clue and TTS Trigger card */}
          <div className="bg-white/70 border border-brand-200 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm text-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Spoken Instruction</span>
              <p className="font-extrabold text-lg text-espana-red mt-2 leading-relaxed">"{roundObj?.text}"</p>
              <span className="text-[11px] font-semibold text-brand-500 italic mt-0.5">"{roundObj?.english}"</span>
            </div>

            <button
              onClick={() => speakClue(roundObj?.text)}
              className="px-5 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-800 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Volume2 size={16} className="text-espana-red animate-pulse" />
              <span>Escuchar Pista (Listen Again)</span>
            </button>
          </div>

          {/* Map layout (2x2 Grid) */}
          {roundObj && (
            <div className="bg-brand-50/40 border-2 border-dashed border-brand-200 rounded-[2.5rem] p-6 max-w-md mx-auto w-full aspect-square grid grid-cols-2 gap-4 shadow-inner relative">
              {/* Streets divider visuals */}
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-white/60 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-white/60 -translate-x-1/2 pointer-events-none"></div>

              {/* Top-Left */}
              {(() => {
                const key = roundObj.layout.topLeft;
                const meta = BUILDING_META[key];
                return (
                  <button
                    onClick={() => handleBuildingClick(key)}
                    className={`rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${meta.color}`}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className="font-black text-xs uppercase tracking-wider">{meta.name}</span>
                  </button>
                );
              })()}

              {/* Top-Right */}
              {(() => {
                const key = roundObj.layout.topRight;
                const meta = BUILDING_META[key];
                return (
                  <button
                    onClick={() => handleBuildingClick(key)}
                    className={`rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${meta.color}`}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className="font-black text-xs uppercase tracking-wider">{meta.name}</span>
                  </button>
                );
              })()}

              {/* Bottom-Left */}
              {(() => {
                const key = roundObj.layout.bottomLeft;
                const meta = BUILDING_META[key];
                return (
                  <button
                    onClick={() => handleBuildingClick(key)}
                    className={`rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${meta.color}`}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className="font-black text-xs uppercase tracking-wider">{meta.name}</span>
                  </button>
                );
              })()}

              {/* Bottom-Right */}
              {(() => {
                const key = roundObj.layout.bottomRight;
                const meta = BUILDING_META[key];
                return (
                  <button
                    onClick={() => handleBuildingClick(key)}
                    className={`rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${meta.color}`}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className="font-black text-xs uppercase tracking-wider">{meta.name}</span>
                  </button>
                );
              })()}
            </div>
          )}

          {/* Feedback messages */}
          {showFeedback === 'correct' && (
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs px-5 py-3 rounded-2xl flex items-center gap-2 font-bold justify-center animate-bubble-pop">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>¡Correcto! Encontraste el edificio.</span>
            </div>
          )}
          {showFeedback === 'incorrect' && (
            <div className="bg-red-50 text-red-600 border border-red-100 text-xs px-5 py-3 rounded-2xl flex items-center gap-2 font-bold justify-center animate-shake">
              <AlertTriangle size={16} className="text-red-500" />
              <span>Ese no es el edificio indicado. ¡Escucha bien la pista!</span>
            </div>
          )}
        </div>
      ) : (
        /* Completion Screen */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Guía de la Ciudad!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You navigated the city map perfectly based on directional clues!
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Score Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+200 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Mistakes Avoided</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{5 - mistakes} / 5 tries</span>
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

export default MapaCiudad;
