import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speak } from '../utils/speechEngine';

const AudioSpeaker = ({ text, lang = 'es-MX', size = 20, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation(); // prevent triggering parent clicks
    
    setIsPlaying(true);
    speak(text, {
      lang,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${
        isPlaying
          ? 'bg-accent-indigo text-white scale-105 shadow-md shadow-indigo-200'
          : 'bg-indigo-50 text-accent-indigo hover:bg-indigo-100 hover:scale-105'
      } ${className}`}
      title="Listen to pronunciation"
    >
      {isPlaying ? (
        <Volume2 size={size} className="animate-pulse" />
      ) : (
        <Volume2 size={size} />
      )}
    </button>
  );
};

export default AudioSpeaker;
