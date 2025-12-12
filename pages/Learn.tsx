import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getWordsForLesson, generateExercisesForLesson } from '../lib/mockData';
import { generateAIQuiz } from '../lib/ai';
import { Exercise } from '../types';

// --- Sound Effects Utility ---
const playSound = (type: 'correct' | 'incorrect') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

// --- Sub-Components ---

// 1. Scaffolded View (Intro)
const ScaffoldedView = ({ exercise, onAnswer }: { exercise: Exercise, onAnswer: (ans: string) => void }) => {
  const [showHint, setShowHint] = useState(false);
  const parts = exercise.word.example_sentence.split(new RegExp(`(${exercise.word.word})`, 'gi'));

  return (
    <div className="flex flex-col items-center">
      <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
        New Word
      </div>
      <div className="text-2xl text-center leading-relaxed mb-8">
        {parts.map((part, i) => (
          part.toLowerCase() === exercise.word.word.toLowerCase() ? (
            <span 
              key={i} 
              onClick={() => setShowHint(true)}
              className="relative inline-block text-primary font-bold cursor-pointer border-b-2 border-primary border-dashed hover:bg-primary/10 px-1 rounded transition-colors"
            >
              {part}
              {showHint && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white text-background rounded-lg shadow-xl text-sm w-48 text-center animate-pulse-glow z-10">
                  <div className="font-bold mb-1">{exercise.word.word}</div>
                  {exercise.word.definition}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
                </div>
              )}
            </span>
          ) : <span key={i}>{part}</span>
        ))}
      </div>

      <div className="glass-card p-6 rounded-xl w-full max-w-md text-center border-l-4 border-primary">
        <h3 className="text-xl font-bold mb-2">{exercise.word.word}</h3>
        <p className="text-text-secondary italic mb-4">{exercise.word.part_of_speech}</p>
        <p className="mb-6">{exercise.word.definition}</p>
        <button 
          onClick={() => onAnswer('understood')}
          className="bg-primary hover:bg-primary/90 text-white w-full py-3 rounded-lg font-bold transition-transform active:scale-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// 2. MCQ View
const MCQView = ({ exercise, onAnswer, disabled }: { exercise: Exercise, onAnswer: (ans: string) => void, disabled: boolean }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-display mb-4 leading-relaxed">{exercise.questionText}</h2>
      </div>
      <div className="grid gap-3">
        {exercise.options?.map((option, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onAnswer(option)}
            className="w-full p-4 rounded-xl border-2 border-white/10 bg-surface hover:bg-white/5 hover:border-primary/50 text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Learn() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { completeLesson, addXP } = useStore();
  
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [failedTest, setFailedTest] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!lessonId) return;
      setLoading(true);

      // 1. Get the words for this lesson
      const words = getWordsForLesson(lessonId);

      // 2. Try to generate with AI
      try {
        const aiQuestions = await generateAIQuiz(words);
        
        if (aiQuestions.length > 0) {
          // Add scaffolding intro if it's not a test
          const intro: Exercise[] = [];
          if (!lessonId.includes('lesson-11')) {
            const parts = lessonId.split('-'); 
            const unitNum = parseInt(parts[1]);
            const lessonNum = parseInt(parts[3]);
            // Only add intro for the 'new' word of this lesson
            // Logic assumes first word in list is the new one for non-test
            if (words.length > 0) {
              intro.push({
                 id: `scaffold-${words[0].id}`,
                 type: 'scaffolded',
                 word: words[0],
                 correctAnswer: 'understood'
              });
            }
          }
          setQueue([...intro, ...aiQuestions]);
        } else {
          // Fallback to mock if AI fails
          const fallback = generateExercisesForLesson(lessonId);
          setQueue(fallback);
        }
      } catch (err) {
        console.error("Error generating lesson:", err);
        setQueue(generateExercisesForLesson(lessonId));
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [lessonId]);

  const handleAnswer = (answer: string) => {
    const currentEx = queue[currentIndex];
    let isCorrect = false;

    if (currentEx.type === 'scaffolded') {
      isCorrect = true;
    } else {
      isCorrect = answer === currentEx.correctAnswer;
    }

    if (isCorrect) {
      setFeedback('correct');
      playSound('correct');
      if (!mistakes.includes(currentEx.id) && currentEx.type !== 'scaffolded') {
        setSessionScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        addXP(10);
      }
    } else {
      setFeedback('incorrect');
      playSound('incorrect');
      if (!mistakes.includes(currentEx.id)) {
        setMistakes(prev => [...prev, currentEx.id]);
        // Simple retry mechanism
        if (!lessonId?.includes('lesson-11')) {
           setQueue(prev => [...prev, { ...currentEx, id: `${currentEx.id}-retry` }]);
        }
      }
    }
    
    if (currentEx.type !== 'scaffolded') {
       setSessionScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const nextExercise = () => {
    setFeedback(null);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishLesson();
    }
  };

  const finishLesson = async () => {
    const finalAccuracy = sessionScore.total > 0 
      ? Math.round((sessionScore.correct / sessionScore.total) * 100) 
      : 100;
    
    const isTest = lessonId?.includes('lesson-11');
    
    if (isTest && finalAccuracy < 75) {
      setFailedTest(true);
      return; 
    }

    let stars = 1;
    if (finalAccuracy > 70) stars = 2;
    if (finalAccuracy > 90) stars = 3;
    if (finalAccuracy === 100) stars = 5;

    if (lessonId) {
      await completeLesson(lessonId, finalAccuracy, stars);
    }
    // Updated Navigation: Go to Learning Path (Map) instead of Dashboard
    navigate('/learning-path'); 
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <div className="text-xl font-bold animate-pulse">Generating AI Lesson...</div>
    </div>
  );

  if (failedTest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
         <div className="text-6xl mb-4">⚠️</div>
         <h1 className="text-3xl font-bold mb-4">Test Failed</h1>
         <p className="text-xl mb-2">Score: <span className="text-error font-bold">{Math.round((sessionScore.correct / sessionScore.total) * 100)}%</span></p>
         <p className="text-text-secondary mb-8">You need 75% to pass this unit.</p>
         <div className="flex gap-4">
           <button onClick={() => navigate('/learning-path')} className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/5">Back to Map</button>
           <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary rounded-xl font-bold hover:bg-primary/80">Try Again</button>
         </div>
      </div>
    )
  }

  const currentEx = queue[currentIndex];
  const progress = (currentIndex / queue.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a092d] text-white overflow-hidden">
      <header className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-surface/30 backdrop-blur-md">
        <button onClick={() => navigate('/learning-path')} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
        <div className="flex-1 mx-4 max-w-md">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto relative z-0">
        <div className="w-full">
           {currentEx.type === 'scaffolded' && <ScaffoldedView exercise={currentEx} onAnswer={handleAnswer} />}
           {/* Reuse MCQ view for AI questions as they are formatted as MCQs */}
           {currentEx.type === 'mcq' && <MCQView exercise={currentEx} onAnswer={handleAnswer} disabled={feedback !== null} />}
           {currentEx.type === 'cloze' && <MCQView exercise={currentEx} onAnswer={handleAnswer} disabled={feedback !== null} />}
        </div>
      </main>

      <div className={`fixed bottom-0 left-0 right-0 p-6 z-50 transform transition-transform duration-300 ease-out border-t border-white/10 ${feedback ? 'translate-y-0' : 'translate-y-full'} ${feedback === 'correct' ? 'bg-[#0a092d] glass' : 'bg-surface'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg ${feedback === 'correct' ? 'bg-success text-white' : 'bg-error text-white'}`}>
                {feedback === 'correct' ? '✓' : '✕'}
              </div>
              <div>
                <h3 className={`text-xl font-bold font-display ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
                  {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                </h3>
                {feedback === 'incorrect' && <p className="text-white text-lg mt-1">Answer: {currentEx.correctAnswer}</p>}
              </div>
           </div>
           <button onClick={nextExercise} className={`px-8 py-3 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:scale-105 active:scale-95 ${feedback === 'correct' ? 'bg-success shadow-success/20' : 'bg-error shadow-error/20'}`}>
             Continue
           </button>
        </div>
      </div>
    </div>
  );
}