import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginRegister = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Pass user data upwards
      onAuthSuccess({
        _id: data._id,
        username: data.username,
        email: data.email,
        xp: data.xp,
        streak: data.streak,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl shadow-2xl p-8 border border-white/40 flex flex-col gap-6 animate-fade-in relative overflow-hidden">
        
        {/* Decorative background gradients */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-accent-teal/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-accent-indigo/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-tr from-accent-indigo to-accent-teal p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-150 mb-3">
            <span className="text-3xl">🇪🇸</span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-900 tracking-tight">
            {isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
          </h2>
          <p className="text-sm text-brand-500 mt-1">
            {isLogin 
              ? 'Sign in to continue your Spanish learning journey' 
              : 'Start tracking your daily streak and earning XP today'
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl border border-red-100 flex items-center gap-2">
            <span className="font-semibold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username (Only for Sign Up) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-600 uppercase tracking-wider pl-1">
                Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="el_toro"
                  className="w-full pl-11 pr-4 py-3 bg-brand-100/50 hover:bg-brand-100/80 focus:bg-white border border-brand-200 focus:border-accent-indigo rounded-2xl transition-all duration-200 text-brand-900 placeholder-brand-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-600 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full pl-11 pr-4 py-3 bg-brand-100/50 hover:bg-brand-100/80 focus:bg-white border border-brand-200 focus:border-accent-indigo rounded-2xl transition-all duration-200 text-brand-900 placeholder-brand-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-600 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-brand-100/50 hover:bg-brand-100/80 focus:bg-white border border-brand-200 focus:border-accent-indigo rounded-2xl transition-all duration-200 text-brand-900 placeholder-brand-400 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-indigo to-accent-violet hover:opacity-95 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-95 focus:outline-none disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
            {!loading && <ArrowRight size={16} />}
          </button>

        </form>

        {/* Toggle Footer */}
        <div className="text-center pt-2 border-t border-brand-200/60">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-accent-indigo hover:text-accent-violet font-semibold transition-colors duration-200 focus:outline-none"
          >
            {isLogin 
              ? 'Need an account? Sign Up' 
              : 'Already have an account? Sign In'
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginRegister;
