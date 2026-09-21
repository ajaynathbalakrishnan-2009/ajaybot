import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Authentication is not configured on this AjayBot deployment.');
      }

      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split('@')[0],
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          setMessage('Account created. Welcome to AjayBot!');
        } else {
          setMessage('Account created. Check your email to confirm your account, then sign in.');
          setMode('login');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-brand-bg-light dark:bg-brand-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary via-indigo-500 to-brand-cyan flex items-center justify-center text-white shadow-brand-glow">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">AjayBot</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Sign in once. Your AjayBot session and access are handled automatically.
          </p>
        </div>

        <div className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-border rounded-3xl shadow-2xl p-6">
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className={`py-2 rounded-lg text-sm font-semibold transition ${mode === 'login' ? 'bg-white dark:bg-brand-surface shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`py-2 rounded-lg text-sm font-semibold transition ${mode === 'signup' ? 'bg-white dark:bg-brand-surface shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>

            {(error || message) && (
              <div className={`flex gap-2 items-start rounded-xl p-3 text-xs ${error ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'}`}>
                {error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <LogIn className="w-4 h-4 shrink-0" />}
                <span>{error || message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-sm font-semibold shadow-brand-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in to AjayBot' : 'Create AjayBot account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
