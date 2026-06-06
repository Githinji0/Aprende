import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle2, Flame, Award, HelpCircle, AlertTriangle } from 'lucide-react';

const Dashboard = ({ user, onStartLesson, token }) => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch lessons
        const lessonsRes = await fetch('/api/lessons', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const lessonsData = await lessonsRes.json();

        // Fetch progress
        const progressRes = await fetch('/api/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const progressData = await progressRes.json();

        if (!lessonsRes.ok || !progressRes.ok) {
          throw new Error('Failed to load dashboard data.');
        }

        setLessons(lessonsData);
        setProgress(progressData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Aggregate all mistakes across all completed lessons for review
  const getAggregatedMistakes = () => {
    let list = [];
    progress.forEach((prog) => {
      if (prog.mistakes && prog.mistakes.length > 0) {
        prog.mistakes.forEach((m) => {
          list.push({
            ...m,
            lessonTitle: lessons.find(l => l._id === prog.lesson)?.title || 'Lesson'
          });
        });
      }
    });
    return list;
  };

  const mistakes = getAggregatedMistakes();

  // Helper to determine status of a lesson
  // - completed: exists in progress and is marked completed
  // - unlocked: index is 0 OR the previous lesson index was completed
  // - locked: not unlocked
  const getLessonStatus = (lesson, index) => {
    const record = progress.find(p => p.lesson === lesson._id);
    const isCompleted = record ? record.completed : false;

    if (index === 0) {
      return { isCompleted, isUnlocked: true, score: record?.score || 0 };
    }

    const prevLesson = lessons[index - 1];
    const prevRecord = progress.find(p => p.lesson === prevLesson._id);
    const prevCompleted = prevRecord ? prevRecord.completed : false;

    return {
      isCompleted,
      isUnlocked: prevCompleted,
      score: record?.score || 0
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-accent-indigo rounded-full animate-spin"></div>
        <p className="text-brand-500 font-semibold">Cargando tu mapa de aprendizaje...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
        <p className="font-bold text-lg mb-2">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Left Columns - Gamified Pathway Map */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900">Tu Ruta de Aprendizaje</h1>
          <p className="text-brand-500 text-sm mt-1">
            Complete each lesson sequentially to unlock new modules and earn XP rewards!
          </p>
        </div>

        {/* Visual Map / Tree Layout */}
        <div className="flex flex-col items-center gap-4 py-8 relative">
          
          {lessons.map((lesson, index) => {
            const { isCompleted, isUnlocked, score } = getLessonStatus(lesson, index);
            const isLast = index === lessons.length - 1;

            return (
              <React.Fragment key={lesson._id}>
                {/* Lesson Node Card */}
                <div 
                  className={`w-full max-w-lg p-6 rounded-3xl transition-all duration-300 relative border flex items-center justify-between ${
                    isCompleted
                      ? 'bg-emerald-50/80 border-emerald-200 shadow-md shadow-emerald-50'
                      : isUnlocked
                      ? 'bg-white border-brand-200 shadow-lg hover:shadow-xl hover:scale-[1.01] hover:border-accent-indigo'
                      : 'bg-brand-100/40 border-brand-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Node status icon indicator */}
                    <div className={`p-3.5 rounded-2xl ${
                      isCompleted 
                        ? 'bg-accent-emerald text-white shadow-md shadow-emerald-100'
                        : isUnlocked
                        ? 'bg-accent-indigo text-white shadow-md shadow-indigo-100'
                        : 'bg-brand-300 text-brand-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={24} />
                      ) : isUnlocked ? (
                        <Play size={24} className="fill-white" />
                      ) : (
                        <Lock size={24} />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          lesson.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-700' :
                          lesson.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {lesson.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-bold text-emerald-700">
                            Score: {score}%
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-brand-900 mt-1">
                        {index + 1}. {lesson.title}
                      </h3>
                      <p className="text-xs text-brand-500 mt-0.5 line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Start / Review Button */}
                  {isUnlocked ? (
                    <button
                      onClick={() => onStartLesson(lesson._id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-accent-indigo text-white hover:bg-indigo-600 hover:shadow-indigo-150'
                      }`}
                    >
                      {isCompleted ? 'Review' : 'Start'}
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-brand-200 text-brand-400">
                      <Lock size={20} />
                    </div>
                  )}
                </div>

                {/* Connecting arrow/line */}
                {!isLast && (
                  <div className={`h-8 w-1.5 rounded-full ${
                    isCompleted ? 'bg-accent-emerald' : 'bg-brand-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>

      {/* Right Column - Stats & Mistakes Review Center */}
      <div className="flex flex-col gap-6">
        
        {/* Stats Panel */}
        <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
          <h2 className="text-xl font-extrabold text-brand-900 flex items-center gap-2">
            <Award className="text-accent-indigo" />
            <span>Resumen de Logros</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-100/50 p-4 rounded-2xl border border-brand-200 flex flex-col items-center">
              <Flame size={28} className="text-orange-500 fill-orange-500" />
              <span className="text-2xl font-extrabold text-brand-900 mt-1">{user.streak} días</span>
              <span className="text-xs text-brand-500 font-medium mt-0.5">Racha Actual</span>
            </div>
            
            <div className="bg-brand-100/50 p-4 rounded-2xl border border-brand-200 flex flex-col items-center">
              <Award size={28} className="text-yellow-600 fill-yellow-100" />
              <span className="text-2xl font-extrabold text-brand-900 mt-1">{user.xp} XP</span>
              <span className="text-xs text-brand-500 font-medium mt-0.5">Puntos Ganados</span>
            </div>
          </div>
          <p className="text-xs text-brand-500 italic text-center">
            Tip: Complete a lesson every 24 hours to keep your learning streak burning!
          </p>
        </div>

        {/* Mistakes Review Center */}
        <div className="glass-card p-6 rounded-3xl border border-white/40 shadow-xl flex flex-col gap-4 max-h-[480px]">
          <h2 className="text-xl font-extrabold text-brand-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            <span>Centro de Repaso</span>
          </h2>
          
          <p className="text-xs text-brand-500">
            Below are spelling or pronunciation challenges where you faced minor issues. Take a moment to review them!
          </p>

          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {mistakes.length === 0 ? (
              <div className="text-center py-8 bg-brand-100/30 rounded-2xl border border-dashed border-brand-300">
                <span className="text-2xl">🎉</span>
                <p className="text-sm font-semibold text-brand-700 mt-2">No mistakes to review!</p>
                <p className="text-xs text-brand-500 mt-0.5">Keep up the excellent work.</p>
              </div>
            ) : (
              mistakes.map((mistake, idx) => (
                <div 
                  key={idx}
                  className="bg-brand-100/50 border border-brand-200 p-3.5 rounded-2xl text-xs flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-brand-700 uppercase tracking-wider scale-[0.9] origin-left">
                      {mistake.type === 'spelling' ? '✏️ Ortografía' : '🗣️ Pronunciación'}
                    </span>
                    <span className="text-[10px] text-brand-400 font-medium">
                      {mistake.lessonTitle}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-brand-500 font-medium">Challenge:</span>
                    <p className="text-brand-900 font-semibold mt-0.5">{mistake.question}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-brand-200/50">
                    <div>
                      <span className="text-red-500 font-bold">You entered:</span>
                      <p className="font-medium text-brand-800 line-clamp-1">{mistake.userAnswer || '(No response)'}</p>
                    </div>
                    <div>
                      <span className="text-accent-emerald font-bold">Correct key:</span>
                      <p className="font-medium text-brand-800 line-clamp-1">{mistake.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
