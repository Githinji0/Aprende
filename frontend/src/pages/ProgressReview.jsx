import React, { useState, useEffect, useRef } from 'react';
import { Award, Flame, Star, AlertTriangle, ArrowLeft, PenTool, Volume2, Sparkles, TrendingUp, CheckSquare, ChevronRight, Check, Lock, Unlock, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const GRAMMAR_TOPICS = [
  {
    id: 'pronouns',
    title: 'Pronouns',
    description: 'Words like yo, tú, usted, lo, le, mío, tuyo, etc.',
    chapterRequired: 1,
    details: 'Pronouns replace nouns to avoid repetition. Subject pronouns (yo, tú, él...) are often omitted in Spanish since verb endings indicate the grammatical person.',
    example: 'Yo tengo un libro. ¿Es tuyo? (I have a book. Is it yours?)'
  },
  {
    id: 'adjectives',
    title: 'Adjectives',
    description: 'Descriptive words including masculine and feminine adjectives, comparatives, etc.',
    chapterRequired: 3,
    details: 'Adjectives must agree in gender (masculine/feminine) and number (singular/plural) with the nouns they describe. They usually follow the noun.',
    example: 'La manzana roja es dulce. (The red apple is sweet.)'
  },
  {
    id: 'verbs-present',
    title: 'Verbs: Present',
    description: 'Use and form of the present tense and some useful verbs in the present',
    chapterRequired: 5,
    details: 'Present tense is used for habitual actions, general facts, and ongoing scenarios. Spanish regular verbs end in -ar, -er, or -ir, and have specific conjugation suffixes.',
    example: 'Hablo español con mis amigos. (I speak Spanish with my friends.)'
  },
  {
    id: 'verbs-ser-estar',
    title: 'Verbs: Ser / Estar',
    description: 'When to use “ser” and when to use “estar”',
    chapterRequired: 7,
    details: 'Ser is used for permanent characteristics (identity, origin, occupation, time). Estar is used for temporary states, emotions, and locations.',
    example: 'Soy de España (origin). Estoy cansado hoy (state).'
  },
  {
    id: 'articles',
    title: 'Articles',
    description: 'Words like el, la, los, un, una, etc.',
    chapterRequired: 8,
    details: 'Definite articles (el, la, los, las) refer to specific items, while indefinite articles (un, una, unos, unas) refer to general or unspecific items.',
    example: 'El libro está en la mesa. Compré una manzana. (The book is on the table. I bought an apple.)'
  },
  {
    id: 'verbs-functional',
    title: 'Verbs: Functional',
    description: 'Use tenses to do things like make polite requests, form hypotheses, etc.',
    chapterRequired: 9,
    details: 'Functional verb patterns cover structural requests, suggestions, hypothetical inquiries, or expressing simple future probability states.',
    example: '¿Podría traerme un café, por favor? (Could you bring me a coffee, please?)'
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    description: 'Words like por, para, en, dentro, entre, etc.',
    chapterRequired: 10,
    details: 'Prepositions connect words to define spatial, directional, or logical links. Por and Para represent the most important contrasts to learn.',
    example: 'Este regalo es para ti. Viajo por avión. (This gift is for you. I travel by plane.)'
  },
  {
    id: 'numbers',
    title: 'Numbers and ways of counting',
    description: 'Numbers to count or order, countable and uncountable nouns and ways of counting',
    chapterRequired: 11,
    details: 'Cardinal numbers are used for counts, and ordinal numbers (primero, segundo...) for order sequences. Also covers quantity expressions like mucho, poco, bastante.',
    example: 'Tengo tres gatos y mucha comida. (I have three cats and a lot of food.)'
  },
  {
    id: 'adverbs',
    title: 'Adverbs',
    description: 'Words we use to indicate how often we do something',
    chapterRequired: 12,
    details: 'Adverbs describe how, when, or where an action occurs. Frequency adverbs like siempre (always), a veces (sometimes), or nunca (never) describe daily routines.',
    example: 'Siempre estudio español por la mañana. (I always study Spanish in the morning.)'
  },
  {
    id: 'discourse',
    title: 'Discourse, sentence and phrase types',
    description: 'Word order, phrases, and other multi-word ways of forming meaning.',
    chapterRequired: 13,
    details: 'Covers logical clause formatting, relative word placements in question clauses, and common multi-word dialogue starters.',
    example: '¿A qué hora empieza la clase? (What time does the class start?)'
  },
  {
    id: 'verbs-past',
    title: 'Verbs: Past',
    description: 'Use and form of the “pretéritos” and perfect tenses, some useful verbs in the past',
    chapterRequired: 15,
    details: 'Preterite tense describes singular completed actions in the past. Imperfect tense describes ongoing past background descriptions, habits, or age.',
    example: 'Ayer comí paella. De niño, jugaba al fútbol. (Yesterday I ate paella. As a child, I played football.)'
  },
  {
    id: 'verbs-future',
    title: 'Verbs: Future',
    description: 'Use and form of "futuro", and tenses we use to talk about the future',
    chapterRequired: 16,
    details: 'Discuss upcoming plans, intentions, and predictions using either the simple future tense or the near-future phrase (ir + a + infinitive).',
    example: 'Mañana voy a estudiar más. Viajaré a Madrid el próximo año. (Tomorrow I am going to study more. I will travel to Madrid next year.)'
  },
  {
    id: 'verbs-imperative',
    title: 'Verbs: Imperative',
    description: 'Use of the “imperativo” to give orders, instructions and advice',
    chapterRequired: 17,
    details: 'The imperative mood is used to communicate direct commands, requests, and warnings. Positive and negative commands follow different spelling paths.',
    example: '¡Escucha con atención! No comas eso. (Listen carefully! Do not eat that.)'
  },
  {
    id: 'connectors',
    title: 'Connectors',
    description: 'Linking words such as "y, o, aunque, porque, ya que…"',
    chapterRequired: 18,
    details: 'Conjunctions join words, clauses, or sentences together to form cohesive thoughts, comparisons, or cause-and-effect clauses.',
    example: 'Estudio mucho porque quiero hablar con fluidez. (I study a lot because I want to speak fluently.)'
  },
  {
    id: 'verbs-conditional',
    title: 'Verbs: Conditional',
    description: 'Use the conditional tense in different types of sentences',
    chapterRequired: 19,
    details: 'The conditional tense (hablaría, comería...) describes hypothetical possibilities, conditional outcomes, or polite request variations.',
    example: 'Me gustaría visitar Barcelona algún día. (I would like to visit Barcelona someday.)'
  },
  {
    id: 'verbs-subjuntivo',
    title: 'Verbs: Subjuntivo',
    description: 'Use and form of the verb mood we use to express different emotions and things we are not sure about',
    chapterRequired: 20,
    details: 'The subjunctive mood expresses subjective states such as desires, emotions, doubts, possibilities, or recommendations.',
    example: 'Espero que tengas un buen viaje. (I hope you have a good trip.)'
  },
  {
    id: 'verbs-passive',
    title: 'Verbs: Passive',
    description: 'Form and use passive sentences',
    chapterRequired: 21,
    details: 'Passive voice structure highlights the action recipient rather than the actor. Frequently formatted using passive "se" constructions.',
    example: 'Se habla español aquí. La comida fue preparada por el chef. (Spanish is spoken here. The food was prepared by the chef.)'
  },
  {
    id: 'referencing',
    title: 'Referencing',
    description: 'Practise the use of "que", "cual" and "quien"',
    chapterRequired: 22,
    details: 'Relative pronouns (que, quien, el cual...) reference back to nouns to connect clauses seamlessly.',
    example: 'La persona que te llamó es mi madre. El hombre de quien hablas es simpático. (The person who called you is my mother. The man you speak of is nice.)'
  },
  {
    id: 'verb-patterns',
    title: 'Verb patterns',
    description: 'Patterns of use that certain verbs follow',
    chapterRequired: 22,
    details: 'Prepositional verb couplings dictate how specific actions bind to prepositional suffixes (e.g. tratar de, soñar con, insistir en).',
    example: 'Trato de estudiar todos los días. Sueño con viajar. (I try to study every day. I dream of traveling.)'
  }
];

const ProgressReview = ({ user, token, onBackToDashboard, searchQuery, currentCourse }) => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Animation states
  const [animateCharts, setAnimateCharts] = useState(false);
  
  // Tooltip & flashcard interactive states
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [expandedMistakes, setExpandedMistakes] = useState({});
  const [activeSubTab, setActiveSubTab] = useState('vocabulary'); // 'vocabulary' | 'grammar'
  const [expandedGrammar, setExpandedGrammar] = useState({});

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

  // --- COURSE FILTERING LOGIC ---
  const activeDifficultyTab = currentCourse === 'dummies' ? 'Intermediate' : 'Beginner';

  const getFilteredLessons = () => {
    let list = lessons.filter(l => l.difficulty === activeDifficultyTab);
    if (currentCourse === 'test_skills') {
      list = list.filter(l => l.lessonType === 'checkpoint');
    } else if (currentCourse === 'beginner') {
      list = list.filter(l => l.lessonType !== 'checkpoint');
    }
    return list;
  };

  const filteredLessons = getFilteredLessons();
  const filteredLessonIds = new Set(filteredLessons.map(l => l._id));
  const filteredProgress = progress.filter(p => filteredLessonIds.has(p.lesson));

  // --- ANALYTICS CALCULATIONS ---

  // 1. Average accuracy across completed lessons
  const getAverageAccuracy = () => {
    const completedRecords = filteredProgress.filter(p => p.completed && p.score !== undefined);
    if (completedRecords.length === 0) return 0;
    const sum = completedRecords.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / completedRecords.length);
  };

  // 2. Completed count
  const completedLessonsCount = filteredProgress.filter(p => p.completed).length;
  const totalLessonsCount = filteredLessons.length || 1;
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
      const count = filteredProgress.filter(p => {
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
    const sortedProgress = filteredProgress
      .filter(p => p.completed && p.score !== undefined && p.updatedAt)
      .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
      .slice(-10);
    
    return sortedProgress.map((p, idx) => {
      const lessonTitle = filteredLessons.find(l => l._id === p.lesson)?.title || 'Lesson';
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
    filteredProgress.forEach((prog) => {
      if (prog.mistakes && prog.mistakes.length > 0) {
        prog.mistakes.forEach((m) => {
          const lessonTitle = filteredLessons.find(l => l._id === prog.lesson)?.title || 'Lesson';
          
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

  const completedChapters = new Set(
    filteredProgress
      .filter(p => p.completed)
      .map(p => {
        const lesson = filteredLessons.find(l => l._id === p.lesson);
        return lesson ? lesson.chapterNumber : null;
      })
      .filter(Boolean)
  );

  const highestCompletedChapter = completedChapters.size > 0 ? Math.max(...completedChapters) : 0;

  const isAllExpanded = () => {
    const unlockedCategories = GRAMMAR_TOPICS.filter(category => {
      return completedChapters.has(category.chapterRequired) || highestCompletedChapter >= category.chapterRequired;
    });
    if (unlockedCategories.length === 0) return false;
    return unlockedCategories.every(category => !!expandedGrammar[category.id]);
  };

  const handleExpandAllToggle = () => {
    if (isAllExpanded()) {
      setExpandedGrammar({});
    } else {
      const newExpanded = {};
      GRAMMAR_TOPICS.forEach(category => {
        const isUnlocked = completedChapters.has(category.chapterRequired) || highestCompletedChapter >= category.chapterRequired;
        if (isUnlocked) {
          newExpanded[category.id] = true;
        }
      });
      setExpandedGrammar(newExpanded);
    }
  };

  const toggleMistake = (idx) => {
    setExpandedMistakes(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="w-full min-h-screen bg-espana-sand p-4 sm:p-6 md:p-8 font-sans text-espana-charcoal animate-fade-in">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-espana-red/10 pb-4">
          <div className="flex flex-col gap-1">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-xs font-extrabold text-espana-red hover:opacity-85 transition-opacity uppercase tracking-wider focus:outline-none"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl font-black text-espana-charcoal tracking-tight mt-1">Your Learning Progress</h1>
          </div>
        </div>

        {/* Row 1: KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Streak KPI */}
          <div className="glass-card p-5 rounded-3xl flex items-center gap-4 bg-white/70 shadow-md border border-white/40">
            <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
              <Flame size={26} className="fill-orange-500 animate-pulse text-orange-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-espana-charcoal leading-tight">{user.streak} days</span>
              <span className="text-[11px] text-espana-charcoal/50 font-extrabold uppercase tracking-widest mt-0.5">Current Streak</span>
            </div>
          </div>

          {/* XP KPI */}
          <div className="glass-card p-5 rounded-3xl flex items-center gap-4 bg-white/70 shadow-md border border-white/40">
            <div className="w-12 h-12 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
              <Star size={26} className="fill-yellow-400 text-yellow-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-espana-charcoal leading-tight">{user.xp} XP</span>
              <span className="text-[11px] text-espana-charcoal/50 font-extrabold uppercase tracking-widest mt-0.5">XP Earned</span>
            </div>
          </div>

          {/* Accuracy KPI */}
          <div className="glass-card p-5 rounded-3xl flex items-center gap-4 bg-white/70 shadow-md border border-white/40">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <TrendingUp size={26} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-espana-charcoal leading-tight">{averageAccuracy}%</span>
              <span className="text-[11px] text-espana-charcoal/50 font-extrabold uppercase tracking-widest mt-0.5">Average Accuracy</span>
            </div>
          </div>

        </div>

        {/* Row 2: Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Graph 1: Performance Line Graph */}
          <div className="glass-card p-6 rounded-[2rem] border border-white/40 shadow-md flex flex-col gap-4 bg-white/70 relative">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-espana-red uppercase tracking-wider">Recent History</span>
                <h3 className="text-base font-black text-espana-charcoal">Accuracy Trend</h3>
              </div>
              {trendData.length === 0 && (
                <span className="text-[10px] font-black text-espana-charcoal/60 bg-espana-sand px-2.5 py-0.5 rounded-full uppercase">Demo</span>
              )}
            </div>

            <div className="relative flex-1 min-h-[180px] bg-espana-sand/40 rounded-2xl border border-espana-red/10 p-2 flex items-center justify-center overflow-hidden">
              {/* Interactive Score Tooltip */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-espana-charcoal text-white text-[10px] font-black p-2 rounded-xl shadow-lg pointer-events-none z-20 flex flex-col gap-0.5 animate-fade-in border border-espana-red/25"
                  style={{ 
                    left: `${(hoveredPoint.x / graphWidth) * 90}%`, 
                    top: `${(hoveredPoint.y / graphHeight) * 75 - 15}%` 
                  }}
                >
                  <span className="text-espana-gold">Accuracy: {hoveredPoint.score}%</span>
                  <span className="text-white/70 leading-none truncate max-w-[120px]">{hoveredPoint.lessonTitle}</span>
                </div>
              )}

              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                {/* Grid Horizontal Guidelines */}
                <line x1={padX} y1={padY} x2={graphWidth - padX} y2={padY} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={padX} y1={(graphHeight - padY) / 2 + padY / 2} x2={graphWidth - padX} y2={(graphHeight - padY) / 2 + padY / 2} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={padX} y1={graphHeight - padY} x2={graphWidth - padX} y2={graphHeight - padY} stroke="#cbd5e1" strokeWidth="1" />
                
                {/* Y Axis Labels */}
                <text x={padX - 8} y={padY + 4} textAnchor="end" className="text-[10px] font-extrabold fill-espana-charcoal/40">100%</text>
                <text x={padX - 8} y={(graphHeight - padY) / 2 + padY / 2 + 4} textAnchor="end" className="text-[10px] font-extrabold fill-espana-charcoal/40">50%</text>
                <text x={padX - 8} y={graphHeight - padY + 4} textAnchor="end" className="text-[10px] font-extrabold fill-espana-charcoal/40">0%</text>

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
                    className="cursor-pointer transition-all duration-200 hover:scale-150 hover:fill-espana-red"
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
              <span className="text-[10px] font-black text-espana-red uppercase tracking-wider">Activity</span>
              <h3 className="text-base font-black text-espana-charcoal">Completed Lessons (Last 7 Days)</h3>
            </div>

            <div className="flex-1 bg-espana-sand/40 rounded-2xl border border-espana-red/10 p-4 flex items-end justify-between gap-2 h-44">
              {activityData.map((day) => {
                const barHeightPercent = (day.count / maxActivityCount) * 80 + 10; // min 10% for layout visibility
                return (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    
                    {/* Top indicator count label */}
                    {day.count > 0 ? (
                      <span className="text-[10px] font-black text-espana-charcoal bg-espana-gold border border-amber-300 px-1.5 py-0.5 rounded-md leading-none">
                        {day.count}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-espana-charcoal/30 leading-none">0</span>
                    )}

                    {/* Vertical solid bar */}
                    <div className="w-full max-w-[28px] h-full flex items-end">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-700 ease-out origin-bottom ${
                          day.count > 0 
                            ? 'bg-espana-red shadow-md shadow-red-100/30' 
                            : 'bg-espana-sand'
                        }`}
                        style={{ 
                          height: animateCharts ? `${barHeightPercent}%` : '10%'
                        }}
                      ></div>
                    </div>

                    {/* Label days */}
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-[10px] font-black text-espana-charcoal">{day.label}</span>
                      <span className="text-[8px] font-bold text-espana-charcoal/40 mt-1 whitespace-nowrap">{day.date}</span>
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
              <span className="text-[10px] font-black text-espana-red uppercase tracking-wider">Curriculum</span>
              <h3 className="text-base font-black text-espana-charcoal mt-0.5">Course Progress</h3>
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
                <span className="text-xl font-black text-espana-charcoal">{courseCompletionPercent}%</span>
                <span className="text-[9px] font-extrabold text-espana-charcoal/40 uppercase tracking-widest mt-1">Done</span>
              </div>
            </div>

            <p className="text-xs text-espana-charcoal/60 font-semibold leading-tight px-4">
              You have completed <strong>{completedLessonsCount}</strong> of <strong>{totalLessonsCount}</strong> total curriculum lessons.
            </p>
          </div>

          {/* Errors Breakdown list */}
          <div className="md:col-span-2 glass-card p-6 rounded-[2rem] border border-white/40 shadow-md bg-white/70 flex flex-col justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-espana-red uppercase tracking-wider">Challenge Categories</span>
              <h3 className="text-base font-black text-espana-charcoal mt-0.5">Mistake Breakdown</h3>
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
                      <div className="w-full h-3.5 rounded-full overflow-hidden bg-espana-sand flex border border-espana-red/10">
                        {spellingCount > 0 && (
                          <div 
                            className="h-full bg-espana-red transition-all duration-700 ease-out" 
                            style={{ width: `${spellPercent}%` }}
                            title={`Ortografía: ${spellingCount}`}
                          ></div>
                        )}
                        {pronunCount > 0 && (
                          <div 
                            className="h-full bg-espana-gold transition-all duration-700 ease-out" 
                            style={{ width: `${pronunPercent}%` }}
                            title={`Pronunciación: ${pronunCount}`}
                          ></div>
                        )}
                      </div>
                    </div>

                    {/* KPI categories labels */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Spelling category */}
                      <div className="flex items-start gap-2.5 bg-espana-sand border border-espana-red/10 p-3.5 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-espana-red">
                          <PenTool size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-espana-charcoal/45 uppercase tracking-widest leading-none">Spelling</span>
                          <span className="text-base font-black text-espana-charcoal mt-1">{spellingCount} mistakes</span>
                          <span className="text-[9px] text-espana-charcoal/50 font-bold mt-0.5">{spellPercent}% of total</span>
                        </div>
                      </div>

                      {/* Pronunciation category */}
                      <div className="flex items-start gap-2.5 bg-espana-sand border border-espana-red/10 p-3.5 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-espana-gold/10 border border-espana-gold/30 flex items-center justify-center shrink-0 text-espana-charcoal">
                          <Volume2 size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-espana-charcoal/45 uppercase tracking-widest leading-none">Pronunciation</span>
                          <span className="text-base font-black text-espana-charcoal mt-1">{pronunCount} mistakes</span>
                          <span className="text-[9px] text-espana-charcoal/50 font-bold mt-0.5">{pronunPercent}% of total</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Row 4: Review Center container */}
        <div className="glass-card p-6 md:p-8 rounded-[2.2rem] border border-white/40 shadow-xl bg-white/70 flex flex-col gap-6">
          
          {/* Sub Tab Switcher */}
          <div className="flex border-b border-espana-red/10 pb-2">
            <button
              onClick={() => setActiveSubTab('vocabulary')}
              className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all border-b-4 outline-none ${
                activeSubTab === 'vocabulary'
                  ? 'border-espana-red text-espana-red'
                  : 'border-transparent text-espana-charcoal/50 hover:text-espana-charcoal'
              }`}
            >
              Vocabulary
            </button>
            <button
              onClick={() => setActiveSubTab('grammar')}
              className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all border-b-4 outline-none ${
                activeSubTab === 'grammar'
                  ? 'border-espana-red text-espana-red'
                  : 'border-transparent text-espana-charcoal/50 hover:text-espana-charcoal'
              }`}
            >
              Grammar
            </button>
          </div>

          {activeSubTab === 'vocabulary' ? (
            <>
              <div className="flex flex-col gap-1.5 border-b border-espana-red/10 pb-4">
                <h2 className="text-xl font-black text-espana-charcoal flex items-center gap-2">
                  <AlertTriangle className="text-espana-red" />
                  <span>Review Challenges ({mistakes.length})</span>
                </h2>
                <p className="text-xs text-espana-charcoal/70">
                  Review your incorrect answers to reinforce your vocabulary and phonetics. Click on challenges to see corrections!
                </p>
              </div>

              {/* Collapsible search-filtered list of mistakes */}
              <div className="flex flex-col gap-3 mt-1">
                {mistakes.length === 0 ? (
                  <div className="text-center py-16 bg-espana-sand/40 rounded-3xl border border-dashed border-espana-red/20">
                    <div className="text-espana-red flex justify-center mb-3">
                      <Sparkles size={40} className="animate-pulse" />
                    </div>
                    <p className="text-base font-bold text-espana-charcoal mt-3">All caught up!</p>
                    <p className="text-xs text-espana-charcoal/70 mt-1">You have no recorded mistakes matching your search query.</p>
                  </div>
                ) : (
                  mistakes.map((mistake, idx) => {
                    const isExpanded = !!expandedMistakes[idx];
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleMistake(idx)}
                        className="bg-white hover:bg-espana-sand/40 border border-espana-red/10 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
                      >
                        {/* Top row: meta */}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-espana-charcoal/50 uppercase tracking-widest flex items-center gap-1.5">
                            {mistake.type === 'spelling' ? (
                              <>
                                <PenTool size={12} className="text-espana-red" />
                                <span>Spelling</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={12} className="text-espana-gold" />
                                <span>Pronunciation</span>
                              </>
                            )}
                          </span>
                          <span className="text-[9px] text-espana-charcoal/80 font-extrabold bg-espana-sand px-3 py-1 rounded-full uppercase tracking-wider">
                            {mistake.lessonTitle}
                          </span>
                        </div>

                        {/* Middle row: content summary */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-extrabold text-espana-charcoal/40 uppercase tracking-wider">Challenge:</span>
                            <p className="text-sm font-black text-espana-charcoal leading-snug">
                              {mistake.question}
                            </p>
                          </div>
                          <button 
                            className={`p-1.5 rounded-lg border border-espana-red/10 text-espana-charcoal/60 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90 text-espana-red border-espana-red/20 bg-red-50/40' : ''
                            }`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* Expanded block values */}
                        {isExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-espana-sand/40 p-4 rounded-xl border border-espana-red/10 animate-fade-in">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Your answer:</span>
                              <p className="font-semibold text-espana-charcoal/80 text-xs">
                                {mistake.userAnswer || '(No response)'}
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-espana-red/10 pt-3 sm:pt-0 sm:pl-4">
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                <Check size={10} strokeWidth={3} />
                                <span>Correct answer:</span>
                              </span>
                              <p className="font-semibold text-espana-charcoal text-xs">
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
            </>
          ) : (
            /* Grammar review subtab content */
            <div className="flex flex-col gap-6 animate-fade-in">
              {completedLessonsCount === 0 ? (
                /* Case 1: No grammar to review yet fallback */
                <div className="text-center py-16 bg-espana-sand rounded-3xl border border-dashed border-espana-red/35">
                  <div className="text-espana-red flex justify-center mb-3">
                    <BookOpen size={40} className="animate-pulse" />
                  </div>
                  <p className="text-base font-bold text-espana-charcoal mt-3">No grammar to review yet</p>
                  <p className="text-xs text-espana-charcoal/70 mt-1">Grammar topics are unlocked as you learn.</p>
                </div>
              ) : null}

              {/* Case 2: Explanation header ("How does Grammar Review work?") */}
              <div className="bg-espana-sand border border-espana-red/15 rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-black text-espana-charcoal">How does Grammar Review work?</h3>
                  <p className="text-xs text-espana-charcoal/70 leading-relaxed max-w-xl">
                    Grammar topics unlock automatically as you advance through chapter milestones in the course timeline. 
                    Expand any unlocked topic to review grammatical guidelines, sentence structures, and interactive examples!
                  </p>
                </div>
                <button
                  onClick={onBackToDashboard}
                  className="w-full sm:w-auto px-5 py-3 bg-espana-red hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-red-100 transition-all active:scale-[0.98] shrink-0 focus:outline-none"
                >
                  <ChevronRight size={14} />
                  <span>Go to next lesson</span>
                </button>
              </div>

              {/* Categories & Actions Header */}
              <div className="flex items-center justify-between border-b border-espana-red/10 pb-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-espana-charcoal bg-espana-gold/20 text-espana-charcoal border border-espana-gold/40 px-3 py-1 rounded-full">
                    Categories: 19
                  </span>
                  <span className="text-xs font-bold text-espana-charcoal/65 hidden sm:inline">
                    All categories
                  </span>
                </div>
                <button
                  onClick={handleExpandAllToggle}
                  className="text-xs font-black text-espana-red hover:text-red-700 focus:outline-none flex items-center gap-1 bg-espana-sand hover:bg-espana-red/5 px-3 py-1.5 rounded-xl border border-espana-red/10 transition-colors"
                >
                  {isAllExpanded() ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Collapse all</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>Expand all</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid layout of 19 Categories */}
              <div className="flex flex-col gap-3.5">
                {GRAMMAR_TOPICS.map((category) => {
                  const isUnlocked = completedChapters.has(category.chapterRequired) || highestCompletedChapter >= category.chapterRequired;
                  const isExpanded = !!expandedGrammar[category.id];

                  return (
                    <div
                      key={category.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setExpandedGrammar(prev => ({
                            ...prev,
                            [category.id]: !prev[category.id]
                          }));
                        }
                      }}
                      className={`border rounded-2.5xl transition-all duration-200 ${
                        isUnlocked
                          ? 'bg-white border-espana-red/10 hover:border-espana-red/35 cursor-pointer shadow-sm hover:shadow-md'
                          : 'bg-espana-sand/40 border-espana-red/5 opacity-60 cursor-not-allowed select-none'
                      }`}
                    >
                      {/* Header Row */}
                      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Icon block */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isUnlocked
                              ? 'bg-red-50 border-red-100 text-espana-red'
                              : 'bg-espana-sand border-espana-red/5 text-espana-charcoal/40'
                          }`}>
                            {isUnlocked ? <BookOpen size={18} /> : <Lock size={18} />}
                          </div>
                          
                          {/* Title & short description */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-espana-charcoal truncate">
                                {category.title}
                              </h4>
                              {!isUnlocked && (
                                <span className="text-[8px] font-black text-espana-charcoal/50 bg-espana-sand px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                                  Chap {category.chapterRequired}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-espana-charcoal/60 truncate mt-0.5 max-w-[280px] sm:max-w-[500px]">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        {/* Expand chevron indicator */}
                        {isUnlocked && (
                          <button
                            className={`p-1.5 rounded-lg border border-espana-red/10 text-espana-charcoal/60 transition-transform duration-200 shrink-0 ${
                              isExpanded ? 'rotate-90 text-espana-red border-espana-red/20 bg-red-50/40' : ''
                            }`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      {/* Expandable description body */}
                      {isUnlocked && isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-espana-red/5 flex flex-col gap-4 animate-fade-in">
                          {/* Explanatory guidelines detail */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-espana-red uppercase tracking-wider">Grammar Rules:</span>
                            <p className="text-xs text-espana-charcoal/85 leading-relaxed bg-espana-sand/40 p-3 rounded-xl border border-espana-red/5">
                              {category.details}
                            </p>
                          </div>

                          {/* Spanish translation usage examples */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                              <Check size={10} strokeWidth={3} />
                              <span>Example in Context:</span>
                            </span>
                            <p className="text-xs font-black text-espana-charcoal bg-emerald-50/20 p-3 rounded-xl border border-emerald-100 italic">
                              {category.example}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProgressReview;
