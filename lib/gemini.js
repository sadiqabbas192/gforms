import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateFormJson(userPrompt, questionCount = 10) {
  try {
    // Read System Prompt from file
    const promptPath = path.join(process.cwd(), 'lib', 'system_prompt.txt');
    let systemInstruction = fs.readFileSync(promptPath, 'utf-8');

    // Inject Question Count
    systemInstruction = systemInstruction.replace('{{QUESTION_COUNT}}', questionCount.toString());

    // Use the requested model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `User Request: "${userPrompt}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate form data from Gemini.");
  }
}
