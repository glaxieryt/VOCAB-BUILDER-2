import { supabase } from './supabase';
import { generateUnits, SEED_VOCABULARY } from './mockData';
import { VocabularyWord } from '../types';

/**
 * Populates the Supabase database with Units, Lessons, and Words
 * based on the logic in mockData.ts.
 * This runs only if the database is empty.
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding...');
  
  // 1. Generate local structure
  const mockUnits = generateUnits();
  
  try {
    // 2. Insert Units
    for (const unit of mockUnits) {
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .insert({
          title: unit.title,
          sequence_number: unit.id,
          description: 'Master these 10 essential words.'
        })
        .select()
        .single();

      if (unitError) throw unitError;
      if (!unitData) continue;

      const unitDbId = unitData.id;

      // 3. Insert Lessons for this Unit
      for (const lesson of unit.lessons) {
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            unit_id: unitDbId,
            title: lesson.type === 'test' ? 'Unit Test' : `Lesson ${lesson.lessonNumber}`,
            lesson_number: lesson.lessonNumber,
            type: lesson.type
          })
          .select()
          .single();

        if (lessonError) throw lessonError;
        
        // 4. Insert Word (if not a test lesson)
        // Lesson 1-10 introduce 1 word each.
        if (lesson.type !== 'test') {
            const globalWordIndex = ((unit.id - 1) * 10) + (lesson.lessonNumber - 1);
            let wordData: any = {};

            // Use Seed Data if available, otherwise generate procedurally
            if (globalWordIndex < SEED_VOCABULARY.length) {
                wordData = SEED_VOCABULARY[globalWordIndex];
            } else {
                wordData = {
                    word: `Word-${globalWordIndex + 1}`,
                    definition: `Definition for word ${globalWordIndex + 1} (Procedural)`,
                    part_of_speech: globalWordIndex % 2 === 0 ? 'noun' : 'verb',
                    example_sentence: `This is an example sentence for Word-${globalWordIndex + 1}.`,
                    difficulty_level: 1,
                    synonyms: []
                };
            }

            await supabase
              .from('vocabulary_words')
              .insert({
                lesson_id: lessonData.id,
                word: wordData.word,
                definition: wordData.definition,
                part_of_speech: wordData.part_of_speech,
                example_sentence: wordData.example_sentence,
                synonyms: wordData.synonyms || [],
                difficulty_level: wordData.difficulty_level || 1
              });
        }
      }
    }
    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
  }
};