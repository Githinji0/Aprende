import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle2, Flame, Award, AlertTriangle, ChevronDown, ChevronUp, Mic, Trophy, Shield, BookOpen, Languages } from 'lucide-react';
import { PixelCTAButton } from '../components/PixelCTAButton';

const getChapterIcon = (chapter) => {
  const hasCheckpoint = chapter.lessons.some(l => l.lessonType === 'checkpoint');
  if (hasCheckpoint) return Trophy;
  const hasSpeaking = chapter.lessons.some(l => l.lessonType === 'speaking');
  if (hasSpeaking) return Mic;
  
  // Cycle through icons
  const icons = [BookOpen, Shield, Flame, Play];
  return icons[chapter.number % icons.length];
};

const getChapterCardStyle = (chapter, isCompleted, isUnlocked) => {
  if (!isUnlocked) {
    return {
      bg: 'bg-brand-100/70 border border-brand-200/50 text-brand-400',
      pointerOdd: 'border-l-brand-200',
      pointerEven: 'border-r-brand-200',
      badgeBg: 'bg-brand-200',
      iconColor: 'text-brand-300',
      progressBarBg: 'bg-brand-300/30',
      progressBarFill: 'bg-brand-300',
      lessonItem: (isLCompleted, isLUnlocked) => ''
    };
  }
  if (isCompleted) {
    return {
      bg: 'bg-emerald-600 text-white shadow-lg border border-emerald-600',
      pointerOdd: 'border-l-emerald-600',
      pointerEven: 'border-r-emerald-600',
      badgeBg: 'bg-white border border-emerald-600',
      iconColor: 'text-emerald-600',
      progressBarBg: 'bg-white/20',
      progressBarFill: 'bg-white',
      lessonItem: (isLCompleted, isLUnlocked) => {
        if (isLCompleted) return 'bg-white/10 border-white/15 text-white hover:bg-white/20';
        if (isLUnlocked) return 'bg-white text-brand-900 border-white hover:shadow-md';
        return 'bg-white/5 border-white/5 text-white/40';
      }
    };
  }
  // Unlocked & In Progress (Active / Current Chapter)
  // White background, yellow/gold (accent-violet) border!
  return {
    bg: 'bg-white text-brand-900 shadow-xl border-[3px] border-accent-violet animate-snakelight',
    pointerOdd: 'border-l-accent-violet',
    pointerEven: 'border-r-accent-violet',
    badgeBg: 'bg-white border border-accent-violet',
    iconColor: 'text-accent-violet',
    progressBarBg: 'bg-brand-100',
    progressBarFill: 'bg-accent-indigo', // Red progress bar
    lessonItem: (isLCompleted, isLUnlocked) => {
      if (isLCompleted) return 'bg-emerald-50 border-emerald-100 text-brand-850 hover:bg-emerald-50/50';
      if (isLUnlocked) return 'bg-brand-50 border-brand-200 hover:border-accent-indigo text-brand-900 shadow-sm';
      return 'bg-brand-100/30 border-brand-200/30 text-brand-400 opacity-60';
    }
  };
};

