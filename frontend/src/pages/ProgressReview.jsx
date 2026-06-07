import React, { useState, useEffect, useRef } from 'react';
import { Award, Flame, Star, AlertTriangle, ArrowLeft, PenTool, Volume2, Sparkles, TrendingUp, CheckSquare, ChevronRight, Check } from 'lucide-react';

const ProgressReview = ({ user, token, onBackToDashboard, searchQuery }) => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Animation states
  const [animateCharts, setAnimateCharts] = useState(false);
  
  // Tooltip & flashcard interactive states
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [expandedMistakes, setExpandedMistakes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonsRes = await fetch('/api/lessons', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();

        const progressRes = await fetch('/api/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressData = await progressRes.json();

        if (!lessonsRes.ok || !progressRes.ok) {
          throw new Error('Failed to load progress data.');
        }

        setLessons(lessonsData);
        setProgress(progressData);
        
        // Trigger entrance animations
        setTimeout(() => setAnimateCharts(true), 200);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --- ANALYTICS CALCULATIONS ---

  // 1. Average accuracy across completed lessons
  const getAverageAccuracy = () => {
    const completedRecords = progress.filter(p => p.completed && p.score !== undefined);
    if (completedRecords.length === 0) return 0;
    const sum = completedRecords.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / completedRecords.length);
  };

  // 2. Completed count
  const completedLessonsCount = progress.filter(p => p.completed).length;
  const totalLessonsCount = lessons.length || 1;
  const courseCompletionPercent = Math.round((completedLessonsCount / totalLessonsCount) * 100);

  // 3. Weekly study completions (Last 7 days)
  const getWeeklyCompletions = () => {
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysMap[d.getDay()];
      const dayStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      const dateKey = d.toDateString();
      const count = progress.filter(p => {
        if (!p.completed || !p.updatedAt) return false;
        return new Date(p.updatedAt).toDateString() === dateKey;
      }).length;

      result.push({
        label: dayName,
        date: dayStr,
        count: count
      });
    }
    return result;
  };

  // 4. Accuracy Trend (Last 10 lessons completed)
  const getPerformanceTrend = () => {
    const sortedProgress = progress
      .filter(p => p.completed && p.score !== undefined && p.updatedAt)
      .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
      .slice(-10);
    
    return sortedProgress.map((p, idx) => {
      const lessonTitle = lessons.find(l => l._id === p.lesson)?.title || 'Lesson';
      return {
        index: idx + 1,
        score: p.score,
        lessonTitle
      };
    });
  };

  // 5. Aggregate mistakes log
  const getAggregatedMistakes = () => {
    let list = [];
    progress.forEach((prog) => {
      if (prog.mistakes && prog.mistakes.length > 0) {
        prog.mistakes.forEach((m) => {
          const lessonTitle = lessons.find(l => l._id === prog.lesson)?.title || 'Lesson';
          
          if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matches = m.question.toLowerCase().includes(query) ||
                            (m.userAnswer && m.userAnswer.toLowerCase().includes(query)) ||
                            (m.correctAnswer && m.correctAnswer.toLowerCase().includes(query)) ||
                            lessonTitle.toLowerCase().includes(query);
            if (!matches) return;
          }

          list.push({
            ...m,
            lessonTitle
          });
        });
      }
    });
    return list;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-6">
        <div className="h-6 w-32 bg-brand-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border border-brand-200 rounded-3xl p-6 bg-white/60 h-64"></div>
          <div className="md:col-span-2 border border-brand-200 rounded-3xl p-6 bg-white/60 h-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
        <p className="font-bold text-lg mb-2">Error loading progress</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const mistakes = getAggregatedMistakes();
  const averageAccuracy = getAverageAccuracy();
  const activityData = getWeeklyCompletions();
  const trendData = getPerformanceTrend();

  // --- SVG PLOTTING CALCULATIONS (Line Graph) ---
  const graphWidth = 500;
  const graphHeight = 160;
  const padX = 40;
  const padY = 25;

  const displayTrend = trendData.length > 0 ? trendData : [
    { index: 1, score: 70, lessonTitle: 'Example: Saludos' },
    { index: 2, score: 85, lessonTitle: 'Example: Casa Botín' },
    { index: 3, score: 80, lessonTitle: 'Example: Pronombres' },
    { index: 4, score: 95, lessonTitle: 'Example: Estaciones' },
    { index: 5, score: 90, lessonTitle: 'Example: Checkpoint A1' }
  ];

  const trendPoints = displayTrend.map((t, idx) => {
    const totalPoints = displayTrend.length;
    const x = padX + (idx * ((graphWidth - (padX * 2)) / Math.max(totalPoints - 1, 1)));
    const y = (graphHeight - padY) - (t.score * ((graphHeight - (padY * 2)) / 100));
    return { ...t, x, y };
  });

  let linePathD = '';
  if (trendPoints.length > 0) {
    linePathD = `M ${trendPoints[0].x} ${trendPoints[0].y} ` + trendPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // --- SVG CIRCLE DETAILS (Progress Ring) ---
  const ringRadius = 45;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeOffset = ringCircumference - (courseCompletionPercent / 100) * ringCircumference;

  // --- BAR CHART HEIGHTS MATH ---
  const maxActivityCount = Math.max(...activityData.map(d => d.count), 1);

  const toggleMistake = (idx) => {
    setExpandedMistakes(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-8 animate-fade-in text-brand-900">
      
      {/* Navigation & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-extrabold text-accent-indigo hover:text-indigo-700 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-black text-brand-900 tracking-tight mt-1">Your Learning Progress</h1>
        </div>
      </div>

      {/* Row 1: KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Streak KPI */}
        <div className="glass-card p-5 rounded-3xl border border-white/40 shadow-sm flex items-center gap-4 bg-white/70">
          <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
            <Flame size={26} className="fill-orange-500 animate-pulse text-orange-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand-900 leading-tight">{user.streak} days</span>
            <span className="text-[11px] text-brand-400 font-extrabold uppercase tracking-widest mt-0.5">Current Streak</span>
          </div>
        </div>

        {/* XP KPI */}
        <div className="glass-card p-5 rounded-3xl border border-white/40 shadow-sm flex items-center gap-4 bg-white/70">
          <div className="w-12 h-12 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
            <Star size={26} className="fill-yellow-400 text-yellow-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand-900 leading-tight">{user.xp} XP</span>
            <span className="text-[11px] text-brand-400 font-extrabold uppercase tracking-widest mt-0.5">XP Earned</span>
          </div>
        </div>

        {/* Accuracy KPI */}
        <div className="glass-card p-5 rounded-3xl border border-white/40 shadow-sm flex items-center gap-4 bg-white/70">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
            <TrendingUp size={26} className="text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand-900 leading-tight">{averageAccuracy}%</span>
            <span className="text-[11px] text-brand-400 font-extrabold uppercase tracking-widest mt-0.5">Average Accuracy</span>
          </div>
        </div>

      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graph 1: Performance Line Graph */}
        <div className="glass-card p-6 rounded-[2rem] border border-white/40 shadow-md flex flex-col gap-4 bg-white/70 relative">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-accent-indigo uppercase tracking-wider">Recent History</span>
              <h3 className="text-base font-black text-brand-900">Accuracy Trend</h3>
            </div>
            {trendData.length === 0 && (
              <span className="text-[10px] font-black text-brand-400 bg-brand-100 px-2.5 py-0.5 rounded-full uppercase">Demo</span>
            )}
          </div>

          <div className="relative flex-1 min-h-[180px] bg-brand-50/30 rounded-2xl border border-brand-200/50 p-2 flex items-center justify-center overflow-hidden">
            {/* Interactive Score Tooltip */}
            {hoveredPoint && (
              <div 
                className="absolute bg-brand-900 text-white text-[10px] font-black p-2 rounded-xl shadow-lg pointer-events-none z-20 flex flex-col gap-0.5 animate-fade-in border border-brand-800"
                style={{ 
                  left: `${(hoveredPoint.x / graphWidth) * 90}%`, 
                  top: `${(hoveredPoint.y / graphHeight) * 75 - 15}%` 
                }}
              >
                <span className="text-accent-violet">Accuracy: {hoveredPoint.score}%</span>
                <span className="text-white/70 leading-none truncate max-w-[120px]">{hoveredPoint.lessonTitle}</span>
              </div>
            )}

            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
              {/* Grid Horizontal Guidelines */}
              <line x1={padX} y1={padY} x2={graphWidth - padX} y2={padY} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
              <line x1={padX} y1={(graphHeight - padY) / 2 + padY / 2} x2={graphWidth - padX} y2={(graphHeight - padY) / 2 + padY / 2} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
              <line x1={padX} y1={graphHeight - padY} x2={graphWidth - padX} y2={graphHeight - padY} stroke="#cbd5e1" strokeWidth="1" />
              
              {/* Y Axis Labels */}
              <text x={padX - 8} y={padY + 4} textAnchor="end" className="text-[10px] font-extrabold fill-brand-400">100%</text>
              <text x={padX - 8} y={(graphHeight - padY) / 2 + padY / 2 + 4} textAnchor="end" className="text-[10px] font-extrabold fill-brand-400">50%</text>
              <text x={padX - 8} y={graphHeight - padY + 4} textAnchor="end" className="text-[10px] font-extrabold fill-brand-400">0%</text>

              {/* Curve Line */}
              {linePathD && (
                <path 
                  d={linePathD} 
                  fill="none" 
                  stroke="#D01C1F" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    strokeDasharray: animateCharts ? '0' : '1000',
                    strokeDashoffset: animateCharts ? '0' : '1000'
                  }}
                />
              )}

              {/* Data points */}
              {trendPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#fff"
                  stroke="#D01C1F"
                  strokeWidth="3.5"
                  className="cursor-pointer transition-all duration-200 hover:scale-150 hover:fill-accent-indigo"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Graph 2: Study Activity Bar Chart */}
        <div className="glass-card p-6 rounded-[2rem] border border-white/40 shadow-md flex flex-col gap-4 bg-white/70">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-accent-indigo uppercase tracking-wider">Activity</span>
            <h3 className="text-base font-black text-brand-900">Completed Lessons (Last 7 Days)</h3>
          </div>

          <div className="flex-1 bg-brand-50/30 rounded-2xl border border-brand-200/50 p-4 flex items-end justify-between gap-2 h-44">
            {activityData.map((day) => {
              const barHeightPercent = (day.count / maxActivityCount) * 80 + 10; // min 10% for layout visibility
              return (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  
                  {/* Top indicator count label */}
                  {day.count > 0 ? (
                    <span className="text-[10px] font-black text-accent-indigo bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md leading-none">
                      {day.count}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-brand-300 leading-none">0</span>
                  )}

                  {/* Vertical solid bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out origin-bottom ${
                        day.count > 0 
                          ? 'bg-accent-indigo shadow-md shadow-red-100/50' 
                          : 'bg-brand-200'
                      }`}
                      style={{ 
                        height: animateCharts ? `${barHeightPercent}%` : '10%'
                      }}
                    ></div>
                  </div>

                  {/* Label days */}
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-black text-brand-850">{day.label}</span>
                    <span className="text-[8px] font-bold text-brand-400 mt-1 whitespace-nowrap">{day.date}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Progress Ring & Errors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Completion Ring Card */}
        <div className="glass-card p-6 rounded-[2rem] border border-white/40 shadow-md bg-white/70 flex flex-col items-center text-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-accent-indigo uppercase tracking-wider">Curriculum</span>
            <h3 className="text-base font-black text-brand-900 mt-0.5">Course Progress</h3>
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                fill="transparent"
                stroke="#E3D8C6"
                strokeWidth="7"
                className="opacity-60"
              />
              {/* Animated foreground ring */}
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                fill="transparent"
                stroke="#FFC400"
                strokeWidth="8"
                strokeDasharray={ringCircumference}
                strokeDashoffset={animateCharts ? strokeOffset : ringCircumference}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="text-xl font-black text-brand-900">{courseCompletionPercent}%</span>
              <span className="text-[9px] font-extrabold text-brand-450 uppercase tracking-widest mt-1">Done</span>
            </div>
          </div>

          <p className="text-xs text-brand-500 font-semibold leading-tight px-4">
            You have completed <strong>{completedLessonsCount}</strong> of <strong>{totalLessonsCount}</strong> total curriculum lessons.
          </p>
        </div>

        {/* Errors Breakdown list */}
        <div className="md:col-span-2 glass-card p-6 rounded-[2rem] border border-white/40 shadow-md bg-white/70 flex flex-col justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-accent-indigo uppercase tracking-wider">Challenge Categories</span>
            <h3 className="text-base font-black text-brand-900 mt-0.5">Mistake Breakdown</h3>
          </div>

          {/* Horizontal comparison bar */}
          <div className="flex flex-col gap-6 flex-1 justify-center py-2">
            {(() => {
              const spellingCount = mistakes.filter(m => m.type === 'spelling').length;
              const pronunCount = mistakes.filter(m => m.type === 'pronunciation').length;
              const totalMistakes = spellingCount + pronunCount || 1;
              const spellPercent = Math.round((spellingCount / totalMistakes) * 100);
              const pronunPercent = Math.round((pronunCount / totalMistakes) * 100);

              return (
                <div className="flex flex-col gap-4">
                  
                  {/* Visual segment progress bar */}
                  <div className="flex flex-col gap-2">
                    <div className="w-full h-3.5 rounded-full overflow-hidden bg-brand-100 flex border border-brand-200">
                      {spellingCount > 0 && (
                        <div 
                          className="h-full bg-accent-indigo transition-all duration-700 ease-out" 
                          style={{ width: `${spellPercent}%` }}
                          title={`Ortografía: ${spellingCount}`}
                        ></div>
                      )}
                      {pronunCount > 0 && (
                        <div 
                          className="h-full bg-accent-violet transition-all duration-700 ease-out" 
                          style={{ width: `${pronunPercent}%` }}
                          title={`Pronunciación: ${pronunCount}`}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* KPI categories labels */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Spelling category */}
                    <div className="flex items-start gap-2.5 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-accent-indigo">
                        <PenTool size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Spelling</span>
                        <span className="text-base font-black text-brand-900 mt-1">{spellingCount} mistakes</span>
                        <span className="text-[9px] text-brand-400 font-bold mt-0.5">{spellPercent}% of total</span>
                      </div>
                    </div>

                    {/* Pronunciation category */}
                    <div className="flex items-start gap-2.5 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0 text-accent-violet">
                        <Volume2 size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Pronunciation</span>
                        <span className="text-base font-black text-brand-900 mt-1">{pronunCount} mistakes</span>
                        <span className="text-[9px] text-brand-400 font-bold mt-0.5">{pronunPercent}% of total</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Row 4: Review Mistakes Flashcard Center */}
      <div className="glass-card p-6 md:p-8 rounded-[2.2rem] border border-white/40 shadow-xl bg-white/70 flex flex-col gap-6">
        
        <div className="flex flex-col gap-1.5 border-b border-brand-200 pb-4">
          <h2 className="text-xl font-black text-brand-900 flex items-center gap-2">
            <AlertTriangle className="text-accent-indigo" />
            <span>Review Challenges ({mistakes.length})</span>
          </h2>
          <p className="text-xs text-brand-500">
            Review your incorrect answers to reinforce your vocabulary and phonetics. Click on challenges to see corrections!
          </p>
        </div>

        {/* Collapsible search-filtered list of mistakes */}
        <div className="flex flex-col gap-3 mt-1">
          {mistakes.length === 0 ? (
            <div className="text-center py-16 bg-brand-50/50 rounded-3xl border border-dashed border-brand-300">
              <div className="text-accent-violet flex justify-center mb-3">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <p className="text-base font-bold text-brand-700 mt-3">All caught up!</p>
              <p className="text-xs text-brand-500 mt-1">You have no recorded mistakes matching your search query.</p>
            </div>
          ) : (
            mistakes.map((mistake, idx) => {
              const isExpanded = !!expandedMistakes[idx];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleMistake(idx)}
                  className="bg-white hover:bg-brand-50 border border-brand-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  {/* Top row: meta */}
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                      {mistake.type === 'spelling' ? (
                        <>
                          <PenTool size={12} className="text-accent-indigo" />
                          <span>Spelling</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} className="text-accent-violet" />
                          <span>Pronunciation</span>
                        </>
                      )}
                    </span>
                    <span className="text-[9px] text-brand-500 font-extrabold bg-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {mistake.lessonTitle}
                    </span>
                  </div>

                  {/* Middle row: content summary */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">Challenge:</span>
                      <p className="text-sm font-black text-brand-850 leading-snug">
                        {mistake.question}
                      </p>
                    </div>
                    <button 
                      className={`p-1.5 rounded-lg border border-brand-200 text-brand-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-accent-indigo border-accent-indigo bg-indigo-50/40' : ''
                      }`}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Expanded block values */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-brand-50/50 p-4 rounded-xl border border-brand-200/60 animate-fade-in">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Your answer:</span>
                        <p className="font-semibold text-brand-800 text-xs">
                          {mistake.userAnswer || '(No response)'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-brand-200 pt-3 sm:pt-0 sm:pl-4">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                          <Check size={10} strokeWidth={3} />
                          <span>Correct answer:</span>
                        </span>
                        <p className="font-semibold text-brand-900 text-xs">
                          {mistake.correctAnswer}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};

export default ProgressReview;
