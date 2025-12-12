import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyWord, Exercise } from "../types";

// Lazy initialization to prevent top-level crash
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    let apiKey = '';
    try {
      if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || '';
      }
    } catch (e) {
      console.warn("Failed to access process.env.API_KEY");
    }

    if (!apiKey) {
      console.warn("Google API Key missing. AI features will be disabled.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export async function generateAIQuiz(words: VocabularyWord[]): Promise<Exercise[]> {
  const client = getAI();
  if (!client) return [];

  const wordsList = words.map(w => `${w.word}: ${w.definition} (${w.part_of_speech})`).join('\n');

  const prompt = `
    Here is the list of vocabulary words:
    ${wordsList}

    Generate 10 multiple-choice questions. 
  `;

  const systemInstruction = `You are an expert language tutor. I will provide a list of vocabulary words. You must generate exactly 10 multiple-choice questions based on these words. 
  
  Rules: 
  1. Do NOT ask grammatical classification questions (e.g., Is this a noun or verb?). 
  2. Focus on fill-in-the-blank sentences and matching words to real-life scenarios. 
  3. Even if the word list is short, create multiple unique scenarios for each word to reach the total of 10 questions. 
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word_text: {
                type: Type.STRING,
                description: 'The word being tested.'
              },
              question: {
                type: Type.STRING,
                description: 'The question text or sentence with blank.'
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'List of 4 options.'
              },
              correct_answer: {
                type: Type.STRING,
                description: 'The correct option text.'
              },
            },
            required: ["word_text", "question", "options", "correct_answer"],
          },
        },
      }
    });

    let jsonText = response.text || '[]';
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    const rawData = JSON.parse(jsonText);
    
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