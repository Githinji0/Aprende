import React, { useState, useEffect, useRef } from 'react';
import { Heart, LayoutDashboard, MessageSquare, Award, Search, Bell, Globe, Calendar, Bookmark, LogOut, Flame, Languages, Gamepad2, ChevronDown, Sun, Moon, BookOpen } from 'lucide-react';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import LessonInterface from './pages/LessonInterface';
import RoleplayZone from './pages/RoleplayZone';
import ProgressReview from './pages/ProgressReview';
import GamesHub from './pages/GamesHub';
import CourseSelector from './pages/CourseSelector';

const ACCENT_LABELS = {
  'es-ES': '🇪🇸 España',
  'es-MX': '🇲🇽 México',
  'es-AR': '🇦🇷 Argentina'
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCourse, setCurrentCourse] = useState(localStorage.getItem('activeCourse') || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [voiceAccent, setVoiceAccent] = useState(
    localStorage.getItem('voiceAccent') || 'es-ES'
  );
  const [showAccentDropdown, setShowAccentDropdown] = useState(false);
  const accentDropdownRef = useRef(null);

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Active Streak! 🔥',
      description: "You've started your study streak. Complete a lesson daily to keep it going.",
      time: '5m ago',
      read: false
    },
    {
      id: 2,
      title: 'AI Roleplay Unlocked 💬',
      description: 'Try the new conversation at the local market with Lucas.',
      time: '2h ago',
      read: false
    },
    {
      id: 3,
      title: 'Welcome to Aprende! 🎓',
      description: 'Explore your 22-chapter learning journey.',
      time: 'Yesterday',
      read: true
    }
  ]);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (accentDropdownRef.current && !accentDropdownRef.current.contains(event.target)) {
        setShowAccentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Authenticate user on mount if token exists in localStorage
  useEffect(() => {
    const autoAuthenticate = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        
        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setToken(savedToken);
        } else {
          // Token expired or invalid, clear localStorage
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Auto authentication error:', err);
      } finally {
        setLoading(false);
      }
    };

    autoAuthenticate();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setToken(localStorage.getItem('token'));
    const savedCourse = localStorage.getItem('activeCourse');
    setCurrentCourse(savedCourse || null);
    setCurrentTab('dashboard');
  };

  const handleSelectCourse = (course) => {
    localStorage.setItem('activeCourse', course);
    setCurrentCourse(course);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeCourse');
    setUser(null);
    setToken(null);
    setCurrentCourse(null);
    setCurrentTab('dashboard');
    setActiveLessonId(null);
  };

  const handleStartLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setCurrentTab('lesson');
  };

  const handleBackToDashboard = (updatedUserStats) => {
    if (updatedUserStats) {
      // Update local user streak & XP details returned from backend Complete Lesson endpoint
      setUser(prev => ({
        ...prev,
        xp: updatedUserStats.xp,
        streak: updatedUserStats.streak,
        lastActiveDate: updatedUserStats.lastActiveDate
      }));
    }
    setActiveLessonId(null);
    setCurrentTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-50 animate-pulse">
        {/* Navbar Skeleton */}
        <header className="bg-white border-b border-brand-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="h-6 w-32 bg-brand-200 rounded-lg"></div>
            <div className="hidden sm:flex gap-4">
              <div className="h-5 w-24 bg-brand-200 rounded-md"></div>
              <div className="h-5 w-24 bg-brand-200 rounded-md"></div>
            </div>
          </div>
          <div className="h-8 w-20 bg-brand-200 rounded-xl"></div>
        </header>

        {/* Dashboard Layout Mockup Skeleton */}
        <main className="flex-1 w-full max-w-6xl mx-auto py-6">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-8 w-48 bg-brand-200 rounded-xl"></div>
                <div className="h-4 w-96 bg-brand-200 rounded-lg"></div>
              </div>
              <div className="flex flex-col gap-5 py-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border border-brand-200 rounded-3xl p-5 flex flex-col gap-4 bg-white/60">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-5 w-16 bg-brand-200 rounded-full"></div>
                        <div className="h-6 w-56 bg-brand-200 rounded-lg"></div>
                      </div>
                      <div className="h-9 w-9 bg-brand-200 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="flex flex-col gap-6">
              <div className="border border-brand-200 rounded-3xl p-6 bg-white/60 h-48"></div>
              <div className="border border-brand-200 rounded-3xl p-6 bg-white/60 h-64"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-50 font-sans">
      
      {/* 1. DESKTOP STICKY SIDEBAR (md:flex) */}
      {user && currentCourse && (
        <aside className="hidden md:flex flex-col w-64 bg-white sticky top-0 h-screen shrink-0 z-40">
          {/* Logo / Brand */}
          <div className="p-5 flex items-center gap-3">
            <img src="/logo.png" alt="Aprende Logo" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold text-espana-red">
              Aprende
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 flex flex-col gap-1.5">
            <button
              onClick={() => { setCurrentTab('dashboard'); setActiveLessonId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none ${
                currentTab === 'dashboard' || currentTab === 'lesson'
                  ? 'text-white glass-red-button shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Home</span>
            </button>

            <button
              onClick={() => { setCurrentTab('roleplay'); setActiveLessonId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none ${
                currentTab === 'roleplay'
                  ? 'text-white glass-red-button shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <MessageSquare size={18} />
              <span>AI Roleplay</span>
            </button>

            <button
              onClick={() => { setCurrentTab('progress'); setActiveLessonId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none ${
                currentTab === 'progress'
                  ? 'text-white glass-red-button shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <Award size={18} />
              <span>My Progress</span>
            </button>

            <button
              onClick={() => { setCurrentTab('games'); setActiveLessonId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none ${
                currentTab === 'games'
                  ? 'text-white glass-red-button shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <Gamepad2 size={18} />
              <span>Games & Puzzles</span>
            </button>

            <button
              onClick={() => { setCurrentCourse(null); localStorage.removeItem('activeCourse'); setActiveLessonId(null); }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 text-brand-600 hover:bg-brand-50 hover:text-brand-900 focus:outline-none"
            >
              <Languages size={18} className="text-espana-red shrink-0" />
              <span>Switch Course</span>
            </button>

            <div className="h-[1px] bg-brand-200 my-3"></div>

            {/* Aesthetic placeholders to match the reference image */}
            <div className="flex flex-col gap-1 opacity-60">
              <button disabled className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-brand-400 cursor-not-allowed">
                <span className="flex items-center gap-3">
                  <Calendar size={18} />
                  <span>Calendar</span>
                </span>
                <span className="bg-brand-100 px-2 py-0.5 rounded-full text-[9px] uppercase">Soon</span>
              </button>
              <button disabled className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-brand-400 cursor-not-allowed">
                <span className="flex items-center gap-3">
                  <Bookmark size={18} />
                  <span>Bookmarks</span>
                </span>
                <span className="bg-brand-100 px-2 py-0.5 rounded-full text-[9px] uppercase">Soon</span>
              </button>
            </div>
          </nav>

          {/* User Profile / Logout (bottom of sidebar) */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-brand-50/60 p-3 rounded-2xl border border-brand-200">
              <div className="w-10 h-10 rounded-full border border-indigo-200 overflow-hidden bg-brand-100 flex items-center justify-center shrink-0">
                <img src="/avatars/user.png" alt={user.username} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-brand-850 truncate">{user.username}</span>
                <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wider">Student</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-brand-500 hover:text-red-500 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* 2. TOP HEADER (if authenticated) */}
        {user && currentCourse ? (
          <header className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 z-30 flex items-center justify-between gap-4">
            {/* Title / Tab Indicator */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger logo */}
              <div className="md:hidden flex items-center gap-2">
                <img src="/logo.png" alt="Aprende Logo" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="hidden sm:block text-base font-extrabold text-brand-850 capitalize bg-indigo-50 text-accent-indigo px-3 py-1 rounded-xl">
                {currentTab === 'dashboard' || currentTab === 'lesson' ? 'Home' : currentTab === 'roleplay' ? 'AI Roleplay' : currentTab === 'progress' ? 'My Progress' : 'Games & Puzzles'}
              </h2>

              {/* Course Selector Dropdown/Switcher */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => { setCurrentCourse(null); localStorage.removeItem('activeCourse'); setActiveLessonId(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[10px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    currentCourse === 'dummies'
                      ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                      : currentCourse === 'test_skills'
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                      : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                  }`}
                  title="Click to Switch Course Track"
                >
                  {currentCourse === 'dummies' ? (
                    <>
                      <BookOpen size={12} className="shrink-0 text-indigo-600" />
                      <span>For Dummies</span>
                    </>
                  ) : currentCourse === 'test_skills' ? (
                    <>
                      <Award size={12} className="shrink-0 text-amber-500" />
                      <span>Test A1 Skills</span>
                    </>
                  ) : (
                    <>
                      <Languages size={12} className="shrink-0 text-espana-red" />
                      <span>Complete A1</span>
                    </>
                  )}
                  <span className="text-[8px] opacity-65 lowercase font-semibold ml-1">(switch)</span>
                </button>
              </div>
            </div>

            {/* Search Bar (functional lesson search!) */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters, lessons, or vocabulary..."
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-semibold placeholder-brand-400 outline-none transition-all duration-200"
              />
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Voice Accent Dropdown */}
              <div className="relative" ref={accentDropdownRef}>
                <button
                  onClick={() => setShowAccentDropdown(!showAccentDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-100 hover:bg-brand-200 border border-brand-300 rounded-xl text-xs font-extrabold text-brand-800 transition-all duration-200 shadow-sm focus:outline-none flex items-center justify-center cursor-pointer"
                  title="Choose AI Voice Accent"
                >
                  <Globe size={15} className="text-espana-red shrink-0" />
                  <span className="hidden xs:inline">{ACCENT_LABELS[voiceAccent]}</span>
                  <ChevronDown size={14} className={`text-brand-500 transition-transform duration-200 ${showAccentDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAccentDropdown && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-brand-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in">
                    {Object.entries(ACCENT_LABELS).map(([code, label]) => {
                      const isSelected = voiceAccent === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            localStorage.setItem('voiceAccent', code);
                            setVoiceAccent(code);
                            setShowAccentDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold transition-all duration-150 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50/70 text-accent-indigo' 
                              : 'text-brand-700 hover:bg-brand-50 hover:text-brand-900'
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <span className="w-1.5 h-1.5 bg-accent-indigo rounded-full"></span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-brand-500 hover:bg-brand-50 rounded-xl cursor-pointer transition-colors focus:outline-none flex items-center justify-center dark:text-slate-400 dark:hover:bg-slate-800"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Notification Bell with Dropdown */}
              <div className="relative flex items-center justify-center" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-brand-500 hover:bg-brand-50 rounded-xl cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-accent-indigo text-white text-[8px] font-black rounded-full flex items-center justify-center animate-fade-in">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in">
                    <div className="p-4 border-b border-brand-200 flex items-center justify-between">
                      <span className="text-sm font-black text-brand-850">Notifications</span>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className="text-[10px] text-accent-indigo hover:text-accent-violet font-extrabold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-brand-400 font-bold">
                          You have no notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))}
                            className={`p-3.5 border-b border-brand-100 flex items-start gap-3 transition-colors cursor-pointer hover:bg-brand-50/50 ${
                              !n.read ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            <div className="flex-1 flex flex-col gap-0.5 text-left">
                              <span className="text-xs font-black text-brand-800 flex items-center justify-between">
                                <span>{n.title}</span>
                                {!n.read && <span className="w-1.5 h-1.5 bg-accent-indigo rounded-full shrink-0"></span>}
                              </span>
                              <span className="text-[11px] text-brand-500 font-medium leading-relaxed mt-0.5">
                                {n.description}
                              </span>
                              <span className="text-[9px] text-brand-400 font-bold mt-1 uppercase tracking-wider">{n.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Profile Trigger or Stats */}
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full border border-orange-100 font-black text-[11px]">
                  <Flame size={14} className="fill-orange-500 text-orange-600" />
                  <span>{user.streak}d</span>
                </div>
                
                {/* Mobile logout dropdown or button */}
                <button
                  onClick={handleLogout}
                  className="md:hidden p-2 text-brand-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>
        ) : null}

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {!user ? (
            <LoginRegister onAuthSuccess={handleAuthSuccess} />
          ) : !currentCourse ? (
            <CourseSelector onSelectCourse={handleSelectCourse} />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  onStartLesson={handleStartLesson} 
                  token={token} 
                  searchQuery={searchQuery}
                  currentCourse={currentCourse}
                  setCurrentCourse={setCurrentCourse}
                />
              )}
              {currentTab === 'lesson' && (
                <LessonInterface 
                  lessonId={activeLessonId} 
                  token={token} 
                  onBackToDashboard={handleBackToDashboard} 
                />
              )}
              {currentTab === 'roleplay' && (
                <RoleplayZone 
                  token={token} 
                />
              )}
              {currentTab === 'progress' && (
                <ProgressReview 
                  user={user} 
                  token={token} 
                  onBackToDashboard={() => setCurrentTab('dashboard')} 
                  searchQuery={searchQuery}
                  currentCourse={currentCourse}
                />
              )}
              {currentTab === 'games' && (
                <GamesHub 
                  user={user} 
                  token={token} 
                  onXpGain={(xpEarned) => {
                    setUser(prev => ({
                      ...prev,
                      xp: prev.xp + xpEarned
                    }));
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* 4. FOOTER */}
        <footer className="py-6 border-t border-brand-200 text-center text-xs text-brand-400 font-medium bg-white/40">
          <div className="flex items-center justify-center gap-1">
            <span>© 2026 Aprende Spanish. Made with</span>
            <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" />
            <span>for language learners.</span>
          </div>
        </footer>

        {/* 5. RESPONSIVE MOBILE NAVIGATION TAB BAR (md:hidden) */}
        {user && currentCourse && (
          <nav className="md:hidden sticky bottom-0 bg-white border-t border-brand-200 py-2.5 px-4 flex items-center justify-around z-40 shadow-lg">
            <button
              onClick={() => { setCurrentTab('dashboard'); setActiveLessonId(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                currentTab === 'dashboard' || currentTab === 'lesson' ? 'text-accent-indigo' : 'text-brand-400'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Home</span>
            </button>

            <button
              onClick={() => { setCurrentTab('roleplay'); setActiveLessonId(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                currentTab === 'roleplay' ? 'text-accent-indigo' : 'text-brand-400'
              }`}
            >
              <MessageSquare size={20} />
              <span>Roleplay</span>
            </button>

            <button
              onClick={() => { setCurrentTab('progress'); setActiveLessonId(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                currentTab === 'progress' ? 'text-accent-indigo' : 'text-brand-400'
              }`}
            >
              <Award size={20} />
              <span>My Progress</span>
            </button>

            <button
              onClick={() => { setCurrentTab('games'); setActiveLessonId(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                currentTab === 'games' ? 'text-accent-indigo' : 'text-brand-400'
              }`}
            >
              <Gamepad2 size={20} />
              <span>Games</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  );
}

export default App;
