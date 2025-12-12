import { GoogleGenAI, SchemaType } from "@google/genai";
import { VocabularyWord, Exercise } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateAIQuiz(words: VocabularyWord[]): Promise<Exercise[]> {
  const wordsList = words.map(w => `${w.word}: ${w.definition} (${w.part_of_speech})`).join('\n');

  const prompt = `
    Here is the list of vocabulary words:
    ${wordsList}

    Generate 10 multiple-choice questions. 
    Constraint: Ensure the output is a JSON array.
  `;

  const systemInstruction = `You are an expert language tutor. I will provide a list of vocabulary words. You must generate exactly 10 multiple-choice questions based on these words. 
  
  Rules: 
  1. Do NOT ask grammatical classification questions (e.g., Is this a noun or verb?). 
  2. Focus on fill-in-the-blank sentences and matching words to real-life scenarios. 
  3. Even if the word list is short, create multiple unique scenarios for each word to reach the total of 10 questions. 
  4. Return the output as a strict JSON array so the app can parse it.
  
  The JSON structure for each item must be:
  {
    "word_text": "the word being tested",
    "question": "The question text or sentence with blank",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": "the correct option text"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Map AI response to our Exercise type
    return rawData.map((item: any, index: number) => {
      // Find the original word object to link it
      const originalWord = words.find(w => w.word.toLowerCase() === item.word_text.toLowerCase()) || words[0];

      return {
        id: `ai-gen-${index}-${Date.now()}`,
        type: 'mcq', // AI generates MCQ style questions
        word: originalWord,
        questionText: item.question,
        options: item.options,
        correctAnswer: item.correct_answer
      };
    });

  } catch (error) {
    console.error("AI Generation failed, falling back to basic:", error);
    return [];
  }
}