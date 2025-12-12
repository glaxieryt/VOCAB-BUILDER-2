import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isSignupInit = searchParams.get('mode') === 'signup';
  const [isSignup, setIsSignup] = useState(isSignupInit);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated, clearAuthError, initialize } = useStore();

  useEffect(() => {
    setLocalError(null);
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
    setLocalError(null);
    setIsLoading(true);

    // Validation
    if (isSignup && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const email = username.includes('@') ? username : `${username}@example.com`;

    try {
      if (isSignup) {
        // --- SIGNUP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              full_name: username,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
            }
          }
        });

        if (error) {
          console.error("Signup failed:", error.message);
          setLocalError(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          await initialize(); // Sync store with new session
          navigate('/dashboard', { replace: true });
        } else {
          setLocalError("Please check your email to confirm signup.");
          setIsLoading(false);
        }

      } else {
        // --- LOGIN LOGIC (STRICT) ---
        console.log("Attempting login..."); 

        // 1. AWAIT the response.
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // 2. CHECK FOR ERROR. If error exists, STOP.
        if (error) {
          console.error("Login Error:", error.message);
          setLocalError("Invalid credentials. Please try again.");
          setIsLoading(false);
          return; // <--- CRITICAL: Stops flow.
        }

        // 3. SUCCESS. Verify session.
        if (data?.session) {
          console.log("Login success, redirecting...");
          await initialize(); // Sync store with new session
          navigate('/dashboard', { replace: true });
        } else {
          setLocalError("Something went wrong. No session created.");
          setIsLoading(false);
        }
      }

    } catch (err: any) {
      console.error("Auth Error:", err);
      setLocalError(err.message || "An unexpected error occurred.");
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

          {localError && (
            <div className="mb-6 p-4 bg-error/10 border border-error/50 rounded-lg flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-error font-medium pt-0.5">{localError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
                setLocalError(null);
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