
import React, { useState } from 'react';
import { AthenaLogo, LockIcon, UserIcon } from './Icons';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/data';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!isRegister) {
      if (role === 'ADMIN') {
        // Admin Login Check
        if (formData.username !== 'admin' || formData.password !== 'admin@123') {
          setError('Invalid Admin credentials.');
          setLoading(false);
          return;
        }
      } else {
        // Mock User Login Check
        // Match username against email prefix or name for demo purposes
        const mockUser = MOCK_USERS.find(u => 
            u.email.split('@')[0] === formData.username || 
            u.name.toLowerCase().includes(formData.username.toLowerCase())
        );
        
        if (mockUser) {
           if (formData.password !== 'login@123') {
             setError('Invalid password.');
             setLoading(false);
             return;
           }
        }
      }
    }

    if (formData.username && formData.password) {
      // Find existing mock user if logging in
      const knownUser = !isRegister && role === 'USER' 
        ? MOCK_USERS.find(u => u.email.split('@')[0] === formData.username) 
        : null;
      
      const userToLogin: User = knownUser || {
        id: Math.random().toString(36).substr(2, 9),
        name: isRegister ? formData.name : (role === 'ADMIN' ? 'Administrator' : 'Guest User'),
        email: `${formData.username}@athena.com`,
        role: role,
        phoneNumber: '+91 00000 00000', 
        registerNumber: `GUEST-${Math.floor(Math.random() * 1000)}`
      };
      
      onLogin(userToLogin);
    } else {
      setError('Please fill in all fields.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/40 via-transparent to-transparent"></div>
      
      <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative z-10 border border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-800 p-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center text-primary-400 mb-4 shadow-inner border border-slate-600 p-4">
            <AthenaLogo className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Athena</h1>
          <p className="text-slate-400 text-sm">
            {isRegister ? "Welcome! Please enter your details." : "Welcome back! Please enter your details."}
          </p>
        </div>

        {/* Role Tabs */}
        {!isRegister && (
          <div className="flex px-8 gap-4 mb-2">
            <button 
              onClick={() => { setRole('USER'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                role === 'USER' 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              User
            </button>
            <button 
              onClick={() => { setRole('ADMIN'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                role === 'ADMIN' 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs text-center border border-red-500/20 font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserIcon />
                </div>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                  placeholder="Mohammed Noor"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <UserIcon />
              </div>
              <input 
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                placeholder="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <LockIcon />
              </div>
              <input 
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="bg-slate-900/50 p-6 text-center border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); setRole('USER'); }}
              className="ml-2 text-primary-400 font-bold hover:text-primary-300 hover:underline"
            >
              {isRegister ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
