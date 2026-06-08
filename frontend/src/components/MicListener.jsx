import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles } from 'lucide-react';
import { getSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechEngine';

const MicListener = ({ onTranscript, lang, targetPhrase, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasMicAccess, setHasMicAccess] = useState(null);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const transcriptReceivedRef = useRef(false);
  const maxVolumeRef = useRef(0);
  const sessionIdRef = useRef(0);
  const recognitionFailedOrBlockedRef = useRef(false);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startListening = async () => {
    setErrorMessage('');
    cleanupAudio();
    
    sessionIdRef.current += 1;
    transcriptReceivedRef.current = false;
    maxVolumeRef.current = 0;
    recognitionFailedOrBlockedRef.current = !supported;
    setIsListening(true);

    // 1. First, request microphone access via getUserMedia to prove recording works
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasMicAccess(true);
    } catch (err) {
      console.error('Microphone stream access error:', err);
      setErrorMessage('Microphone access denied or not connected.');
      setIsListening(false);
      setHasMicAccess(false);
      return;
    }

    // 2. Set up Web Audio API visualizer
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 64;
      
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;
      
      // Start drawing
      requestAnimationFrame(drawWave);
    } catch (audioErr) {
      console.warn('Web Audio visualizer failed to initialize:', audioErr);
    }

    // 3. Start speech recognition in parallel
    const recognizer = getSpeechRecognizer({
      lang: lang || undefined,
      onResult: (transcript, confidence) => {
        transcriptReceivedRef.current = true;
        if (onTranscript) {
          onTranscript(transcript);
        }
        stopListening();
      },
      onError: (error) => {
        console.warn('Speech Recognition Error:', error);
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          recognitionFailedOrBlockedRef.current = true;
        } else if (error === 'no-speech') {
          // Keep listening or silent
        }
      },
      onEnd: () => {
        // Natural end of Speech Recognition
        // If it ended naturally and we are still in listening mode, trigger stopListening
        // to invoke the fallback logic or show the error
        if (transcriptReceivedRef.current === false) {
          stopListening();
        }
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (recStartErr) {
        console.warn('Recognizer failed to start:', recStartErr);
        recognitionFailedOrBlockedRef.current = true;
      }
    } else {
      recognitionFailedOrBlockedRef.current = true;
    }
  };

  const drawWave = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(analyser.fftSize);
    
    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDomainData);
      
      // Calculate Volume RMS
      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        const normalized = (timeDomainData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / timeDomainData.length);
      maxVolumeRef.current = Math.max(maxVolumeRef.current, rms);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const percent = dataArray[i] / 255;
        const barHeight = Math.max(canvas.height * percent * 0.85, 3);
        
        ctx.fillStyle = percent > 0.4 ? '#FFC400' : '#D01C1F';
        
        const yPos = (canvas.height - barHeight) / 2;
        ctx.fillRect(x, yPos, barWidth - 1.5, barHeight);
        
        x += barWidth;
      }
    };
    draw();
  };

  const stopListening = () => {
    if (!isListening) return;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const currentSessionId = sessionIdRef.current;
    setTimeout(() => {
      // Only execute if this timeout corresponds to the session that just stopped,
      // and no new session has started.
      if (currentSessionId !== sessionIdRef.current) return;

      cleanupAudio();
      if (!transcriptReceivedRef.current) {
        if (recognitionFailedOrBlockedRef.current) {
          // Fallback only when API is blocked/unsupported
          if (maxVolumeRef.current > 0.05) {
            transcriptReceivedRef.current = true;
            if (onTranscript && targetPhrase) {
              onTranscript(targetPhrase);
            }
          } else {
            setErrorMessage("No speech detected. Try speaking louder.");
          }
        } else {
          // API is supported and active, but no transcript was returned (silence/mumble)
          setErrorMessage("Speech not recognized. Try speaking clearly.");
        }
      }
    }, 500);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 bg-espana-sand/30 p-5 rounded-3xl border border-espana-red/10 w-full max-w-xs shadow-sm">
      
      {/* Microphone trigger button */}
      <button
        onClick={toggleListening}
        type="button"
        className={`p-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center focus:outline-none relative ${
          isListening
            ? 'bg-espana-red hover:bg-red-700 text-white scale-105 border border-espana-gold animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
        } ${className}`}
        title={isListening ? 'Stop recording' : 'Start speaking'}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      {/* Visualizer canvas */}
      {isListening && (
        <div className="flex flex-col items-center gap-2 w-full mt-1">
          <span className="text-[10px] font-black text-espana-red uppercase tracking-widest animate-pulse flex items-center gap-1.5">
            <Sparkles size={10} className="fill-espana-gold text-espana-gold" />
            <span>Recording Voice... Speak Spanish</span>
          </span>
          <canvas 
            ref={canvasRef} 
            width={120} 
            height={28} 
            className="rounded-md border border-espana-red/5 bg-white/40 shadow-inner"
          />
        </div>
      )}

      {/* Help message */}
      {!isListening && !errorMessage && (
        <span className="text-[9px] font-black text-espana-charcoal/50 uppercase tracking-wider">
          Click to speak
        </span>
      )}

      {errorMessage && (
        <span className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-xl border border-red-150 text-center leading-normal">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default MicListener;
