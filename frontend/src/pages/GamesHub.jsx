import React, { useState } from 'react';
import { Gamepad2, Award, Sparkles, Layers, MessageSquare, Volume2, ArrowRight, HelpCircle } from 'lucide-react';
import VocabMatchmaker from './games/VocabMatchmaker';
import AgreementBuilder from './games/AgreementBuilder';
import CuentaCafeteria from './games/CuentaCafeteria';
import Hangman from './games/Hangman';

const GAMES_LIST = [
  {
    id: 'matchmaker',
    title: 'Word Matchmaker',
    description: 'Scrambled vocabulary grid pairing. Match Spanish words with their English translations.',
    pointsInfo: '+150 XP Reward',
    icon: Layers,
    badge: 'Vocabulary'
  },
  {
    id: 'builder',
    title: 'Agreement Builder',
    description: 'Syntax and alignment builder. Arrange nouns and adjectives matching gender and number.',
    pointsInfo: '+200 XP Reward',
    icon: MessageSquare,
    badge: 'Grammar'
  },
  {
    id: 'cafeteria',
    title: 'La Cuenta Cafetería',
    description: 'Audio receipt deciphering quiz. Decipher spoken numbers and verify invoice amounts.',
    pointsInfo: '+150 XP Reward',
    icon: Volume2,
    badge: 'Listening'
  },
  {
    id: 'hangman',
    title: 'El Ahorcado',
    description: 'Guess the secret Spanish word letter by letter before the gallows is complete.',
    pointsInfo: '+150 XP Reward',
    icon: HelpCircle,
    badge: 'Spelling'
  }
];

const GamesHub = ({ user, token, onXpGain }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [totalSessionXp, setTotalSessionXp] = useState(0);

  const handleGameComplete = (points) => {
    setTotalSessionXp(prev => prev + points);
    if (onXpGain) {
      onXpGain(points);
    }
  };

  const handleBackToHub = () => {
    setActiveGame(null);
  };

  return (
    <div className="w-full min-h-screen bg-espana-sand p-4 sm:p-6 md:p-8 font-sans">
      
      {/* Sessions Points Header bar */}
      <div className="max-w-4xl mx-auto flex justify-between items-center bg-white border border-brand-200 rounded-3xl p-5 shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-espana-red to-espana-gold p-2.5 rounded-2xl text-white shadow-md">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-espana-charcoal leading-tight">Games & Puzzles</h1>
            <p className="text-xs text-brand-400 font-semibold">Boost your Spanish through play!</p>
          </div>
        </div>

        <div className="bg-espana-gold border border-amber-300 rounded-2xl px-5 py-3 flex items-center gap-2.5 shadow-sm">
          <Award size={20} className="text-slate-900 fill-amber-300" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Session XP</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">{totalSessionXp} XP</span>
          </div>
        </div>
      </div>

      {/* Main Container rendering */}
      <div className="max-w-4xl mx-auto">
        {activeGame === null ? (
          <div className="flex flex-col gap-6">
            
            {/* Spotlight promo */}
            <div className="bg-white border-2 border-brand-200 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex flex-col gap-1.5 max-w-lg">
                <span className="text-[10px] font-black text-espana-red uppercase tracking-widest">New Feature</span>
                <h2 className="text-2xl font-black text-espana-charcoal leading-tight">A1 Mini-Games Suite</h2>
                <p className="text-xs text-brand-650 leading-relaxed font-medium">
                  Challenge yourself with vocabulary, grammar agreements, and receipt-listening simulation games designed for absolute beginners.
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-espana-red/5 flex items-center justify-center shrink-0 text-espana-red">
                <Sparkles size={32} className="animate-pulse" />
              </div>
            </div>

            {/* Games Grid selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
              {GAMES_LIST.map((game) => {
                const IconComponent = game.icon;
                return (
                  <div 
                    key={game.id} 
                    className="bg-white hover:bg-brand-50 border border-brand-200 hover:border-brand-350 p-6 rounded-[2.2rem] flex flex-col justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex flex-col gap-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-brand-450 uppercase tracking-wider bg-brand-100 px-2.5 py-1 rounded-full">
                          {game.badge}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-espana-red group-hover:bg-espana-red group-hover:text-white transition-all">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-black text-espana-charcoal leading-tight">{game.title}</h3>
                        <p className="text-xs text-brand-500 font-semibold leading-relaxed mt-0.5">{game.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveGame(game.id)}
                      className="w-full bg-espana-red hover:bg-red-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-50 transition-all active:scale-[0.98] outline-none"
                    >
                      <span>Play Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Render selected active game child */
          <div className="bg-white border border-brand-200 p-6 sm:p-8 rounded-[2.2rem] shadow-sm animate-fade-in min-h-[350px]">
            {activeGame === 'matchmaker' && (
              <VocabMatchmaker onBack={handleBackToHub} onGameComplete={handleGameComplete} />
            )}
            {activeGame === 'builder' && (
              <AgreementBuilder onBack={handleBackToHub} onGameComplete={handleGameComplete} />
            )}
            {activeGame === 'cafeteria' && (
              <CuentaCafeteria onBack={handleBackToHub} onGameComplete={handleGameComplete} />
            )}
            {activeGame === 'hangman' && (
              <Hangman onBack={handleBackToHub} onGameComplete={handleGameComplete} />
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default GamesHub;
