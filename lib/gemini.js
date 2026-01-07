import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateFormJson(userPrompt, questionCount = 10) {
  const maxRetries = 3;
  let attempt = 0;

  // Read System Prompt from file
  const promptPath = path.join(process.cwd(), 'lib', 'system_prompt.txt');
  let systemInstruction = fs.readFileSync(promptPath, 'utf-8');

  // Inject Question Count
  systemInstruction = systemInstruction.replace('{{QUESTION_COUNT}}', questionCount.toString());

  // Use the requested model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    systemInstruction: systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `User Request: "${userPrompt}"`;

  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      attempt++;
      console.error(`Gemini Generation Error (Attempt ${attempt}/${maxRetries}):`, error);

      if (attempt >= maxRetries) {
        throw new Error("Failed to generate form data from Gemini after multiple attempts. The model may be overloaded.");
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
