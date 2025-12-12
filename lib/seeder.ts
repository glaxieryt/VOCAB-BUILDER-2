import { supabase } from './supabase';
import { generateUnits, SEED_VOCABULARY } from './mockData';

// Helper to split array into chunks for batching
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

/**
 * Populates the Supabase database with Units, Lessons, and Words.
 * Uses a "Check-Existence-Then-Insert" strategy to be idempotent
 * without relying on database-level UNIQUE constraints (fixes 42P10 error).
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding (Safe Mode)...');
  
  const mockUnits = generateUnits();
  
  try {
    // ---------------------------------------------------------
    // 1. INSERT UNITS (Idempotent Check)
    // ---------------------------------------------------------
    console.log(`.. Preparing units`);
    
    // Fetch existing units to avoid duplicates manually
    const { data: existingUnits, error: fetchUnitsError } = await supabase
      .from('units')
      .select('id, sequence_number');

    if (fetchUnitsError) {
        // DETECT RLS ERROR
        if (fetchUnitsError.message.includes('row-level security')) {
            console.warn('⚠️ RLS Policy detected: Skipping database seeding. The app will run in "Mock Data" mode until policies are configured in Supabase.');
            return;
        }
        throw new Error(`Failed to fetch existing units: ${fetchUnitsError.message}`);
    }

    const existingUnitSeq = new Set(existingUnits?.map(u => u.sequence_number) || []);
    
    // Filter out units that already exist
    const unitsToInsert = mockUnits
      .filter(u => !existingUnitSeq.has(u.id))
      .map(u => ({
        sequence_number: u.id,
        title: u.title,
        description: 'Master these 10 essential words.'
      }));

    if (unitsToInsert.length > 0) {
      console.log(`.. Inserting ${unitsToInsert.length} new units`);
      const { error: insertUnitsError } = await supabase
        .from('units')
        .insert(unitsToInsert);
      
      if (insertUnitsError) {
          if (insertUnitsError.message.includes('row-level security')) {
              console.warn('⚠️ RLS Policy detected during insert. Skipping seeding.');
              return;
          }
          throw new Error(`Units Insert Failed: ${insertUnitsError.message}`);
      }
    } else {
      console.log('.. Units already exist, skipping insert.');
    }

    // Re-fetch ALL units to create the ID map needed for lessons
    const { data: allUnits, error: refetchUnitsError } = await supabase
      .from('units')
      .select('id, sequence_number');
      
    if (refetchUnitsError) throw refetchUnitsError;

    // Map: Sequence -> UUID
    const unitIdMap = new Map<number, string>();
    allUnits?.forEach(u => unitIdMap.set(u.sequence_number, u.id));

    // ---------------------------------------------------------
    // 2. INSERT LESSONS (Idempotent Check)
    // ---------------------------------------------------------
    console.log('.. Preparing lessons');
    
    // Fetch existing lessons to avoid duplicates
    const { data: existingLessons, error: fetchLessonsError } = await supabase
      .from('lessons')
      .select('id, unit_id, lesson_number');
      
    if (fetchLessonsError) throw new Error(`Failed to fetch lessons: ${fetchLessonsError.message}`);

    // Create a set of existing "UnitUUID-LessonNumber" keys
    const existingLessonKeys = new Set(
      existingLessons?.map(l => `${l.unit_id}-${l.lesson_number}`) || []
    );

    const lessonsPayload: any[] = [];
    
    mockUnits.forEach(u => {
      const uUUID = unitIdMap.get(u.id);
      if (!uUUID) return;
      
      u.lessons.forEach(l => {
        // Skip if this specific lesson already exists for this unit
        if (existingLessonKeys.has(`${uUUID}-${l.lessonNumber}`)) return;

        lessonsPayload.push({
          unit_id: uUUID,
          title: l.type === 'test' ? 'Unit Test' : `Lesson ${l.lessonNumber}`,
          lesson_number: l.lessonNumber,
          type: l.type
        });
      });
    });

    if (lessonsPayload.length > 0) {
      console.log(`.. Inserting ${lessonsPayload.length} new lessons`);
      const lessonChunks = chunkArray(lessonsPayload, 50);
      
      let chunkCount = 0;
      for (const chunk of lessonChunks) {
         chunkCount++;
         const { error } = await supabase.from('lessons').insert(chunk);
         if (error) {
             console.error(`Failed at lesson chunk ${chunkCount}`, JSON.stringify(error, null, 2));
             throw new Error(`Lessons Insert Failed: ${error.message}`);
         }
      }
    } else {
      console.log('.. Lessons already exist, skipping insert.');
    }

    // Re-fetch ALL lessons to create map for words
    const { data: allLessons, error: refetchLessonsError } = await supabase
        .from('lessons')
        .select('id, unit_id, lesson_number');
        
    if (refetchLessonsError) throw refetchLessonsError;

    // Map: UnitUUID-LessonNumber -> LessonUUID
    const lessonIdMap = new Map<string, string>();
    allLessons?.forEach(l => {
      lessonIdMap.set(`${l.unit_id}-${l.lesson_number}`, l.id);
    });

    // ---------------------------------------------------------
    // 3. INSERT WORDS (Idempotent Check)
    // ---------------------------------------------------------
    console.log('.. Preparing words');
    
    // Fetch existing words (lightweight check using just IDs/LessonIDs)
    // Note: Checking ALL words might be heavy if DB grows huge, but fine for <10k rows
    const { data: existingWords, error: fetchWordsError } = await supabase
        .from('vocabulary_words')
        .select('lesson_id, word');
        
    if (fetchWordsError) throw new Error(`Failed to fetch words: ${fetchWordsError.message}`);

    const existingWordKeys = new Set(
        existingWords?.map(w => `${w.lesson_id}-${w.word}`) || []
    );

    const wordsPayload: any[] = [];

    mockUnits.forEach(u => {
      const uUUID = unitIdMap.get(u.id);
      if (!uUUID) return;

      u.lessons.forEach(l => {
        if (l.type === 'test') return;

        const lUUID = lessonIdMap.get(`${uUUID}-${l.lessonNumber}`);
        if (!lUUID) return;

        const globalWordIndex = ((u.id - 1) * 10) + (l.lessonNumber - 1);
        
        let wordData;
        if (globalWordIndex < SEED_VOCABULARY.length) {
            wordData = SEED_VOCABULARY[globalWordIndex];
        } else {
             wordData = {
                word: `Word-${globalWordIndex + 1}`,
                definition: `Definition for word ${globalWordIndex + 1}`,
                part_of_speech: 'noun',
                example_sentence: `This is an example sentence for Word-${globalWordIndex + 1}.`,
                synonyms: [],
                difficulty_level: 1
            };
        }

        // Skip if word already exists in this lesson
        if (existingWordKeys.has(`${lUUID}-${wordData.word}`)) return;

        wordsPayload.push({
            lesson_id: lUUID,
            word: wordData.word,
            definition: wordData.definition,
            part_of_speech: wordData.part_of_speech,
            example_sentence: wordData.example_sentence,
            synonyms: wordData.synonyms || [],
            difficulty_level: wordData.difficulty_level || 1
        });
      });
    });

    if (wordsPayload.length > 0) {
        console.log(`.. Inserting ${wordsPayload.length} new words`);
        const wordChunks = chunkArray(wordsPayload, 50);
        
        let wordChunkCount = 0;
        for (const chunk of wordChunks) {
          wordChunkCount++;
          const { error } = await supabase.from('vocabulary_words').insert(chunk);
          if (error) {
              console.error(`Failed at word chunk ${wordChunkCount}`, JSON.stringify(error, null, 2));
              throw new Error(`Words Insert Failed: ${error.message}`);
          }
        }
    } else {
        console.log('.. Words already exist, skipping insert.');
    }

    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error: any) {
    const errorDetails = error.message ? error.message : JSON.stringify(error, null, 2);
    console.error('❌ Seeding Failed:', errorDetails);
  }
};