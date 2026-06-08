import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

const ROUNDS_DATA = [
  {
    emoji: '🍎',
    english: 'The red apple',
    target: 'La manzana roja',
    bricks: ['La', 'El', 'manzana', 'roja', 'rojo']
  },
  {
    emoji: '🐕',
    english: 'The black dog',
    target: 'El perro negro',
    bricks: ['El', 'La', 'perro', 'negro', 'negra']
  },
  {
    emoji: '🚗',
    english: 'The fast cars',
    target: 'Los coches rápidos',
    bricks: ['Los', 'El', 'coches', 'rápidos', 'rápido']
  },
  {
    emoji: '🏠',
    english: 'The white house',
    target: 'La casa blanca',
    bricks: ['La', 'El', 'casa', 'blanca', 'blanco']
  }
];

const AgreementBuilder = ({ onBack, onGameComplete }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [poolBricks, setPoolBricks] = useState([]);
  const [workspaceBricks, setWorkspaceBricks] = useState([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [gameWon, setGameWon] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);

  const currentRound = ROUNDS_DATA[currentRoundIdx];

  useEffect(() => {
    initializeRound(0);
  }, []);

  const initializeRound = (idx) => {
    setCurrentRoundIdx(idx);
    setWorkspaceBricks([]);
    setRoundCompleted(false);
    setFeedback(null);
    
    // Scramble the brick list
    const roundBricks = [...ROUNDS_DATA[idx].bricks].sort(() => 0.5 - Math.random());
    setPoolBricks(roundBricks);
  };

  const handlePoolBrickClick = (word) => {
    if (roundCompleted) return;
    // Move from pool to workspace
    setWorkspaceBricks(prev => [...prev, word]);
    setPoolBricks(prev => prev.filter((w, index) => index !== prev.indexOf(word)));
    setFeedback(null);
  };

  const handleWorkspaceBrickClick = (word) => {
    if (roundCompleted) return;
    // Move from workspace back to pool
    setPoolBricks(prev => [...prev, word]);
    setWorkspaceBricks(prev => prev.filter((w, index) => index !== prev.indexOf(word)));
    setFeedback(null);
  };

  const handleCheckAssembly = () => {
    const assembledString = workspaceBricks.join(' ');
    
    if (assembledString === currentRound.target) {
      setFeedback('correct');
      setRoundCompleted(true);
      setScoreEarned(prev => prev + 50);

      // Check if it's the final round
      if (currentRoundIdx + 1 === ROUNDS_DATA.length) {
        setGameWon(true);
        // Call score increment on complete (200 XP total)
        onGameComplete(200);
      }
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < ROUNDS_DATA.length) {
      initializeRound(currentRoundIdx + 1);
    }
  };

  const handleResetRound = () => {
    initializeRound(currentRoundIdx);
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
          Agreement Builder
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Art-of-Agreement Builder</h2>
        <p className="text-xs text-brand-600 font-semibold leading-relaxed">
          Tap the scattered word bricks to assemble the correct Spanish noun-adjective phrase matches. Match gender and number!
        </p>
      </div>

      {!gameWon ? (
        <div className="flex flex-col gap-6">
          
          {/* Round Indicator */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold">
            <span className="text-brand-500">Round: <strong className="text-espana-charcoal">{currentRoundIdx + 1} / {ROUNDS_DATA.length}</strong></span>
            <span className="text-brand-500">XP Earned: <strong className="text-espana-charcoal">+{scoreEarned} XP</strong></span>
          </div>

          {/* Emoji Clue Panel */}
          <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col items-center gap-2 bg-white/70">
            <span className="text-6xl select-none" role="img" aria-label="clue">
              {currentRound.emoji}
            </span>
            <div className="text-center">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">English Clue</span>
              <p className="font-bold text-sm text-brand-700 mt-1">"{currentRound.english}"</p>
            </div>
          </div>

          {/* Assembly Workspace Area */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider pl-1">Assembled Workspace</span>
            <div className="w-full min-h-[72px] p-4 bg-brand-50 border border-brand-200 rounded-2xl flex flex-wrap gap-2.5 items-center justify-center transition-colors">
              {workspaceBricks.length === 0 ? (
                <span className="text-xs text-brand-400 italic font-semibold">Click word bricks below to build the sentence...</span>
              ) : (
                workspaceBricks.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleWorkspaceBrickClick(word)}
                    disabled={roundCompleted}
                    className="px-5 py-3 bg-espana-red hover:opacity-90 text-white font-extrabold text-sm rounded-2xl transition-all shadow-sm active:scale-95 outline-none"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Scrambled Word Pool */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider pl-1">Word Bricks</span>
            <div className="w-full p-4 bg-white/75 border border-brand-200 rounded-2xl flex flex-wrap gap-2.5 items-center justify-center min-h-[72px]">
              {poolBricks.length === 0 && workspaceBricks.length > 0 ? (
                <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wide">All bricks placed</span>
              ) : (
                poolBricks.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handlePoolBrickClick(word)}
                    disabled={roundCompleted}
                    className="px-5 py-3 bg-brand-100 hover:bg-brand-200 border border-brand-300 text-espana-charcoal font-extrabold text-sm rounded-2xl transition-all shadow-sm active:scale-95 outline-none"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Action validation buttons */}
          <div className="flex flex-col gap-3">
            {feedback === 'incorrect' && (
              <div className="bg-red-50 text-espana-red p-3.5 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold animate-shake">
                <XCircle size={16} />
                <span>Incorrect word order, gender, or number agreement. Try rearranging the bricks!</span>
              </div>
            )}

            {feedback === 'correct' && (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Excellent! Correct gender and syntax: "{currentRound.target}"</span>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              {!roundCompleted ? (
                <>
                  <button
                    type="button"
                    onClick={handleResetRound}
                    disabled={workspaceBricks.length === 0}
                    className="flex-1 glass-button py-3 text-xs font-extrabold disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Clear Workspace
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckAssembly}
                    disabled={workspaceBricks.length === 0}
                    className="flex-1 glass-red-button py-3 text-xs font-extrabold disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Validate Sentence
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="w-full glass-emerald-button py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Next Round</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Final Success card when all rounds completed */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">All Agreements Correct!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You correctly aligned gender agreement rules across all noun structures.
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Total Reward</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+200 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Level Reached</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">A1 Proficient</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-sm mt-2">
            <button
              onClick={() => initializeRound(0)}
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

export default AgreementBuilder;
