import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Apple, HelpCircle } from 'lucide-react';
import { PixelCTAButton } from '../../components/PixelCTAButton';

const FOOD_ITEMS = [
  { word: 'Plátano', type: 'frutas', english: 'Banana' },
  { word: 'Manzana', type: 'frutas', english: 'Apple' },
  { word: 'Fresa', type: 'frutas', english: 'Strawberry' },
  { word: 'Limón', type: 'frutas', english: 'Lemon' },
  { word: 'Naranja', type: 'frutas', english: 'Orange' },
  { word: 'Uva', type: 'frutas', english: 'Grape' },
  { word: 'Pera', type: 'frutas', english: 'Pear' },
  { word: 'Sandía', type: 'frutas', english: 'Watermelon' },
  { word: 'Zanahoria', type: 'verduras', english: 'Carrot' },
  { word: 'Tomate', type: 'verduras', english: 'Tomato' },
  { word: 'Cebolla', type: 'verduras', english: 'Onion' },
  { word: 'Lechuga', type: 'verduras', english: 'Lettuce' },
  { word: 'Patata', type: 'verduras', english: 'Potato' },
  { word: 'Pepino', type: 'verduras', english: 'Cucumber' },
  { word: 'Ajo', type: 'verduras', english: 'Garlic' },
  { word: 'Espinaca', type: 'verduras', english: 'Spinach' }
];

const Supermercado = ({ onBack, onGameComplete }) => {
  const [gamePool, setGamePool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Select 10 random items and shuffle them
    const shuffled = [...FOOD_ITEMS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
    setGamePool(shuffled);
    setCurrentIndex(0);
    setMistakes(0);
    setSuccessCount(0);
    setGameOver(false);
  };

  const handleClassification = (selectedType) => {
    if (gameOver) return;

    const currentItem = gamePool[currentIndex];
    if (currentItem.type === selectedType) {
      // Correct!
      setSuccessCount(prev => prev + 1);
      setAnimationClass('scale-95 bg-emerald-500 text-white');
      setTimeout(() => {
        advanceGame();
      }, 300);
    } else {
      // Incorrect!
      setMistakes(prev => prev + 1);
      setShakeCard(true);
      setAnimationClass('bg-red-500 text-white animate-shake');
      setTimeout(() => {
        setShakeCard(false);
        setAnimationClass('');
      }, 500);
    }
  };

  const advanceGame = () => {
    setAnimationClass('');
    if (currentIndex + 1 >= gamePool.length) {
      setGameOver(true);
      onGameComplete(150); // Reward 150 XP on completion
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Drag and Drop support
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', gamePool[currentIndex].type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    handleClassification(type);
  };

  const currentItem = gamePool[currentIndex];

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
          Supermercado
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">Supermercado</h2>
        <p className="text-xs text-brand-650 font-semibold leading-relaxed">
          Sort the falling food items into their correct shopping carts: <strong>Frutas</strong> or <strong>Verduras</strong>. Drag them or click the assignment buttons below!
        </p>
      </div>

      {!gameOver ? (
        <div className="flex flex-col gap-8">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold shadow-sm">
            <span className="text-brand-500">Progress: <strong className="text-espana-charcoal">{currentIndex + 1} / 10</strong></span>
            <span className="text-brand-500">Mistakes: <strong className="text-espana-red">{mistakes}</strong></span>
          </div>

          {/* Word Card Stack */}
          {currentItem && (
            <div className="flex justify-center items-center py-4">
              <div
                draggable
                onDragStart={handleDragStart}
                className={`w-64 h-40 rounded-[2rem] shadow-xl border border-brand-200 bg-white cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-6 transition-all duration-200 select-none ${animationClass}`}
              >
                <Apple size={36} className="text-espana-red mb-2" />
                <h3 className="text-2xl font-black tracking-wide uppercase select-none">{currentItem.word}</h3>
                <span className="text-xs font-semibold text-brand-400 mt-1 uppercase tracking-widest">{currentItem.english}</span>
                <span className="text-[10px] text-brand-300 font-extrabold mt-3 border border-brand-100 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                  Drag me or use buttons!
                </span>
              </div>
            </div>
          )}

          {/* Mobile buttons */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
            <button
              onClick={() => handleClassification('frutas')}
              className="px-6 py-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 rounded-2xl text-xs font-black shadow-sm flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
            >
              <span className="text-lg">🍎</span>
              <span>En Frutas</span>
            </button>
            <button
              onClick={() => handleClassification('verduras')}
              className="px-6 py-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-2xl text-xs font-black shadow-sm flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
            >
              <span className="text-lg">🥬</span>
              <span>En Verduras</span>
            </button>
          </div>

          {/* Shopping Carts Drop Zones */}
          <div className="grid grid-cols-2 gap-6 mt-2">
            {/* Frutas Cart */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'frutas')}
              className="border-2 border-dashed border-orange-300/60 bg-orange-50/20 hover:bg-orange-50/40 rounded-[2.5rem] p-6 flex flex-col items-center justify-center min-h-[160px] transition-all text-orange-500 shadow-sm"
            >
              <span className="text-4xl animate-bounce">🛒</span>
              <h4 className="text-base font-black uppercase tracking-wider mt-2 text-orange-600">Frutas</h4>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Drop fruits here</span>
            </div>

            {/* Verduras Cart */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'verduras')}
              className="border-2 border-dashed border-emerald-300/60 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-[2.5rem] p-6 flex flex-col items-center justify-center min-h-[160px] transition-all text-emerald-500 shadow-sm"
            >
              <span className="text-4xl animate-bounce">🛒</span>
              <h4 className="text-base font-black uppercase tracking-wider mt-2 text-emerald-600">Verduras</h4>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Drop veggies here</span>
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
            <h3 className="text-xl font-black text-espana-charcoal">¡Excelente Trabajo!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You correctly categorized all food items under pressure!
            </p>
          </div>

          <div className="bg-brand-50/80 px-6 py-4 rounded-2xl border border-brand-200 flex items-center gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Score Earned</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">+150 XP</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-200"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Mistakes Avoided</span>
              <span className="text-base font-black text-espana-charcoal mt-0.5">{10 - mistakes} / 10 tries</span>
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

export default Supermercado;
