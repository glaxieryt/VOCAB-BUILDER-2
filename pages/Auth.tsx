import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isSignupInit = searchParams.get('mode') === 'signup';
  
  const [isSignup, setIsSignup] = useState(isSignupInit);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Replaces localError to handle both success and error styles
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, clearAuthError, initialize, authError, login } = useStore();

  useEffect(() => {
    setNotification(null);
    clearAuthError();
    setPassword('');
    setConfirmPassword('');
  }, [isSignup, clearAuthError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsLoading(true);

    const cleanEmail = email.trim();

    // CRITICAL: Prevent "Failed to fetch" by checking config before network call
    if (!isSupabaseConfigured) {
      setNotification({ type: 'error', message: "Connection Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing." });
      setIsLoading(false);
      return;
    }

    // Standard Validation
    if (isSignup && password !== confirmPassword) {
      setNotification({ type: 'error', message: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setNotification({ type: 'error', message: "Password must be at least 6 characters." });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignup) {
        if (!username) {
             setNotification({ type: 'error', message: "Username is required." });
             setIsLoading(false);
             return;
        }

        // --- SIGNUP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim(),
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          await initialize();
          navigate('/dashboard', { replace: true });
        } else {
          // If no session, it means "Confirm Email" is ENABLED in Supabase.
          if (data.user && !data.session) {
              setNotification({ 
                type: 'error', 
                message: "Supabase 'Confirm Email' setting is ON. Please DISABLE it in Project Settings -> Auth -> Providers -> Email. Then sign up with a NEW username (this one is now locked)." 
              });
          } else {
              setNotification({ type: 'success', message: "Account created successfully." });
              setIsSignup(false);
          }
          setIsLoading(false);
        }

      } else {
        // --- LOGIN LOGIC ---
        await login(cleanEmail, password);
        
        // After successful login, refresh state
        await initialize();
        navigate('/dashboard', { replace: true });
      }

    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message || "An unexpected error occurred.";
      const lowerMsg = msg.toLowerCase();
      
      if (lowerMsg.includes("failed to fetch") || lowerMsg.includes("networkerror")) {
        msg = "Connection failed. Please check your internet or Supabase URL.";
      } else if (lowerMsg.includes("invalid login credentials")) {
        msg = "Invalid username or password.";
      } else if (lowerMsg.includes("user already registered")) {
        msg = "Username already taken. Please choose another.";
      } else if (lowerMsg.includes("email not confirmed")) {
        // Vital fix: Instruct user to abandon the unconfirmed username
        msg = "Login Failed: This username is pending email confirmation (which is impossible). Please Sign Up with a NEW username.";
      }
      
      setNotification({ type: 'error', message: msg });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-display mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-text-secondary mb-8">
            {isSignup ? 'Start your vocabulary mastery journey' : 'Continue learning where you left off'}
          </p>

          {(notification || authError) && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              notification?.type === 'success' 
                ? 'bg-success/10 border-success/50 text-success' 
                : 'bg-error/10 border-error/50 text-error'
            }`}>
               <span className="text-xl">{notification?.type === 'success' ? '✓' : '⚠️'}</span>
               <p className="text-sm font-medium pt-0.5 leading-tight">{notification?.message || authError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            {isSignup && (
              <div className="animate-float" style={{ animation: 'none' }}>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="johndoe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <div className="animate-float" style={{ animation: 'none' }}>
                <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-background border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${password && confirmPassword && password !== confirmPassword ? 'border-error focus:border-error' : 'border-white/10 focus:border-primary'}`}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg mt-6 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isSignup ? 'Create Account' : 'Log In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setNotification(null);
              }} 
              className="text-primary font-bold hover:underline"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}