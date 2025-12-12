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
  difficulty_level: number;
  unit_number: number;
}

export type LessonType = 'intro' | 'practice' | 'test';

export interface LessonNode {
  id: string;
  unitId: number;
  lessonNumber: number; // 1-11
  type: LessonType;
  isLocked: boolean;
  completed: boolean;
  score?: number;
  stars?: number;
}

export interface Unit {
  id: number;
  title: string;
  lessons: LessonNode[];
  isLocked: boolean;
}

export type ExerciseType = 'scaffolded' | 'mcq' | 'cloze';

export interface Exercise {
  id: string;
  type: ExerciseType;
  word: VocabularyWord;
  questionText?: string; 
  options?: string[]; 
  correctAnswer: string;
}
