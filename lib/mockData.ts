import { VocabularyWord, Exercise, Unit, LessonNode } from '../types';

// Seed Data from the provided PDF content (A subset provided here, but structure supports all)
export const SEED_VOCABULARY: VocabularyWord[] = [
  // A
  { id: '1', word: 'Abacus', definition: 'Frame with ball for calculating', part_of_speech: 'noun', example_sentence: 'He used an abacus for math.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '2', word: 'Abate', definition: 'To lesson to subside', part_of_speech: 'verb', example_sentence: 'The storm began to abate.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '3', word: 'Abdication', definition: 'Giving up control authority', part_of_speech: 'noun', example_sentence: 'The kings abdication shocked the nation.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '4', word: 'Aberration', definition: 'Straying away from that is normal', part_of_speech: 'noun', example_sentence: 'It was a mental aberration.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '5', word: 'Abet', definition: 'Help/encourage somebody (in doing wrong)', part_of_speech: 'verb', example_sentence: 'He aided and abetted the criminal.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '6', word: 'Abeyance', definition: 'Suspended action', part_of_speech: 'noun', example_sentence: 'The matter was held in abeyance.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '7', word: 'Abhor', definition: 'To hate to detest', part_of_speech: 'verb', example_sentence: 'I abhor violence.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '8', word: 'Abide', definition: 'To faithful to endure', part_of_speech: 'verb', example_sentence: 'I cannot abide his rudeness.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '9', word: 'Abjure', definition: 'Promise or swear to give up', part_of_speech: 'verb', example_sentence: 'He abjured his allegiance.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '10', word: 'Abraded', definition: 'Rubbed off worn away by friction', part_of_speech: 'adjective', example_sentence: 'The skin was abraded.', synonyms: [], difficulty_level: 1, unit_number: 1 },
  { id: '11', word: 'Abrogate', definition: 'Repeal or annul by authority', part_of_speech: 'verb', example_sentence: 'The treaty was abrogated.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '12', word: 'Abscond', definition: 'To go away suddenly (to avoid arrest)', part_of_speech: 'verb', example_sentence: 'He absconded with the money.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '13', word: 'Abstruse', definition: 'Difficult to comprehend obscure', part_of_speech: 'adjective', example_sentence: 'An abstruse philosophical essay.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '14', word: 'Abut', definition: 'Border on', part_of_speech: 'verb', example_sentence: 'Their house abuts ours.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '15', word: 'Abysmal', definition: 'Bottomless extreme', part_of_speech: 'adjective', example_sentence: 'The service was abysmal.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '16', word: 'Acarpous', definition: 'Sterile, no longer fertile', part_of_speech: 'adjective', example_sentence: 'The land became acarpous.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '17', word: 'Acclaimed', definition: 'Welcomed with shouts and approval', part_of_speech: 'adjective', example_sentence: 'The acclaimed author arrived.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '18', word: 'Accolade', definition: 'Praise approval', part_of_speech: 'noun', example_sentence: 'He received the ultimate accolade.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '19', word: 'Accretion', definition: 'The growing of separate things into one', part_of_speech: 'noun', example_sentence: 'The accretion of wealth.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '20', word: 'Adamant', definition: 'Kind of stone inflexible', part_of_speech: 'adjective', example_sentence: 'He was adamant in his refusal.', synonyms: [], difficulty_level: 2, unit_number: 2 },
  { id: '21', word: 'Admonitory', definition: 'Containing warning', part_of_speech: 'adjective', example_sentence: 'An admonitory gesture.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '22', word: 'Adorn', definition: 'Add beauty decorate', part_of_speech: 'verb', example_sentence: 'Jewels adorn her neck.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '23', word: 'Adulteration', definition: 'Making impure, poorer in quality', part_of_speech: 'noun', example_sentence: 'Adulteration of food is a crime.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '24', word: 'Affable', definition: 'Polite and friendly', part_of_speech: 'adjective', example_sentence: 'An affable host.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '25', word: 'Affinity', definition: 'Close connection/relationship', part_of_speech: 'noun', example_sentence: 'He has an affinity for nature.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '26', word: 'Aggravate', definition: 'Make worse irritate', part_of_speech: 'verb', example_sentence: 'Don\'t aggravate the injury.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '27', word: 'Agile', definition: 'Active quick moving', part_of_speech: 'adjective', example_sentence: 'As agile as a monkey.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '28', word: 'Agog', definition: 'Eager/excited', part_of_speech: 'adjective', example_sentence: 'They were all agog to hear the news.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '29', word: 'Ail', definition: 'Trouble be ill', part_of_speech: 'verb', example_sentence: 'What ails you?', synonyms: [], difficulty_level: 3, unit_number: 3 },
  { id: '30', word: 'Alacrity', definition: 'Eager and cheerful readiness', part_of_speech: 'noun', example_sentence: 'He moved with alacrity.', synonyms: [], difficulty_level: 3, unit_number: 3 },
  // ... (In a real scenario, all 1161 words would be listed here)
  // Adding a few more to test > 30
  { id: '31', word: 'Alcove', definition: 'Recess/partially enclose place', part_of_speech: 'noun', example_sentence: 'A bed in the alcove.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '32', word: 'Allegiance', definition: 'Duty support loyalty', part_of_speech: 'noun', example_sentence: 'Pledge allegiance to the flag.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '33', word: 'Alleviate', definition: 'Make (pain) easier to bear', part_of_speech: 'verb', example_sentence: 'Medicine to alleviate pain.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '34', word: 'Alloy', definition: 'To debase by mixing with something inferior', part_of_speech: 'noun', example_sentence: 'Bronze is an alloy.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '35', word: 'Aloof', definition: 'Reserved indifferent', part_of_speech: 'adjective', example_sentence: 'He stayed aloof from the crowd.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '36', word: 'Amalgamate', definition: 'Mix combine unite societies', part_of_speech: 'verb', example_sentence: 'The companies amalgamated.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '37', word: 'Ambidextrous', definition: 'Able to use the left hand or the right equally well', part_of_speech: 'adjective', example_sentence: 'An ambidextrous player.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '38', word: 'Ambiguous', definition: 'Doubtful uncertain', part_of_speech: 'adjective', example_sentence: 'An ambiguous answer.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '39', word: 'Ambivalent', definition: 'Having both of two contrary meanings', part_of_speech: 'adjective', example_sentence: 'Ambivalent feelings.', synonyms: [], difficulty_level: 4, unit_number: 4 },
  { id: '40', word: 'Ameliorate', definition: 'Improve make better', part_of_speech: 'verb', example_sentence: 'Steps to ameliorate the situation.', synonyms: [], difficulty_level: 4, unit_number: 4 },
];

// Helper to retrieve a word by its global index (0-1199)
// EXPORTED NOW SO USESTORE CAN USE IT
export const getWordByGlobalIndex = (index: number): VocabularyWord => {
  if (index < SEED_VOCABULARY.length) {
    return SEED_VOCABULARY[index];
  }

  // Procedural generation for indices beyond SEED data
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