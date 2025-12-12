import { VocabularyWord, Exercise, Unit, LessonNode } from '../types';

// Seed Data - We use this for the first 2 units. 
// For Units 3-120, we will procedurally generate words to simulate the 1200 word database.
export const SEED_VOCABULARY: VocabularyWord[] = [
  // UNIT 1 WORDS (10 words)
  { id: '1', word: 'Abacus', definition: 'Frame with balls for calculating', part_of_speech: 'noun', example_sentence: 'The merchant used an abacus to count.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '2', word: 'Abate', definition: 'To lessen or subside', part_of_speech: 'verb', example_sentence: 'The storm began to abate.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '3', word: 'Abdication', definition: 'Giving up control', part_of_speech: 'noun', example_sentence: 'The king announced his abdication.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '4', word: 'Aberration', definition: 'Straying from normal', part_of_speech: 'noun', example_sentence: 'The outburst was an aberration.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '5', word: 'Abet', definition: 'Encourage in doing wrong', part_of_speech: 'verb', example_sentence: 'He helped abet the crime.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '6', word: 'Abhor', definition: 'To hate or detest', part_of_speech: 'verb', example_sentence: 'I abhor cruelty.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '7', word: 'Abject', definition: 'Extremely bad or degrading', part_of_speech: 'adjective', example_sentence: 'They lived in abject poverty.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '8', word: 'Abjure', definition: 'Promise to give up', part_of_speech: 'verb', example_sentence: 'He refused to abjure his faith.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '9', word: 'Abraded', definition: 'Worn away by friction', part_of_speech: 'adjective', example_sentence: 'His skin was abraded by the fall.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '10', word: 'Abrogate', definition: 'Repeal by authority', part_of_speech: 'verb', example_sentence: 'The law was abrogated.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  
  // UNIT 2 WORDS (10 words)
  { id: '11', word: 'Abscond', definition: 'To go away suddenly', part_of_speech: 'verb', example_sentence: 'The thief tried to abscond.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '12', word: 'Abstruse', definition: 'Difficult to understand', part_of_speech: 'adjective', example_sentence: 'The theory was abstruse.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '13', word: 'Acclaimed', definition: 'Praised enthusiastically', part_of_speech: 'adjective', example_sentence: 'The acclaimed actor won.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '14', word: 'Accolade', definition: 'Award or privilege', part_of_speech: 'noun', example_sentence: 'She received the highest accolade.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '15', word: 'Adamant', definition: 'Refusing to change mind', part_of_speech: 'adjective', example_sentence: 'He was adamant about his decision.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '16', word: 'Admonitory', definition: 'Giving a warning', part_of_speech: 'adjective', example_sentence: 'She gave him an admonitory look.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '17', word: 'Adorn', definition: 'To decorate', part_of_speech: 'verb', example_sentence: 'Flowers adorn the room.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '18', word: 'Affable', definition: 'Friendly and polite', part_of_speech: 'adjective', example_sentence: 'The host was very affable.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '19', word: 'Aggravate', definition: 'Make worse or irritate', part_of_speech: 'verb', example_sentence: 'Stress will aggravate the pain.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '20', word: 'Alacrity', definition: 'Brisk and cheerful readiness', part_of_speech: 'noun', example_sentence: 'He accepted with alacrity.', synonyms: [], difficulty_level: 2, unit_number: 2 },
];

// Helper to retrieve a word by its global index (0-1199)
const getWordByGlobalIndex = (index: number): VocabularyWord => {
  if (index < SEED_VOCABULARY.length) {
    return SEED_VOCABULARY[index];
  }

  // Procedural generation for indices 20-1199
  const unitNum = Math.floor(index / 10) + 1;
  return {
    id: (index + 1).toString(),
    word: `Word-${index + 1}`,
    definition: `Definition for word ${index + 1} (Unit ${unitNum})`,
    part_of_speech: index % 2 === 0 ? 'noun' : 'verb',
    example_sentence: `This is an example sentence for Word-${index + 1}.`,
    synonyms: [],
    difficulty_level: 1,
    unit_number: unitNum
  };
};

export const generateUnits = (): Unit[] => {
  const units: Unit[] = [];
  const TOTAL_UNITS = 120; 

  for (let u = 1; u <= TOTAL_UNITS; u++) {
    const lessons: LessonNode[] = [];
    
    // Generate 10 Lessons (Learning) + 1 Test (Retention Check)
    for (let l = 1; l <= 11; l++) {
      let type: 'intro' | 'practice' | 'test' = 'practice';
      if (l === 11) type = 'test';
      else type = 'intro'; 

      lessons.push({
        id: `unit-${u}-lesson-${l}`,
        unitId: u,
        lessonNumber: l,
        type: type,
        isLocked: u === 1 && l === 1 ? false : true, 
        completed: false
      });
    }

    units.push({
      id: u,
      title: `Unit ${u}: ${u <= 30 ? 'Foundations' : u <= 60 ? 'Intermediate' : u <= 90 ? 'Advanced' : 'Mastery'}`,
      lessons,
      isLocked: u > 1
    });
  }
  return units;
};

// Helper to shuffle array
const shuffle = <T>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

// New Helper to get words for a lesson to feed into AI
export const getWordsForLesson = (lessonId: string): VocabularyWord[] => {
  const parts = lessonId.split('-'); 
  const unitNum = parseInt(parts[1]);
  const lessonNum = parseInt(parts[3]);
  const words: VocabularyWord[] = [];

  // If Unit Test, get all words from current unit
  if (lessonNum === 11) {
    const currentUnitStartIdx = (unitNum - 1) * 10;
    for (let i = 0; i < 10; i++) {
      words.push(getWordByGlobalIndex(currentUnitStartIdx + i));
    }
  } else {
    // For standard lessons, get the new word + review words
    // 1. The New Word
    const newWordIndex = ((unitNum - 1) * 10) + (lessonNum - 1);
    words.push(getWordByGlobalIndex(newWordIndex));

    // 2. Review words (up to 3 previous words from this unit)
    for (let i = 1; i < lessonNum && i <= 3; i++) {
       const reviewIdx = ((unitNum - 1) * 10) + (i - 1);
       words.push(getWordByGlobalIndex(reviewIdx));
    }
  }
  
  return words;
}

export const generateExercisesForLesson = (lessonId: string): Exercise[] => {
  // Legacy mock generator - mostly replaced by AI now, 
  // but kept as fallback if needed for offline mode
  const parts = lessonId.split('-'); 
  const unitNum = parseInt(parts[1]);
  const lessonNum = parseInt(parts[3]);
  const exercises: Exercise[] = [];

  if (lessonNum === 11) {
    const currentUnitStartIdx = (unitNum - 1) * 10;
    const currentUnitWords = Array.from({ length: 10 }, (_, i) => getWordByGlobalIndex(currentUnitStartIdx + i));
    
    currentUnitWords.forEach(word => {
      const distractors = currentUnitWords.filter(w => w.id !== word.id).map(w => w.definition);
      exercises.push({
        id: `test-${word.id}-${Date.now()}`,
        type: 'mcq',
        word: word,
        questionText: `Select the correct definition for: ${word.word}`,
        options: shuffle([word.definition, ...shuffle(distractors).slice(0, 3)]),
        correctAnswer: word.definition
      });
    });
    return shuffle(exercises);
  }

  const newWordIndex = ((unitNum - 1) * 10) + (lessonNum - 1);
  const newWord = getWordByGlobalIndex(newWordIndex);

  exercises.push({
    id: `new-scaffold-${newWord.id}`,
    type: 'scaffolded',
    word: newWord,
    correctAnswer: 'understood'
  });

  return exercises;
};