const Dashboard = ({ user, onStartLesson, token, searchQuery }) => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedChapters, setExpandedChapters] = useState({});

  const getWeeklyCalendar = () => {
    const day = new Date().getDay();
    const dayIndex = day === 0 ? 6 : day - 1; // Map Sun to index 6
    
    const days = [
      { name: 'Mon', label: 'L' },
      { name: 'Tue', label: 'M' },
      { name: 'Wed', label: 'X' },
      { name: 'Thu', label: 'J' },
      { name: 'Fri', label: 'V' },
      { name: 'Sat', label: 'S' },
      { name: 'Sun', label: 'D' }
    ];

    return days.map((d, index) => {
      let checked = false;
      if (index <= dayIndex && index > dayIndex - user.streak) {
        checked = true;
      }
      return { ...d, checked };
    });
  };

  const getActiveLesson = () => {
    if (sortedLessons.length === 0) return null;
    for (let i = 0; i < sortedLessons.length; i++) {
      const lesson = sortedLessons[i];
      const record = progress.find(p => p.lesson === lesson._id);
      const isCompleted = record ? record.completed : false;
      if (!isCompleted) {
        const chapterLessons = sortedLessons.filter(l => l.chapterNumber === lesson.chapterNumber);
        const chapterCompletedCount = chapterLessons.filter(l => {
          const r = progress.find(p => p.lesson === l._id);
          return r ? r.completed : false;
        }).length;
        const percent = Math.round((chapterCompletedCount / chapterLessons.length) * 100);

        return {
          lesson,
          chapterProgress: percent,
          chapterTitle: lesson.chapterTitle || `Chapter ${lesson.chapterNumber}`
        };
      }
    }
    return {
      lesson: sortedLessons[sortedLessons.length - 1],
      chapterProgress: 100,
      chapterTitle: sortedLessons[sortedLessons.length - 1].chapterTitle || 'Course Completed'
    };
  };

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


  // Sort lessons globally by chapter and order to establish progressive flow
  const sortedLessons = [...lessons].sort((a, b) => {
    if (a.chapterNumber !== b.chapterNumber) {
      return a.chapterNumber - b.chapterNumber;
    }
    return a.lessonOrder - b.lessonOrder;
  });

  // Helper to determine status of a lesson in the global flow
  const getLessonStatus = (lesson, index) => {
    const record = progress.find(p => p.lesson === lesson._id);
    const isCompleted = record ? record.completed : false;

    if (index === 0) {
      return { isCompleted, isUnlocked: true, score: record?.score || 0 };
    }

    const prevLesson = sortedLessons[index - 1];
    const prevRecord = progress.find(p => p.lesson === prevLesson._id);
    const prevCompleted = prevRecord ? prevRecord.completed : false;

    return {
      isCompleted,
      isUnlocked: prevCompleted,
      score: record?.score || 0
    };
  };

  // Group lessons by chapter and apply dynamic query filtering
  const getGroupedChapters = () => {
    const chaptersMap = {};
    sortedLessons.forEach((lesson, globalIndex) => {
      const chNum = lesson.chapterNumber || 1;

      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLesson = lesson.title.toLowerCase().includes(query) || 
                              (lesson.description && lesson.description.toLowerCase().includes(query)) ||
                              (lesson.chapterTitle && lesson.chapterTitle.toLowerCase().includes(query)) ||
                              (lesson.vocabulary && lesson.vocabulary.some(v => v.spanish.toLowerCase().includes(query) || v.english.toLowerCase().includes(query)));
        
        if (!matchesLesson) return;
      }

      if (!chaptersMap[chNum]) {
        chaptersMap[chNum] = {
          number: chNum,
          title: lesson.chapterTitle || 'Chapter',
          difficulty: lesson.difficulty || 'Beginner',
          lessons: []
        };
      }
      chaptersMap[chNum].lessons.push({
        ...lesson,
        globalIndex
      });
    });
    return Object.values(chaptersMap).sort((a, b) => a.number - b.number);
  };

  const groupedChapters = getGroupedChapters();

  // Set default expanded chapter: the first incomplete chapter
  useEffect(() => {
    if (sortedLessons.length > 0 && Object.keys(expandedChapters).length === 0) {
      let firstIncompleteChapter = 1;
      for (let i = 0; i < sortedLessons.length; i++) {
        const lesson = sortedLessons[i];
        const record = progress.find(p => p.lesson === lesson._id);
        const isCompleted = record ? record.completed : false;
        if (!isCompleted) {
          firstIncompleteChapter = lesson.chapterNumber || 1;
          break;
        }
      }
      setExpandedChapters({ [firstIncompleteChapter]: true });
    }
  }, [lessons, progress]);

  const toggleChapter = (chapterNum) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Title Skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-brand-200 rounded-xl"></div>
            <div className="h-4 w-96 bg-brand-200 rounded-lg"></div>
          </div>
          
          {/* Chapter Skeletons */}
          <div className="flex flex-col gap-5 py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-brand-200 rounded-3xl p-5 flex flex-col gap-4 bg-white/60">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 bg-brand-200 rounded-full"></div>
                      <div className="h-4 w-20 bg-brand-200 rounded"></div>
                    </div>
                    <div className="h-6 w-56 bg-brand-200 rounded-lg"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="h-4 w-20 bg-brand-200 rounded"></div>
                      <div className="h-2 w-24 sm:w-32 bg-brand-200 rounded-full"></div>
                    </div>
                    <div className="h-9 w-9 bg-brand-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex flex-col gap-6">
          {/* Stats Skeleton */}
          <div className="border border-brand-200 rounded-3xl p-6 flex flex-col gap-4 bg-white/60">
            <div className="h-6 w-40 bg-brand-200 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-brand-100/60 border border-brand-200 rounded-2xl"></div>
              <div className="h-24 bg-brand-100/60 border border-brand-200 rounded-2xl"></div>
            </div>
            <div className="h-4 w-full bg-brand-200 rounded"></div>
          </div>

          {/* Review Center Skeleton */}
          <div className="border border-brand-200 rounded-3xl p-6 flex flex-col gap-4 bg-white/60">
            <div className="h-6 w-36 bg-brand-200 rounded-lg"></div>
            <div className="h-4 w-full bg-brand-200 rounded"></div>
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-brand-100/50 border border-brand-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
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

  const activeData = getActiveLesson();
  const weeklyDays = getWeeklyCalendar();

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-8 animate-fade-in">
      
      {/* 1. WELCOME BANNER & STREAK OVERVIEW */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/40 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 bg-white/70 overflow-hidden relative">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black text-espana-charcoal tracking-tight">
            Hello, {user.username}! <span className="animate-wave">👋</span>
          </h1>
          <p className="text-brand-500 text-sm font-semibold">
            Keep learning! Complete lessons to maintain your streak.
          </p>
        </div>
        <div className="w-24 h-40 md:w-28 md:h-48 shrink-0 relative flex items-center justify-center -mb-6 md:-mb-8 -mt-6 overflow-hidden select-none">
          <img 
            src="/welcome_mascot.png" 
            alt="Aprende Mascot" 
            className="w-full h-full object-contain object-bottom" 
          />
        </div>
      </div>

      {/* 2. STATS & WEEKLY GOALS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Progress Tracker Card */}
        <div className="lg:col-span-3 glass-card p-6 rounded-3xl border border-white/40 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 bg-white/70">
          {/* Streak left segment */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shadow-sm text-orange-600 shrink-0">
              <Flame size={28} className="fill-orange-500 animate-pulse text-orange-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-brand-900 leading-tight">{user.streak}-Day Streak</span>
              <span className="text-xs text-brand-500 font-semibold">Keep it up! You're doing great!</span>
            </div>
          </div>

          {/* Mon-Sun tracker checklist */}
          <div className="flex items-center gap-2.5 sm:gap-3 py-2">
            {weeklyDays.map((d) => (
              <div key={d.name} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest">{d.label}</span>
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 ${
                    d.checked 
                      ? 'text-emerald-600 bg-emerald-500/15 border border-emerald-500/35 shadow-inner backdrop-blur-sm' 
                      : 'text-brand-400 bg-white/30 border border-white/45 shadow-sm backdrop-blur-sm'
                  }`}
                  title={d.name}
                >
                  {d.checked ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Goal right progress segment */}
          <div className="flex flex-col w-full md:w-56 gap-1 shrink-0">
            <div className="flex justify-between text-xs font-black text-brand-850">
              <span>Weekly Goal: 5 days</span>
              <span>{Math.min(user.streak, 5)}/5</span>
            </div>
            <div className="w-full h-2.5 bg-brand-100 rounded-full overflow-hidden border border-brand-200">
              <div 
                className="h-full bg-accent-indigo transition-all duration-500" 
                style={{ width: `${(Math.min(user.streak, 5) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CONTINUE LEARNING SPOTLIGHT CARD */}
      {activeData && !searchQuery?.trim() && (
        <div className="glass-card rounded-[2.2rem] border border-white/40 shadow-xl overflow-hidden bg-white/70 flex flex-col md:flex-row items-stretch">
          {/* Card Left: Premium Spain flag banner */}
          <div 
            className="w-full md:w-2/5 relative min-h-[160px] md:min-h-auto p-8 flex flex-col justify-between overflow-hidden shrink-0 select-none bg-cover bg-center"
            style={{ backgroundImage: `url('/spain_flag.png?v=3')` }}
          >
            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/35 pointer-events-none"></div>

            <span className="text-[10px] font-black tracking-widest text-white/95 uppercase bg-black/45 px-3 py-1 rounded-full w-max leading-none relative z-10">
              SPANISH A1 COURSE
            </span>
            <div className="flex flex-col gap-1 mt-6 relative z-10">
              <h3 className="text-3xl font-black text-white leading-tight tracking-wide drop-shadow-md">Aprende</h3>
              <p className="text-white/95 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Vocabulary & Interactive Practice</p>
            </div>
          </div>

          {/* Card Right: Information and actions */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-accent-indigo bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Continue Learning
                </span>
                <span className="text-xs font-bold text-brand-400">
                  Lesson {activeData.lesson.chapterNumber}.{activeData.lesson.lessonOrder}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <h3 className="text-xl font-black text-brand-900 leading-tight">
                  {activeData.chapterTitle}
                </h3>
                <p className="text-sm font-bold text-brand-650">
                  {activeData.lesson.title} — <span className="text-brand-500 font-medium text-xs">{activeData.lesson.description}</span>
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="flex flex-col gap-1.5 mt-2 max-w-md">
                <div className="flex justify-between text-xs font-bold text-brand-500 uppercase tracking-wide">
                  <span>Chapter Progress</span>
                  <span>{activeData.chapterProgress}%</span>
                </div>
                <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-indigo transition-all duration-300"
                    style={{ width: `${activeData.chapterProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-brand-200/50">
              <button
                onClick={() => {
                  document.getElementById('roadmap-timeline')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 text-brand-700 hover:text-brand-900 rounded-2xl text-xs font-black flex items-center gap-1 glass-button focus:outline-none"
              >
                <span>View Curriculum</span>
                <span>↓</span>
              </button>

              <PixelCTAButton
                onClick={() => onStartLesson(activeData.lesson._id)}
                className="px-6 py-3 text-white rounded-2xl text-xs font-black glass-red-button animate-snakelight"
              >
                Continue Lesson
              </PixelCTAButton>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHAPTERS ROADMAP TIMELINE */}
      <div className="flex flex-col gap-4 mt-4" id="roadmap-timeline">
        <div className="flex items-center justify-between border-b border-brand-200 pb-3">
          <h2 className="text-xl font-black text-brand-900 flex items-center gap-2">
            <Languages size={20} className="text-accent-indigo" />
            <span>Course Path ({groupedChapters.length} Chapters)</span>
          </h2>
          {searchQuery?.trim() && (
            <span className="text-xs font-bold text-accent-indigo bg-indigo-50 px-2.5 py-1 rounded-full">
              Active search filter
            </span>
          )}
        </div>

        {groupedChapters.length === 0 ? (
          <div className="text-center py-12 bg-brand-50 rounded-2xl border border-dashed border-brand-300">
            <p className="text-sm font-bold text-brand-600">No chapters or lessons found for "{searchQuery}"</p>
            <p className="text-xs text-brand-400 mt-1">Try searching another term or clear your search bar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0 py-4 relative">
          {groupedChapters.map((chapter) => {
            const chLessons = chapter.lessons;
            const completedCount = chLessons.filter(l => {
              const record = progress.find(p => p.lesson === l._id);
              return record ? record.completed : false;
            }).length;
            const totalCount = chLessons.length;
            const completionPercent = Math.round((completedCount / totalCount) * 100);
            const isCompleted = completedCount === totalCount && totalCount > 0;

            // A chapter is unlocked if its first lesson is unlocked (or if the user completed previous chapters)
            const isChapterUnlocked = chLessons.some(l => {
              const status = getLessonStatus(l, l.globalIndex);
              return status.isUnlocked;
            });

            const isExpanded = !!expandedChapters[chapter.number];
            const isOdd = chapter.number % 2 === 1;
            const cardStyle = getChapterCardStyle(chapter, isCompleted, isChapterUnlocked);
            const ChapterIcon = getChapterIcon(chapter);

            // Responsive marker indicator styles
            const markerBg = isChapterUnlocked
              ? isCompleted
                ? 'border-emerald-600 bg-white text-emerald-600 shadow-md shadow-emerald-100/50'
                : 'border-accent-indigo bg-white text-accent-indigo shadow-md shadow-red-100/50'
              : 'border-brand-200 bg-brand-50 text-brand-300';
              
            const markerDotBg = isChapterUnlocked
              ? isCompleted
                ? 'bg-emerald-600'
                : 'bg-accent-indigo'
              : 'bg-brand-300';

            return (
              <React.Fragment key={chapter.number}>
                
                {/* --- DESKTOP VIEW (md and up) --- */}
                <div 
                  className={`hidden md:flex items-stretch justify-between w-full min-h-[160px] relative ${
                    isOdd ? 'flex-row' : 'flex-row-reverse'
                  } ${!isChapterUnlocked ? 'opacity-75' : ''}`}
                >
                  
                  {/* Column 1: Chapter Card */}
                  <div className="w-[45%] flex items-center relative z-20">
                    <button
                      disabled={!isChapterUnlocked}
                      onClick={() => toggleChapter(chapter.number)}
                      className={`w-full text-left p-6 transition-all duration-300 outline-none focus:ring-2 focus:ring-accent-indigo/35 relative flex flex-col ${
                        isExpanded ? 'rounded-[2rem]' : 'rounded-full'
                      } ${cardStyle.bg}`}
                    >
                      {/* Inner Row: Badge and Text */}
                      <div className={`flex items-center gap-4 w-full ${isOdd ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* 3D Round Badge */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.15)] ${cardStyle.badgeBg}`}>
                          <ChapterIcon size={24} className={cardStyle.iconColor} />
                        </div>

                        {/* Title, Difficulty, and Progress */}
                        <div className={`flex-1 flex flex-col ${isOdd ? 'text-left' : 'text-right'}`}>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                            {chapter.difficulty} • Chapter {chapter.number}
                          </span>
                          <h2 className="text-lg font-black leading-snug mt-0.5">
                            {chapter.title}
                          </h2>
                          
                          {/* Progress bar inside card */}
                          {isChapterUnlocked && (
                            <div className={`flex items-center gap-2 mt-1.5 ${isOdd ? 'flex-row' : 'flex-row-reverse'}`}>
                              <span className="text-[11px] font-extrabold whitespace-nowrap">
                                {completedCount}/{totalCount} Lessons
                              </span>
                              <div className={`w-20 h-1.5 rounded-full overflow-hidden ${cardStyle.progressBarBg}`}>
                                <div 
                                  className={`h-full ${cardStyle.progressBarFill}`}
                                  style={{ width: `${completionPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Triangular Pointer */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent ${
                          isOdd 
                            ? 'right-0 translate-x-[99%] border-l-8 ' + cardStyle.pointerOdd 
                            : 'left-0 -translate-x-[99%] border-r-8 ' + cardStyle.pointerEven
                        }`}
                      ></div>

                      {/* Expanded Lessons List inside the card */}
                      {isExpanded && (
                        <div className={`border-t mt-4 pt-4 flex flex-col gap-2.5 w-full ${isCompleted ? 'border-white/20' : 'border-brand-200'}`}>
                          {chLessons.map((lesson) => {
                            const { isCompleted: isLCompleted, isUnlocked: isLUnlocked } = getLessonStatus(lesson, lesson.globalIndex);
                            
                            let iconColor = 'text-brand-500 bg-brand-100';
                            let buttonStyle = 'bg-brand-200 text-brand-600 hover:bg-brand-300';
                            let lessonIcon = <Play size={14} className="ml-0.5" />;
                            
                            if (isLCompleted) {
                              iconColor = 'text-emerald-600 bg-emerald-50';
                              buttonStyle = isCompleted 
                                ? 'bg-white/20 text-white hover:bg-white/30 border border-white/10'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200';
                              lessonIcon = <CheckCircle2 size={14} />;
                            } else if (isLUnlocked) {
                              iconColor = isCompleted 
                                ? 'text-accent-indigo bg-white' 
                                : 'text-white bg-accent-indigo';
                              buttonStyle = isCompleted
                                ? 'bg-white text-brand-900 hover:bg-brand-50 border border-white'
                                : 'bg-accent-indigo text-white hover:bg-indigo-600 shadow-sm';
                              lessonIcon = <Play size={14} className="ml-0.5" />;
                            } else {
                              iconColor = 'text-brand-400 bg-brand-100/50';
                              buttonStyle = 'bg-brand-100/30 text-brand-400 cursor-not-allowed';
                              lessonIcon = <Lock size={14} />;
                            }

                            return (
                              <div 
                                key={lesson._id}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                                  cardStyle.lessonItem(isLCompleted, isLUnlocked)
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                                    {lessonIcon}
                                  </div>
                                  <div className="text-left">
                                    <span className="text-[8px] font-black uppercase opacity-75 tracking-wider">
                                      {lesson.lessonType}
                                    </span>
                                    <h4 className="text-xs font-bold leading-tight">{lesson.title}</h4>
                                    <p className="text-[10px] opacity-70 line-clamp-1 mt-0.5 max-w-[160px]">{lesson.description}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  {isLUnlocked ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStartLesson(lesson._id);
                                      }}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${buttonStyle}`}
                                    >
                                      {isLCompleted ? 'Review' : 'Start'}
                                    </button>
                                  ) : (
                                    <div className={`p-1.5 rounded-lg border ${
                                      isCompleted 
                                        ? 'bg-white/10 text-white/40 border-white/10' 
                                        : 'bg-brand-100/50 text-brand-400 border-brand-200/50'
                                    }`}>
                                      <Lock size={12} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Column 2: Timeline Segment (Centered Wavy Path) */}
                  <div className="w-[10%] relative flex justify-center z-10">
                    {/* Wavy Dotted Path segment */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d={isOdd ? "M 50,0 C 15,25 15,75 50,100" : "M 50,0 C 85,25 85,75 50,100"}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.5"
                        strokeDasharray="6,6"
                      />
                    </svg>

                    {/* Small start/end dots for boundaries */}
                    {chapter.number === 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand-300 z-10"></div>
                    )}
                    {chapter.number === groupedChapters.length && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand-300 z-10"></div>
                    )}

                    {/* Horizontal Connector to Card */}
                    {isOdd ? (
                      <div className="absolute top-1/2 left-0 w-1/4 h-[2px] border-t-2 border-dashed border-brand-200 -translate-y-1/2 pointer-events-none"></div>
                    ) : (
                      <div className="absolute top-1/2 right-0 w-1/4 h-[2px] border-t-2 border-dashed border-brand-200 -translate-y-1/2 pointer-events-none"></div>
                    )}

                    {/* Timeline Node Marker */}
                    <div 
                      className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center transition-all ${markerBg}`}
                      style={{ left: isOdd ? '25%' : '75%' }}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${markerDotBg} ${isChapterUnlocked && !isCompleted ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>

                  {/* Column 3: Step Label */}
                  <div className={`w-[45%] flex items-center ${isOdd ? 'justify-start pl-8' : 'justify-end pr-8'}`}>
                    <div className={`flex flex-col ${isOdd ? 'text-left' : 'text-right'}`}>
                      <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest leading-none">
                        Chapter
                      </span>
                      <span className={`text-4xl font-extrabold leading-none mt-1 ${isChapterUnlocked ? 'text-brand-900' : 'text-brand-300'}`}>
                        {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
                      </span>
                    </div>
                  </div>

                </div>

                {/* --- MOBILE VIEW (below md) --- */}
                <div 
                  className={`md:hidden flex gap-4 w-full relative pb-8 ${
                    !isChapterUnlocked ? 'opacity-70' : ''
                  }`}
                >
                  {/* Timeline Column */}
                  <div className="w-12 relative flex justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6,6" />
                    </svg>
                    
                    {/* Small start dot */}
                    {chapter.number === 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-300 z-10"></div>
                    )}
                    
                    {/* Timeline Node Marker */}
                    <div className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center ${markerBg}`}>
                      <div className={`w-3 h-3 rounded-full ${markerDotBg} ${isChapterUnlocked && !isCompleted ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">
                        STEP {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        chapter.difficulty === 'Beginner' ? 'bg-indigo-100 text-indigo-700' :
                        chapter.difficulty === 'Intermediate' ? 'bg-brand-100 text-brand-600' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {chapter.difficulty}
                      </span>
                    </div>

                    <button
                      disabled={!isChapterUnlocked}
                      onClick={() => toggleChapter(chapter.number)}
                      className={`w-full text-left p-5 transition-all duration-300 outline-none relative flex flex-col rounded-3xl ${cardStyle.bg}`}
                    >
                      <div className="flex items-center gap-3.5 w-full">
                        {/* 3D Round Badge */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${cardStyle.badgeBg}`}>
                          <ChapterIcon size={20} className={cardStyle.iconColor} />
                        </div>

                        {/* Title, Difficulty, and Progress */}
                        <div className="flex-1 flex flex-col">
                          <h2 className="text-base font-black leading-tight">
                            {chapter.title}
                          </h2>
                          
                          {/* Progress bar inside card */}
                          {isChapterUnlocked && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-extrabold whitespace-nowrap">
                                {completedCount}/{totalCount}
                              </span>
                              <div className={`w-20 h-1 rounded-full overflow-hidden ${cardStyle.progressBarBg}`}>
                                <div 
                                  className={`h-full ${cardStyle.progressBarFill}`}
                                  style={{ width: `${completionPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Lessons List inside the card */}
                      {isExpanded && (
                        <div className={`border-t mt-4 pt-4 flex flex-col gap-2.5 w-full ${isCompleted ? 'border-white/20' : 'border-brand-200'}`}>
                          {chLessons.map((lesson) => {
                            const { isCompleted: isLCompleted, isUnlocked: isLUnlocked } = getLessonStatus(lesson, lesson.globalIndex);
                            
                            let iconColor = 'text-brand-500 bg-brand-100';
                            let buttonStyle = 'bg-brand-200 text-brand-600 hover:bg-brand-300';
                            let lessonIcon = <Play size={12} className="ml-0.5" />;
                            
                            if (isLCompleted) {
                              iconColor = 'text-emerald-600 bg-emerald-50';
                              buttonStyle = isCompleted 
                                ? 'bg-white/20 text-white hover:bg-white/30 border border-white/10'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200';
                              lessonIcon = <CheckCircle2 size={12} />;
                            } else if (isLUnlocked) {
                              iconColor = isCompleted 
                                ? 'text-accent-indigo bg-white' 
                                : 'text-white bg-accent-indigo';
                              buttonStyle = isCompleted
                                ? 'bg-white text-brand-900 hover:bg-brand-50 border border-white'
                                : 'bg-accent-indigo text-white hover:bg-indigo-600 shadow-sm';
                              lessonIcon = <Play size={12} className="ml-0.5" />;
                            } else {
                              iconColor = 'text-brand-400 bg-brand-100/50';
                              buttonStyle = 'bg-brand-100/30 text-brand-400 cursor-not-allowed';
                              lessonIcon = <Lock size={12} />;
                            }

                            return (
                              <div 
                                key={lesson._id}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                                  cardStyle.lessonItem(isLCompleted, isLUnlocked)
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                                    {lessonIcon}
                                  </div>
                                  <div className="text-left">
                                    <span className="text-[8px] font-black uppercase opacity-75 tracking-wider">
                                      {lesson.lessonType}
                                    </span>
                                    <h4 className="text-xs font-bold leading-tight">{lesson.title}</h4>
                                  </div>
                                </div>
                                
                                <div>
                                  {isLUnlocked ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStartLesson(lesson._id);
                                      }}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${buttonStyle}`}
                                    >
                                      {isLCompleted ? 'Review' : 'Start'}
                                    </button>
                                  ) : (
                                    <div className={`p-1.5 rounded-lg border ${
                                      isCompleted 
                                        ? 'bg-white/10 text-white/40 border-white/10' 
                                        : 'bg-brand-100/50 text-brand-400 border-brand-200/50'
                                    }`}>
                                      <Lock size={10} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  </div>
                </div>

              </React.Fragment>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
