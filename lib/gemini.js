import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AVAILABLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-3-flash-preview"
];

export async function generateFormJson(userPrompt, questionCount = 10) {
  // Read System Prompt from file
  const promptPath = path.join(process.cwd(), 'lib', 'system_prompt.txt');
  let systemInstruction = fs.readFileSync(promptPath, 'utf-8');

  // Inject Question Count
  systemInstruction = systemInstruction.replace('{{QUESTION_COUNT}}', questionCount.toString());

  const prompt = `User Request: "${userPrompt}"`;

  for (const modelName of AVAILABLE_MODELS) {
    console.log(`Trying model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error.message);
      // Continue to next model
    }
  }

  throw new Error("All available models failed to generate content.");
}
