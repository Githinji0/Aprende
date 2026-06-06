import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import LessonInterface from './pages/LessonInterface';
import RoleplayZone from './pages/RoleplayZone';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-accent-indigo rounded-full animate-spin"></div>
        <p className="text-brand-500 font-semibold">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <Navbar 
        user={user} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 w-full max-w-6xl mx-auto py-6">
        {!user ? (
          <LoginRegister onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard 
                user={user} 
                onStartLesson={handleStartLesson} 
                token={token} 
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
          </>
        )}
      </main>

      <footer className="py-6 border-t border-brand-200 text-center text-xs text-brand-400 font-medium bg-white/40">
        <p>© 2026 Aprende Spanish. Hecho con amor para estudiantes de idiomas. 🇪🇸</p>
      </footer>
    </div>
  );
}

export default App;
