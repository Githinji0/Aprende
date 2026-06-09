import React from 'react';
import { Flame, Star, LogOut, MessageSquare, BookOpen, User, Award, GraduationCap, Languages } from 'lucide-react';

const Navbar = ({ user, currentTab, setCurrentTab, onLogout }) => {
  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => user && setCurrentTab('dashboard')}
        >
          <img src="/logo.png" alt="Aprende Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-espana-red">
            Aprende
          </span>
        </div>

        {/* Navigation / User Status */}
        {user ? (
          <div className="flex items-center gap-6">
            
            {/* Nav Links */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'dashboard' || currentTab === 'lesson'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-brand-600 hover:bg-brand-100'
                }`}
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Lessons</span>
              </button>
              
              <button
                onClick={() => setCurrentTab('roleplay')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'roleplay'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-brand-600 hover:bg-brand-100'
                }`}
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">AI Roleplay</span>
              </button>

              <button
                onClick={() => setCurrentTab('progress')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'progress'
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-brand-600 hover:bg-brand-100'
                }`}
              >
                <Award size={16} />
                <span className="hidden sm:inline">Review</span>
              </button>
            </div>

            <div className="h-6 w-[1px] bg-brand-300 hidden sm:block"></div>

            {/* Streak & XP Badges */}
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div 
                className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 font-bold text-sm shadow-sm"
                title="Current Streak"
              >
                <Flame size={18} className="fill-orange-500 animate-pulse text-orange-600" />
                <span>{user.streak}d</span>
              </div>

              {/* XP Badge */}
              <div 
                className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-200 font-bold text-sm shadow-sm"
                title="Total XP"
              >
                <Star size={18} className="fill-yellow-400 text-yellow-600" />
                <span>{user.xp} XP</span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-brand-300"></div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-brand-700 hidden md:flex">
                <User size={16} className="text-brand-500" />
                <span className="text-sm font-semibold max-w-[120px] truncate">
                  {user.username}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-brand-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>

          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-brand-500 italic font-medium">
            <Languages size={16} className="text-accent-indigo" />
            <span>Empieza a aprender hoy</span>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
