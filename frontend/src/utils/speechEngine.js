/**
 * Browser Speech API Wrapper for Spanish Learning App
 */

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

  // Set Spanish locale
  const lang = options.lang || 'es-MX'; // default to Mexican Spanish
  utterance.lang = lang;

  // Try to find a high-quality native voice matching the language code
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(
    (voice) => voice.lang.startsWith(lang) || voice.lang.startsWith('es')
  );

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
  
  // Configure
  recognition.lang = config.lang || 'es-MX';
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
