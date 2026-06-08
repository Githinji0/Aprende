import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

const WORD_POOL = [
  { word: 'manzana', clue: 'The red crispy fruit' },
  { word: 'perro', clue: "Man's best friend (dog)" },
  { word: 'gracias', clue: 'What you say to show gratitude (thank you)' },
  { word: 'amigo', clue: 'Your pal or buddy (friend)' },
  { word: 'libro', clue: 'You read pages inside it (book)' },
  { word: 'fiesta', clue: 'A social celebration or party' },
  { word: 'estudiante', clue: 'Someone who goes to school to learn (student)' },
  { word: 'gato', clue: 'A small domestic feline pet (cat)' },
  { word: 'bolígrafo', clue: 'Used to write ink on paper (pen)' },
  { word: 'familia', clue: 'Your parents, siblings, and relatives' }
];

const ALPHABET = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'á', 'é', 'í', 'ó', 'ú', 'ü'
];

const stripAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const Hangman = ({ onBack, onGameComplete }) => {
  const [secretObj, setSecretObj] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomObj = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    setSecretObj(randomObj);
    setGuessedLetters([]);
    setMistakes(0);
    setGameWon(false);
    setGameOver(false);
  };

  const handleGuess = (letter) => {
    if (gameOver || gameWon) return;
    if (guessedLetters.includes(letter)) return;

    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);

    // Check if letter exists in the secret word
    const secretWord = secretObj.word.toLowerCase();
    const normalizedLetter = stripAccents(letter);
    
    // A guess is correct if the letter is directly in the word OR if its normalized version is in the word
    const isCorrect = [...secretWord].some(char => 
      char === letter || stripAccents(char) === normalizedLetter
    );

    if (!isCorrect) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 6) {
        setGameOver(true);
      }
    } else {
      // Check win condition
      const won = [...secretWord].every(char => 
        newGuesses.includes(char) || newGuesses.includes(stripAccents(char))
      );
      if (won) {
        setGameWon(true);
        onGameComplete(150); // Reward 150 XP on win
      }
    }
  };

  const renderWordProgress = () => {
    if (!secretObj) return null;
    return [...secretObj.word].map((char, index) => {
      const charLower = char.toLowerCase();
      const isGuessed = guessedLetters.includes(charLower) || guessedLetters.includes(stripAccents(charLower));
      
      return (
        <span 
          key={index} 
          className="w-7 sm:w-9 h-11 border-b-[3px] border-espana-charcoal flex items-center justify-center font-black text-lg sm:text-xl uppercase select-none transition-colors"
        >
          {isGuessed ? char : ''}
        </span>
      );
    });
  };

  // SVG drawing of hangman based on mistakes (max 6)
  const renderGallows = () => {
    return (
      <svg className="w-40 h-48 select-none" viewBox="0 0 100 120">
        {/* Gallows Pole structure (always drawn) */}
        <line x1="10" y1="110" x2="80" y2="110" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="110" x2="30" y2="15" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="15" x2="70" y2="15" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="70" y1="15" x2="70" y2="30" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="35" x2="50" y2="15" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

        {/* Head: Mistake 1 */}
        {mistakes >= 1 && (
          <circle cx="70" cy="40" r="10" stroke="#D01C1F" strokeWidth="3" fill="none" className="animate-fade-in" />
        )}
        
        {/* Spine/Body: Mistake 2 */}
        {mistakes >= 2 && (
          <line x1="70" y1="50" x2="70" y2="80" stroke="#D01C1F" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" />
        )}

        {/* Left Arm: Mistake 3 */}
        {mistakes >= 3 && (
          <line x1="70" y1="58" x2="52" y2="48" stroke="#D01C1F" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" />
        )}

        {/* Right Arm: Mistake 4 */}
        {mistakes >= 4 && (
          <line x1="70" y1="58" x2="88" y2="48" stroke="#D01C1F" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" />
        )}

        {/* Left Leg: Mistake 5 */}
        {mistakes >= 5 && (
          <line x1="70" y1="80" x2="54" y2="100" stroke="#D01C1F" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" />
        )}

        {/* Right Leg: Mistake 6 */}
        {mistakes >= 6 && (
          <line x1="70" y1="80" x2="86" y2="100" stroke="#D01C1F" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" />
        )}
      </svg>
    );
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
          El Ahorcado
        </span>
      </div>

      {/* Intro details */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-black tracking-tight">El Ahorcado (Hangman)</h2>
        <p className="text-xs text-brand-600 font-semibold leading-relaxed">
          Guess the secret A1 Spanish word letter by letter. Watch out—6 incorrect attempts and the gallows is complete!
        </p>
      </div>

      {!gameWon && !gameOver ? (
        <div className="flex flex-col gap-6">
          
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-white/70 p-4 rounded-2xl border border-brand-200 text-xs font-bold">
            <span className="text-brand-500">Mistakes: <strong className="text-espana-red">{mistakes} / 6</strong></span>
            <span className="text-brand-500">Guessed Letters: <strong className="text-espana-charcoal">{guessedLetters.length}</strong></span>
          </div>

          {/* Gallows & Clue Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/70 border border-brand-200 rounded-3xl p-6 items-center">
            {/* Left: SVG */}
            <div className="flex justify-center">
              {renderGallows()}
            </div>
            
            {/* Right: Clue details */}
            <div className="flex flex-col gap-2.5 text-center sm:text-left">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">English Clue</span>
                <p className="font-bold text-sm text-brand-700 mt-1">"{secretObj?.clue}"</p>
              </div>
              <div className="flex flex-col gap-0.5 mt-1 select-none">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Word Length</span>
                <span className="text-xs font-bold text-brand-650 mt-1">{secretObj?.word.length} letters</span>
              </div>
            </div>
          </div>

          {/* Word Blanks Display Workspace */}
          <div className="flex justify-center gap-2.5 sm:gap-3 py-4 flex-wrap">
            {renderWordProgress()}
          </div>

          {/* Virtual Keyboard alphabet buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider pl-1 select-none">Guess a Letter</span>
            <div className="flex flex-wrap gap-1.5 justify-center p-4 bg-brand-50/50 border border-brand-200 rounded-2xl">
              {ALPHABET.map((letter) => {
                const isUsed = guessedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={isUsed}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border font-extrabold text-sm uppercase transition-all duration-150 outline-none flex items-center justify-center ${
                      isUsed 
                        ? 'bg-brand-100 text-brand-300 border-brand-200 cursor-not-allowed' 
                        : 'bg-white hover:bg-brand-50 border-brand-200 text-espana-charcoal hover:border-espana-red hover:text-espana-red shadow-sm active:scale-90'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      ) : gameWon ? (
        /* Win Card screen view */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-espana-gold border border-amber-300 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Victoria! You Guessed It!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              You correctly solved the secret Spanish word:
            </p>
            <p className="text-lg font-black text-espana-red uppercase tracking-widest mt-1 select-all">
              {secretObj?.word}
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
              <span className="text-base font-black text-espana-charcoal mt-0.5">{mistakes} / 6 tries</span>
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
      ) : (
        /* Game Over screen view */
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl text-center flex flex-col items-center gap-5 bg-white/70 animate-fade-in">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-espana-red shadow-lg">
            <AlertCircle size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-espana-charcoal">¡Juego Terminado!</h3>
            <p className="text-xs text-brand-500 font-semibold max-w-xs leading-relaxed">
              The gallows was completed. The correct secret word was:
            </p>
            <p className="text-lg font-black text-espana-red uppercase tracking-widest mt-1 select-all">
              {secretObj?.word}
            </p>
            <span className="text-[11px] text-brand-400 font-medium italic mt-0.5">"{secretObj?.clue}"</span>
          </div>

          <div className="flex gap-3 w-full max-w-sm mt-4">
            <button
              onClick={startNewGame}
              className="flex-1 glass-button py-3 text-xs font-extrabold"
            >
              Try Again
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

export default Hangman;
