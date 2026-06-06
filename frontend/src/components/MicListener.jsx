import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { getSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';

const MicListener = ({ onTranscript, lang = 'es-MX', className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage('');
    setIsListening(true);

    const recognizer = getSpeechRecognizer({
      lang,
      onResult: (transcript, confidence) => {
        if (onTranscript) {
          onTranscript(transcript);
        }
      },
      onError: (error) => {
        if (error === 'not-allowed') {
          setErrorMessage('Microphone access denied.');
        } else if (error === 'no-speech') {
          setErrorMessage('No speech detected. Try again.');
        } else {
          setErrorMessage(`Error: ${error}`);
        }
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      recognizer.start();
    } else {
      setIsListening(false);
      setErrorMessage('Failed to initialize microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!supported) {
    return (
      <div className="text-xs text-red-500 flex items-center gap-1 mt-1 bg-red-50 p-2 rounded">
        <AlertCircle size={14} />
        <span>Speech Recognition is not supported by your current browser. (Try Chrome or Edge)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleListening}
        type="button"
        className={`p-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center focus:outline-none ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white scale-110 animate-bounce'
            : 'bg-accent-emerald hover:bg-emerald-600 text-white hover:scale-105'
        } ${className}`}
        title={isListening ? 'Stop recording' : 'Start speaking'}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
      
      {isListening && (
        <span className="text-xs text-red-500 font-medium animate-pulse">
          Escuchando... Speak now in Spanish
        </span>
      )}

      {errorMessage && (
        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default MicListener;
