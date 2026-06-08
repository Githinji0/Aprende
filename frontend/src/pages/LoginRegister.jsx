import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Languages, AlertCircle } from 'lucide-react';
import { PixelCTAButton } from '../components/PixelCTAButton';

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
      <div className="w-full max-w-md md:max-w-4xl glass-card rounded-[2rem] shadow-2xl border border-white/40 flex flex-col md:flex-row overflow-hidden animate-fade-in">
        
        {/* Left Column: Mascot Welcome (Desktop Only) */}
        <div className="hidden md:flex md:w-1/2 bg-espana-sand/60 p-8 flex-col justify-between items-center relative overflow-hidden border-r border-espana-red/5">
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-espana-gold/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="text-center relative z-10 flex flex-col gap-1 items-center">
            <span className="text-[10px] font-black text-espana-red uppercase tracking-widest bg-red-50 border border-red-100 px-3 py-1 rounded-full">
              ¡Aprende Español!
            </span>
            <h3 className="text-2xl font-black text-espana-charcoal mt-3">Ready to study Spanish?</h3>
            <p className="text-xs text-brand-500 max-w-[240px] mt-1 font-semibold leading-relaxed">
              Join thousands of learners building habits and conversational fluency daily.
            </p>
          </div>

          <div className="w-56 h-64 relative flex items-center justify-center z-10">
            <img 
              src="/flamenco_dancer.png" 
              alt="Flamenco Dancer" 
              className="w-full h-full object-contain" 
            />
          </div>

          <div className="text-center z-10">
            <span className="text-xs text-espana-charcoal/70 italic font-bold">
              "¡Hola! Learn Spanish with passion and joy!" 💃
            </span>
          </div>
        </div>

        {/* Right Column: Auth Form Card */}
        <div className="w-full md:w-1/2 p-8 flex flex-col gap-6 relative overflow-hidden bg-white/70">
          
          {/* Decorative background gradients */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-accent-violet/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-accent-indigo/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center">
            <div className="inline-block mb-3 select-none">
              <img src="/logo.png" alt="Aprende Logo" className="w-16 h-16 object-contain mx-auto" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-900 tracking-tight">
              {isLogin ? 'Welcome Back!' : 'Create your account'}
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
              <AlertCircle size={16} className="shrink-0 text-red-500" />
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
                  placeholder="juan@example.com"
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
            <PixelCTAButton
              type="submit"
              disabled={loading}
              className="w-full glass-red-button py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
              {!loading && <ArrowRight size={16} />}
            </PixelCTAButton>

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
    </div>
  );
};

export default LoginRegister;
