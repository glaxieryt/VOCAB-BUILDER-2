import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300">
    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-40 bg-surface rounded-xl border border-white/5 shadow-2xl animate-float opacity-40 rotate-[-6deg] flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Eloquent</div>
              <div className="text-sm text-text-secondary">Fluent or persuasive</div>
            </div>
          </div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-40 bg-surface rounded-xl border border-white/5 shadow-2xl animate-float opacity-40 rotate-[12deg] flex items-center justify-center" style={{ animationDelay: '2s' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">Pragmatic</div>
              <div className="text-sm text-text-secondary">Dealing with things sensibly</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-secondary mb-6 backdrop-blur-sm">
            🚀 Trusted by 10,000+ students
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Master 1200 SAT Words <br /> with Confidence
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Gamified learning that adapts to your brain. Stop memorizing, start mastering with our proven spaced repetition system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth?mode=signup" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1"
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🎯" 
              title="Adaptive Learning" 
              desc="Words adapt to your performance. Our algorithm ensures you focus on what you struggle with, not what you already know."
            />
            <FeatureCard 
              icon="🔥" 
              title="Daily Streaks" 
              desc="Stay motivated with streak counters, XP points, and achievement badges that make studying addictive."
            />
            <FeatureCard 
              icon="🧠" 
              title="Spaced Repetition" 
              desc="We use the scientific SM-2 algorithm to schedule reviews at the exact moment you're about to forget."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold font-display mb-6">Ready to ace your SAT vocabulary?</h2>
          <Link 
            to="/auth?mode=signup" 
            className="inline-block bg-secondary hover:bg-secondary/90 text-background px-10 py-4 rounded-full text-xl font-bold transition-all shadow-lg shadow-secondary/25 hover:scale-105"
          >
            Get Started Now - It's Free
          </Link>
          <p className="mt-4 text-text-secondary text-sm">No credit card required</p>
        </div>
      </section>
      
      <footer className="py-8 border-t border-white/5 text-center text-text-disabled text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <p>© 2024 VocabMaster. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
        </div>
      </footer>
    </div>
  );
}