import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Volume2, Mic, CheckCircle, AlertCircle, XCircle, ArrowRight, Award, Flame, Keyboard, Trophy, Sparkles } from 'lucide-react';
import AudioSpeaker from '../components/AudioSpeaker';
import MicListener from '../components/MicListener';
import { checkSpelling, stripAccents, matchWithPlaceholders } from '../utils/stringMetrics';
import { PixelCTAButton } from '../components/PixelCTAButton';

const LessonInterface = ({ lessonId, token, onBackToDashboard }) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Phase management: 'study' (vocabulary list) or 'quiz' (assessment)
  const [phase, setPhase] = useState('study');

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userSpellingInput, setUserSpellingInput] = useState('');
  const [useSpeechFallback, setUseSpeechFallback] = useState(false);
  const [userSelectedOption, setUserSelectedOption] = useState(null);
  const [userSpeechTranscript, setUserSpeechTranscript] = useState('');
  
  // Feedback states
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Accumulators
  const [scorePoints, setScorePoints] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load lesson details.');
        }
        setLesson(data);
        if (data.lessonType === 'checkpoint') {
          setPhase('quiz');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, token]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-brand-200 pb-4 mb-2">
          <div className="h-5 w-24 bg-brand-200 rounded-lg"></div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="h-3.5 w-20 bg-brand-200 rounded-full"></div>
            <div className="h-6 w-48 bg-brand-200 rounded-lg"></div>
          </div>
        </div>

        {/* Card Body Skeleton */}
        <div className="border border-brand-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 bg-white/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-200 rounded-full"></div>
            <div className="h-5 w-40 bg-brand-200 rounded-lg"></div>
          </div>
          <div className="h-4 w-full bg-brand-200 rounded"></div>

          {/* Grid list of terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-brand-100/60 border border-brand-200 rounded-2xl p-5 flex items-center justify-between animate-pulse">
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-24 bg-brand-200 rounded"></div>
                  <div className="h-4 w-16 bg-brand-200 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-brand-200 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* CTA Button Skeleton */}
          <div className="h-14 bg-brand-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
        <p className="font-bold text-lg mb-2">Error loading lesson</p>
        <p className="text-sm">{error || 'Lesson not found'}</p>
        <button 
          onClick={() => onBackToDashboard(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuiz = lesson.quizzes[currentQuizIndex];

  // Evaluate the user's speech transcript for pronunciation tasks
  const evaluateSpeech = (transcript) => {
    setUserSpeechTranscript(transcript);
    
    const cleanTranscript = stripAccents(transcript.toLowerCase().replace(/[¿?¡!.,]/g, '').trim());
    const cleanKey = stripAccents(currentQuiz.answerKey.toLowerCase().replace(/[¿?¡!.,]/g, '').trim());

    setAnswered(true);

    if (cleanTranscript === cleanKey || matchWithPlaceholders(cleanTranscript, cleanKey)) {
      setIsCorrect(true);
      setWarningMessage('');
      setScorePoints(prev => prev + 100);
    } else {
      // Check if transcription contains key, or if it is close (e.g. distance of 1 or 2)
      // Allow partial credit if they said most of it correct
      const staticWords = cleanKey.replace(/\[.*?\]/g, '').split(/\s+/).filter(Boolean);
      const wordCount = staticWords.length;
      let matchRatio = 0;
      if (wordCount > 0) {
        const matchingWords = staticWords.filter(word => cleanTranscript.includes(word));
        matchRatio = matchingWords.length / wordCount;
      }

      if (matchRatio >= 0.7) {
        setIsCorrect(true);
        setWarningMessage('¡Casi! Native accent could be slightly clearer, but you nailed the phrase.');
        setScorePoints(prev => prev + 75);
      } else {
        setIsCorrect(false);
        setWarningMessage('');
        // Log mistake
        setMistakes(prev => [
          ...prev,
          {
            quizId: currentQuiz._id || currentQuizIndex.toString(),
            question: currentQuiz.question,
            userAnswer: transcript,
            correctAnswer: currentQuiz.answerKey,
            type: 'pronunciation'
          }
        ]);
      }
    }
  };

  // Evaluate Multiple Choice selections
  const evaluateMultipleChoice = (option) => {
    setUserSelectedOption(option);
    setAnswered(true);

    if (option === currentQuiz.answerKey) {
      setIsCorrect(true);
      setWarningMessage('');
      setScorePoints(prev => prev + 100);
    } else {
      setIsCorrect(false);
      setWarningMessage('');
      // Log mistake
      setMistakes(prev => [
        ...prev,
        {
          quizId: currentQuiz._id || currentQuizIndex.toString(),
          question: currentQuiz.question,
          userAnswer: option,
          correctAnswer: currentQuiz.answerKey,
          type: 'multiple-choice'
        }
      ]);
    }
  };

  // Evaluate Spelling inputs
  const evaluateSpelling = () => {
    if (!userSpellingInput.trim()) return;

    const result = checkSpelling(userSpellingInput, currentQuiz.answerKey);
    setAnswered(true);

    if (result.success) {
      setIsCorrect(true);
      if (result.partial) {
        setWarningMessage(result.warning);
        setScorePoints(prev => prev + result.score);
        // Log minor spelling typos to mistakes for review, but keep it marked correct/passed!
        setMistakes(prev => [
          ...prev,
          {
            quizId: currentQuiz._id || currentQuizIndex.toString(),
            question: currentQuiz.question,
            userAnswer: userSpellingInput,
            correctAnswer: currentQuiz.answerKey,
            type: 'spelling'
          }
        ]);
      } else {
        setWarningMessage('');
        setScorePoints(prev => prev + 100);
      }
    } else {
      setIsCorrect(false);
      setWarningMessage('');
      // Log hard spelling mistake
      setMistakes(prev => [
        ...prev,
        {
          quizId: currentQuiz._id || currentQuizIndex.toString(),
          question: currentQuiz.question,
          userAnswer: userSpellingInput,
          correctAnswer: currentQuiz.answerKey,
          type: 'spelling'
        }
      ]);
    }
  };

  // Advance to next quiz or submit final score
  const handleNextQuiz = async () => {
    // Reset individual quiz states
    setAnswered(false);
    setIsCorrect(false);
    setWarningMessage('');
    setUserSpellingInput('');
    setUserSelectedOption(null);
    setUserSpeechTranscript('');
    setUseSpeechFallback(false);

    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < lesson.quizzes.length) {
      setCurrentQuizIndex(nextIndex);
    } else {
      // Finish Quiz and save progress
      setQuizFinished(true);
      setSavingProgress(true);

      const finalPercentageScore = Math.round(scorePoints / lesson.quizzes.length);

      try {
        const response = await fetch('/api/progress/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            lessonId: lesson._id,
            score: finalPercentageScore,
            mistakes: mistakes
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save completed lesson.');
        }

        setCompletionResult(data);
      } catch (err) {
        console.error('Error saving progress:', err);
      } finally {
        setSavingProgress(false);
      }
    }
  };

  const renderAccentHelper = (setter) => {
    if (answered) return null;
    const spanishChars = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'];
    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
        {spanishChars.map(char => (
          <button
            key={char}
            type="button"
            onClick={() => setter(prev => prev + char)}
            className="w-9 h-9 rounded-xl bg-brand-100 hover:bg-brand-200 border border-brand-200 text-sm font-bold text-brand-800 transition-colors shadow-sm select-none focus:outline-none"
          >
            {char}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-brand-200 pb-4 mb-6">
        <button
          onClick={() => onBackToDashboard(null)}
          className="flex items-center gap-1.5 text-brand-600 hover:text-brand-900 font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <div className="text-right">
          <span className="text-xs font-extrabold text-accent-indigo uppercase tracking-widest">
            {lesson.difficulty} Lesson
          </span>
          <h2 className="text-xl font-bold text-brand-900">{lesson.title}</h2>
        </div>
      </div>

      {/* --- PHASE 1: VOCABULARY STUDY PANEL --- */}
      {phase === 'study' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-accent-indigo" />
            <h3 className="text-lg font-bold text-brand-900">Vocabulary Review</h3>
          </div>
          <p className="text-sm text-brand-500">
            Listen to each word's pronunciation carefully. Tap the speaker to hear a native speak, then test your knowledge!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {lesson.vocabulary.map((vocab, idx) => (
              <div 
                key={idx} 
                className="bg-brand-50 hover:bg-indigo-50/40 p-5 rounded-2xl border border-brand-200 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xl font-extrabold text-brand-900 tracking-wide">
                    {vocab.spanish}
                  </span>
                  <span className="text-sm text-brand-500 font-medium">
                    {vocab.english}
                  </span>
                  {vocab.pronunciationHint && (
                    <span className="text-xs text-indigo-400 font-semibold italic">
                      Pronounced: "{vocab.pronunciationHint}"
                    </span>
                  )}
                </div>
                
                {/* Audio TTS button */}
                <AudioSpeaker text={vocab.spanish} size={20} />
              </div>
            ))}
          </div>

          <PixelCTAButton
            onClick={() => setPhase('quiz')}
            className="w-full glass-red-button py-4 text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all mt-2 animate-snakelight"
          >
            <span>Start Practice Quiz</span>
            <ArrowRight size={18} />
          </PixelCTAButton>
        </div>
      )}

      {/* --- PHASE 2: QUIZ PRACTICE PANEL --- */}
      {phase === 'quiz' && !quizFinished && (
        <div className="flex flex-col gap-6">
          
          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-brand-500 pl-1 uppercase tracking-wider items-center">
              <span className="flex items-center gap-1">
                {lesson.lessonType === 'checkpoint' ? (
                  <>
                    <span>Chapter Assessment</span>
                    <Trophy size={14} className="text-yellow-500 fill-yellow-100" />
                  </>
                ) : (
                  'Practicing'
                )}
              </span>
              <span>Question {currentQuizIndex + 1} of {lesson.quizzes.length}</span>
            </div>
            <div className="w-full h-3 bg-brand-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-espana-red transition-all duration-300"
                style={{ width: `${((currentQuizIndex + 1) / lesson.quizzes.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl flex flex-col gap-6">
            
            {/* Quiz Header Instruction */}
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest mb-1 pl-0.5">
                {lesson.lessonType === 'checkpoint' ? 'Special Assessment Challenge' : `Challenge Mode: ${currentQuiz.type.replace('-', ' ')}`}
              </span>
              <h3 className="text-xl font-bold text-brand-900">
                {currentQuiz.question}
              </h3>
            </div>

            {/* Answer inputs based on type */}

            {/* MULTIPLE CHOICE */}
            {currentQuiz.type === 'multiple-choice' && (
              <div className="flex flex-col gap-3 my-2">
                {currentQuiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => evaluateMultipleChoice(option)}
                    className={`w-full py-4 px-5 rounded-2xl border text-left font-semibold text-sm transition-all duration-200 ${
                      answered
                        ? option === currentQuiz.answerKey
                          ? 'bg-emerald-50 border-accent-emerald text-emerald-800'
                          : option === userSelectedOption
                          ? 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-brand-50/50 border-brand-200 text-brand-400'
                        : 'bg-white hover:bg-indigo-50/30 border-brand-200 text-brand-700 hover:border-accent-indigo'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* SPELLING INPUT */}
            {currentQuiz.type === 'spelling' && (
              <div className="flex flex-col gap-4 my-2">
                <input
                  type="text"
                  disabled={answered}
                  value={userSpellingInput}
                  onChange={(e) => setUserSpellingInput(e.target.value)}
                  placeholder="Type the Spanish answer..."
                  className="w-full p-4 bg-brand-100/50 border border-brand-200 rounded-2xl text-lg font-bold text-brand-900 placeholder-brand-400 focus:bg-white focus:border-accent-indigo outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200 disabled:opacity-75 disabled:bg-brand-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') evaluateSpelling();
                  }}
                />

                {renderAccentHelper(setUserSpellingInput)}

                {!answered && (
                  <button
                    onClick={evaluateSpelling}
                    disabled={!userSpellingInput.trim()}
                    className="w-full glass-red-button py-3.5 text-xs font-black disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md"
                  >
                    Submit Spelling Check
                  </button>
                )}
              </div>
            )}

            {/* SPEECH PRONUNCIATION */}
            {currentQuiz.type === 'pronunciation' && (
              <div className="flex flex-col items-center gap-6 my-4 p-6 bg-brand-50 border border-brand-200 rounded-3xl relative">
                
                {/* Audio assistance */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-brand-900">
                    "{currentQuiz.answerKey}"
                  </span>
                  <AudioSpeaker text={currentQuiz.answerKey} size={18} />
                </div>
                
                <p className="text-xs text-brand-500 font-medium text-center max-w-sm">
                  {useSpeechFallback 
                    ? "Type the Spanish phrase exactly as shown above to verify spelling." 
                    : "Click the microphone button and read the phrase above loudly in Spanish."}
                </p>

                {!answered && !useSpeechFallback && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <MicListener 
                      onTranscript={evaluateSpeech} 
                      targetPhrase={currentQuiz.answerKey}
                    />
                    <button
                      type="button"
                      onClick={() => setUseSpeechFallback(true)}
                      className="text-xs text-accent-indigo hover:text-indigo-600 font-extrabold focus:outline-none flex items-center justify-center gap-1.5"
                    >
                      <Keyboard size={14} />
                      <span>Type instead (Microphone not working)</span>
                    </button>
                  </div>
                )}

                {!answered && useSpeechFallback && (
                  <div className="flex flex-col gap-3 w-full max-w-md">
                    <input
                      type="text"
                      value={userSpellingInput}
                      onChange={(e) => setUserSpellingInput(e.target.value)}
                      placeholder="Type the phrase here..."
                      className="w-full p-3.5 bg-white border border-brand-200 focus:border-accent-indigo outline-none focus:ring-2 focus:ring-indigo-100 rounded-2xl font-semibold text-center text-brand-900 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') evaluateSpeech(userSpellingInput);
                      }}
                    />

                    {renderAccentHelper(setUserSpellingInput)}

                    <div className="flex justify-between items-center px-1">
                      <button
                        type="button"
                        onClick={() => evaluateSpeech(userSpellingInput)}
                        disabled={!userSpellingInput.trim()}
                        className="px-4 py-2.5 glass-red-button text-xs font-black transition-all shadow-sm"
                      >
                        Submit Spelling
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseSpeechFallback(false)}
                        className="text-xs text-brand-500 hover:text-brand-700 font-bold focus:outline-none flex items-center gap-1"
                      >
                        <Mic size={14} />
                        <span>Use microphone instead</span>
                      </button>
                    </div>
                  </div>
                )}

                {userSpeechTranscript && (
                  <div className="text-center w-full pt-4 border-t border-brand-200">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                      Transcribed spoken output:
                    </span>
                    <p className="text-brand-800 font-bold mt-1 text-sm">
                      "{userSpeechTranscript}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FEEDBACK BANNER */}
            {answered && (
              <div className={`p-5 rounded-3xl border animate-fade-in flex flex-col gap-1.5 ${
                isCorrect
                  ? warningMessage 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-emerald-50 border-accent-emerald text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}>
                <div className="flex items-center gap-2 font-extrabold">
                  {isCorrect ? (
                    warningMessage ? (
                      <AlertCircle className="text-amber-500 fill-amber-50" />
                    ) : (
                      <CheckCircle className="text-accent-emerald fill-emerald-50" />
                    )
                  ) : (
                    <XCircle className="text-red-500 fill-red-50" />
                  )}
                  <span>
                    {isCorrect 
                      ? warningMessage ? 'Almost!' : 'Excellent! Correct' 
                      : 'Incorrect'
                    }
                  </span>
                </div>

                <p className="text-sm">
                  {isCorrect 
                    ? warningMessage || currentQuiz.englishTranslation || 'Your response is correct.'
                    : `Correct answer: "${currentQuiz.answerKey}"`
                  }
                </p>

                {!isCorrect && currentQuiz.englishTranslation && (
                  <p className="text-xs text-brand-500 font-medium italic mt-1">
                    Context: {currentQuiz.englishTranslation}
                  </p>
                )}

                <button
                  onClick={handleNextQuiz}
                  className="mt-3 w-full glass-red-button py-3.5 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- PHASE 3: COMPLETION MODAL --- */}
      {quizFinished && (
        <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-2xl text-center flex flex-col items-center gap-6 animate-fade-in">
          
          <div className="bg-espana-red p-5 rounded-full text-white shadow-xl shadow-red-100/30">
            <Award size={48} className="animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-brand-900 mt-2">
              <span className="flex items-center justify-center gap-2">
                {lesson.lessonType === 'checkpoint' ? (
                  <>
                    <Trophy className="text-yellow-500 fill-yellow-100" size={26} />
                    <span>Chapter Passed!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="text-yellow-500 animate-pulse" size={26} />
                    <span>Congratulations!</span>
                  </>
                )}
              </span>
            </h2>
            <p className="text-brand-500 text-sm mt-1">
              {lesson.lessonType === 'checkpoint'
                ? 'You successfully passed the Chapter Assessment: '
                : 'You completed the lesson: '}
              <strong className="text-brand-800">{lesson.title}</strong>
            </p>
          </div>

          {savingProgress ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-accent-indigo rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-brand-500">Saving your accomplishments to the database...</span>
            </div>
          ) : completionResult ? (
            <div className="flex flex-col gap-5 w-full max-w-sm">
              <div className="grid grid-cols-2 gap-4">
                
                {/* XP Reward */}
                <div className="bg-brand-50 border border-brand-200 p-4 rounded-2xl flex flex-col items-center">
                  <Award size={24} className="text-yellow-600 fill-yellow-100" />
                  <span className="text-lg font-bold text-brand-900 mt-1">
                    +{lesson.xpReward} XP
                  </span>
                  <span className="text-[10px] text-brand-400 uppercase tracking-widest font-extrabold">
                    XP Reward
                  </span>
                </div>
                
                {/* Streak count */}
                <div className="bg-brand-50 border border-brand-200 p-4 rounded-2xl flex flex-col items-center">
                  <Flame size={24} className="text-orange-500 fill-orange-50" />
                  <span className="text-lg font-bold text-brand-900 mt-1">
                    {completionResult.streak} days
                  </span>
                  <span className="text-[10px] text-brand-400 uppercase tracking-widest font-extrabold">
                    Active Streak
                  </span>
                </div>

              </div>

              <div className="bg-brand-100/40 p-4 rounded-2xl border border-brand-200 text-sm">
                <span className="font-extrabold text-brand-700 block">Performance Summary</span>
                <span className="text-brand-600 block mt-1">
                  Overall Accuracy: {Math.round(scorePoints / lesson.quizzes.length)}%
                </span>
                <span className="text-xs text-brand-500 mt-0.5 block">
                  Errors logged for review: {mistakes.length}
                </span>
              </div>

              <button
                onClick={() => onBackToDashboard({
                  xp: completionResult.xp,
                  streak: completionResult.streak,
                  lastActiveDate: completionResult.lastActiveDate
                })}
                className="w-full glass-emerald-button py-4 text-xs font-black transition-all shadow-md"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-red-500">
                Failed to save progress to the server. Check your connection.
              </p>
              <button
                onClick={() => onBackToDashboard(null)}
                className="mt-4 px-6 py-3 glass-button text-xs font-black transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default LessonInterface;
