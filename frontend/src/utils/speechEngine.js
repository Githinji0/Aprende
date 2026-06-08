/**
 * Browser Speech API Wrapper for Spanish Learning App
 */

// Cache of voices to handle asynchronous browser loading
let cachedVoices = [];

const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

// --- TEXT TO SPEECH (TTS) ---

/**
 * Pronounces a given Spanish string using window.speechSynthesis
 * @param {string} text - Spanish text to speak
 * @param {object} options - optional rate, pitch, or voice language
 */
export const speak = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure speed and tone
  utterance.rate = options.rate || 0.85; // Slightly slower for language learners
  utterance.pitch = options.pitch || 1.0;

  // Retrieve preferred voice accent from local storage, fallback to es-ES
  const preferredLang = typeof window !== 'undefined' ? (localStorage.getItem('voiceAccent') || 'es-ES') : 'es-ES';
  const lang = options.lang || preferredLang;
  utterance.lang = lang;

  // Get current voices (refresh cache if empty)
  let voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    voices = cachedVoices;
  }

  // Tiered match selection:
  // 1. Exact match case-insensitive (e.g. es-ES, es-MX)
  let matchingVoice = voices.find(
    (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
  );

  // 2. Starts with specific language code (e.g. es-ES, es-MX)
  if (!matchingVoice) {
    matchingVoice = voices.find(
      (voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase())
    );
  }

  // 3. Any Spanish voice fallback
  if (!matchingVoice) {
    matchingVoice = voices.find(
      (voice) => voice.lang.toLowerCase().startsWith('es')
    );
  }

  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
};

// --- SPEECH TO TEXT (STT / Speech Recognition) ---

/**
 * Checks if the browser supports Speech Recognition
 * @returns {boolean}
 */
export const isSpeechRecognitionSupported = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  return !!SpeechRecognition;
};

/**
 * Configures and returns a SpeechRecognition instance
 * @param {object} config - event handlers and options
 * @returns {SpeechRecognition|null}
 */
export const getSpeechRecognizer = (config = {}) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech Recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  
  // Retrieve preferred voice accent from local storage, fallback to es-ES
  const preferredLang = typeof window !== 'undefined' ? (localStorage.getItem('voiceAccent') || 'es-ES') : 'es-ES';
  
  // Configure
  recognition.lang = config.lang || preferredLang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  // Event handlers
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    if (config.onResult) {
      config.onResult(transcript, confidence);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech Recognition Error:', event.error);
    if (config.onError) {
      config.onError(event.error);
    }
  };

  recognition.onend = () => {
    if (config.onEnd) {
      config.onEnd();
    }
  };

  if (config.onStart) {
    recognition.onstart = config.onStart;
  }

  return recognition;
};
