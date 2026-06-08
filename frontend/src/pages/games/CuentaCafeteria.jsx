import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { speak } from '../../utils/speechEngine';

const RECEIPT_ROUNDS = [
  {
    invoiceNumber: '#CAF-9482',
    items: [
      { name: '1 Café Solo', price: '1.50 €' },
      { name: '1 Croissant', price: '1.50 €' }
    ],
    spokenClue: 'El total son tres euros, por favor.',
    targetNumber: 3
  },
  {
    invoiceNumber: '#CAF-1059',
    items: [
      { name: '2 Zumos de Naranja', price: '4.00 €' },
      { name: '1 Galleta casera', price: '1.00 €' }
    ],
    spokenClue: 'Son cinco euros, por favor.',
    targetNumber: 5
  },
  {
    invoiceNumber: '#CAF-4491',
    items: [
      { name: '1 Bocadillo de Jamón', price: '5.00 €' },
      { name: '1 Refresco frío', price: '2.00 €' }
    ],
    spokenClue: 'El total son siete euros, gracias.',
    targetNumber: 7
  }
];

const CuentaCafeteria = ({ onBack, onGameComplete }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isSpoken, setIsSpoken] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [showTextClue, setShowTextClue] = useState(false);

  const currentRound = RECEIPT_ROUNDS[currentRoundIdx];

  useEffect(() => {
    initializeRound(0);
  }, []);

  const initializeRound = (idx) => {
    setCurrentRoundIdx(idx);
    setUserInput('');
    setIsSpoken(false);
    setFeedback(null);
    setRoundCompleted(false);
    setShowTextClue(false);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser. Please use the text clue fallback.');
      return;
    }

    setIsSpoken(true);
    speak(currentRound.spokenClue, {
      onStart: () => setIsSpoken(true),
      onEnd: () => setIsSpoken(false),
      onError: () => setIsSpoken(false),
    });
  };

  const handleCheck = (e) => {
    e.preventDefault();
    if (!userInput.trim() || roundCompleted) return;

    const numericValue = parseInt(userInput.trim(), 10);
    if (numericValue === currentRound.targetNumber) {
      setFeedback('correct');
      setRoundCompleted(true);
      setScoreEarned(prev => prev + 50);

      // Check win condition
      if (currentRoundIdx + 1 === RECEIPT_ROUNDS.length) {
        setGameWon(true);
        // Call global game complete callback (150 XP total)
        onGameComplete(150);
      }
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < RECEIPT_ROUNDS.length) {
      initializeRound(currentRoundIdx + 1);
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
          La Cuenta Cafetería
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Listening: La Cuenta Cafetería</h2>
        <p className="text-xs text-brand-600 font-semibold leading-relaxed">
          Listen to the waiter state the total bill price in Spanish. Input the deciphered number and check your receipt total.
        </p>
      </div>

      {!gameWon ? (
        <div className="flex flex-col gap-6">
          
          {/* Round Indicator */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold">
            <span className="text-brand-500">Invoice: <strong className="text-espana-charcoal">{currentRoundIdx + 1} / {RECEIPT_ROUNDS.length}</strong></span>
            <span className="text-brand-500">XP Earned: <strong className="text-espana-charcoal">+{scoreEarned} XP</strong></span>
          </div>

          {/* Receipt container simulation box */}
          <div className="bg-white border-2 border-brand-350 shadow-md p-6 max-w-xs mx-auto w-full rounded-2xl flex flex-col gap-4 font-mono text-xs relative select-none">
            {/* Receipt Header details */}
            <div className="text-center border-b border-dashed border-brand-300 pb-3 flex flex-col gap-0.5">
              <span className="font-black text-sm tracking-widest text-espana-charcoal">CAFETERÍA SOL</span>
              <span className="text-[10px] text-brand-400">Madrid, España</span>
              <span className="text-[9px] text-brand-400 mt-1">Invoice {currentRound.invoiceNumber}</span>
            </div>

            {/* Receipt Items */}
            <div className="flex flex-col gap-2 py-1.5">
              {currentRound.items.map((item, index) => (
                <div key={index} className="flex justify-between text-brand-700">
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))}
            </div>

            {/* Receipt Total */}
            <div className="border-t border-dashed border-brand-300 pt-3 flex justify-between items-center font-bold text-sm text-espana-charcoal">
              <span>TOTAL</span>
              <span className="text-base text-espana-red">
                {roundCompleted ? `${currentRound.targetNumber}.00 €` : '? ? €'}
              </span>
            </div>
            
            <div className="text-center text-[8px] text-brand-300 pt-1 border-t border-dashed border-brand-200">
              ¡Gracias por su visita!
            </div>
          </div>

          {/* Audio Trigger Section */}
          <div className="flex flex-col items-center gap-3 bg-brand-50 p-6 border border-brand-200 rounded-3xl">
            <button
              onClick={handleSpeak}
              disabled={isSpoken}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 outline-none ${
                isSpoken ? 'bg-espana-gold text-slate-900 cursor-wait' : 'bg-espana-red hover:bg-red-700 shadow-red-100'
              }`}
            >
              <Volume2 size={24} className={isSpoken ? 'animate-pulse' : ''} />
            </button>
            <div className="text-center">
              <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest leading-none">Audio Clue (0.85x speed)</span>
              <p className="text-xs text-brand-500 font-semibold mt-1">Tap the speaker to play the voice clue</p>
            </div>

            {/* Visual Help Text Fallback */}
            <div className="mt-2 w-full flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowTextClue(!showTextClue)}
                className="text-[10px] text-brand-450 hover:text-espana-charcoal font-bold flex items-center gap-1 focus:outline-none"
              >
                <HelpCircle size={12} />
                <span>{showTextClue ? 'Hide text transcript' : 'Audio not working? Show text transcript'}</span>
              </button>
              
              {showTextClue && (
                <div className="mt-3 p-3 bg-white border border-brand-200 rounded-xl max-w-sm text-center text-xs font-semibold italic text-brand-600 animate-fade-in">
                  "{currentRound.spokenClue}"
                </div>
              )}
            </div>
          </div>

          {/* User Input Submission Form */}
          <form onSubmit={handleCheck} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-400 uppercase tracking-wider pl-1">
                Enter price total (€)
              </label>
              <input
                type="number"
                disabled={roundCompleted}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="How many euros? (e.g. 4)"
                className="w-full p-4 bg-white border-2 border-brand-200 rounded-2xl text-center text-lg font-black placeholder-brand-400 focus:border-accent-indigo outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200 disabled:opacity-75"
              />
            </div>

            {feedback === 'incorrect' && (
              <div className="bg-red-50 text-espana-red p-3.5 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold animate-shake">
                <XCircle size={16} />
                <span>Incorrect total! Listen again carefully or look at the transcript hint.</span>
              </div>
            )}

            {feedback === 'correct' && (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Correct! Spoken price matches: {currentRound.targetNumber} euros.</span>
              </div>
            )}

            <div className="flex mt-1">
              {!roundCompleted ? (
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="w-full glass-red-button py-4 text-xs font-extrabold disabled:opacity-50 disabled:pointer-events-none"
                >
                  Verify Amount
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="w-full glass-emerald-button py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Next Receipt</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </form>

        </div>
      ) : (
        /* Win card */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">La Cuenta: Checked!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You deciphered spoken numerical billing amounts in Spanish correctly.
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Total Reward</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+150 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Skills Verified</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">A1 Numbers</span>
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

export default CuentaCafeteria;
