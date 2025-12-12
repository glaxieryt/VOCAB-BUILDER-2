export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  current_streak: number;
  total_xp: number;
  current_level: number;
  avatar_url?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  part_of_speech: string;
  example_sentence: string;
  synonyms: string[];
  difficulty_level: 1 | 2 | 3 | 4 | 5;
}

export interface Lesson {
  id: string;
  title: string;
  section: number;
  unit: number;
  word_count: number;
  required_xp: number;
  is_locked: boolean;
  completed: boolean;
  score?: number;
  stars?: number;
}

export enum QuestionType {
  SCAFFOLDED = 'scaffolded',
  MCQ = 'mcq',
  CLOZE = 'cloze',
  TYPING = 'typing'
}

export interface Question {
  id: string;
  word_id: string;
  type: QuestionType;
  prompt: string;
  correct_answer: string;
  options?: string[]; // For MCQ
  context?: string; // For Cloze/Scaffolded
  word_data: VocabularyWord;
}

export interface ReviewItem {
  wordId: string;
  nextReview: number; // Timestamp
  interval: number; // Days
  easeFactor: number;
}