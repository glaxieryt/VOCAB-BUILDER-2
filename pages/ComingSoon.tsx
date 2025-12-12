import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const feature = searchParams.get('feature') || 'This feature';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl border border-white/5 animate-float">
        🚀
      </div>
      <h1 className="text-3xl font-bold font-display mb-2">Coming Soon</h1>
      <p className="text-text-secondary max-w-md mb-8">
        <span className="text-primary font-bold">{feature}</span> is currently under development. We are working hard to bring this to you soon!
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );
}