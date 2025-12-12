import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MOCK_VOCABULARY } from '../lib/mockData';
import { VocabularyWord } from '../types';

// Simple shuffle utility
const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function Learn() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson } = useStore();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [lessonWords, setLessonWords] = useState<VocabularyWord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  // Type definition for options state
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    // Determine words for this lesson (Mock logic: just take next 5 words)
    // In real app, lessonId maps to specific word IDs
    const lessonNum = parseInt(lessonId?.split('-')[1] || '1');
    const startIndex = (lessonNum - 1) * 5;
    const words = MOCK_VOCABULARY.slice(startIndex, startIndex + 5);
    setLessonWords(words);
  }, [lessonId]);

  useEffect(() => {
    if (lessonWords.length > 0 && currentWordIndex < lessonWords.length) {
      generateOptions();
    }
  }, [currentWordIndex, lessonWords]);

  const generateOptions = () => {
    if (!lessonWords[currentWordIndex]) return;
    
    const currentWord = lessonWords[currentWordIndex];
    const correctDef = currentWord.definition;
    
    // Get 3 random other definitions
    const distractors = MOCK_VOCABULARY
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.definition);
      
    setOptions(shuffleArray([correctDef, ...distractors]));
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === lessonWords[currentWordIndex].definition;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      // Play sound effect here
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentWordIndex < lessonWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setQuizComplete(true);
      const finalScore = Math.round((score.correct / lessonWords.length) * 100);
      let stars = 1;
      if (finalScore > 60) stars = 2;
      if (finalScore > 80) stars = 3;
      if (finalScore > 90) stars = 4;
      if (finalScore === 100) stars = 5;
      
      if (lessonId) completeLesson(lessonId, finalScore, stars);
    }
  };

  if (lessonWords.length === 0) return <div className="p-8 text-center">Loading Lesson...</div>;

  if (quizComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold font-display mb-4">Lesson Complete!</h2>
        <div className="bg-surface p-8 rounded-2xl border border-white/10 w-full max-w-md mb-8">
           <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <div className="text-sm text-text-secondary">Accuracy</div>
                <div className="text-3xl font-bold text-primary">{Math.round((score.correct / (score.correct + score.incorrect)) * 100)}%</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">XP Earned</div>
                <div className="text-3xl font-bold text-secondary">+{50 + (score.correct * 10)}</div>
              </div>
           </div>
           <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all"
           >
             Continue
           </button>
        </div>
      </div>
    );
  }

  const currentWord = lessonWords[currentWordIndex];
  const progress = ((currentWordIndex) / lessonWords.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-text-secondary hover:text-white transition-colors">
          ✕
        </button>
        <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4 font-bold">
           <span className="text-success">{score.correct}</span>
           <span className="text-error">{score.incorrect}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold font-display mb-4">{currentWord.word}</h1>
          <p className="text-text-secondary italic text-lg">{currentWord.part_of_speech}</p>
        </div>

        <div className="grid gap-3">
          {options.map((option, idx) => {
            let statusClass = "bg-surface border-white/10 hover:border-primary/50 hover:bg-white/5";
            
            if (showFeedback) {
              if (option === currentWord.definition) {
                statusClass = "bg-success/20 border-success text-success";
              } else if (selectedAnswer === option) {
                statusClass = "bg-error/20 border-error text-error";
              } else {
                statusClass = "opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleAnswer(option)}
                className={`w-full p-5 rounded-xl border-2 text-left text-lg font-medium transition-all duration-200 ${statusClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/10 transform transition-transform duration-300 z-20
        ${showFeedback ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isCorrect ? 'bg-success text-white' : 'bg-error text-white'}`}>
              {isCorrect ? '✓' : '✕'}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              {!isCorrect && <p className="text-sm text-text-secondary">Correct: {currentWord.definition}</p>}
            </div>
          </div>
          <button 
            onClick={nextQuestion}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isCorrect ? 'bg-success hover:bg-success/90 shadow-success/20' : 'bg-error hover:bg-error/90 shadow-error/20'}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}