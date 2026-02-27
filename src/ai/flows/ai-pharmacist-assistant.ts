'use server';

/**
 * @fileOverview An AI-assisted tool for pharmacists to suggest medicines based on entered symptoms.
 *
 * Technology: Vercel AI SDK 6 with @ai-sdk/google (direct Google Gemini API, free tier).
 * Env: Requires GOOGLE_GENERATIVE_AI_API_KEY
 *
 * - aiPharmacistAssistant - A server action that suggests medicines based on symptoms.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface AiPharmacistAssistantInput {
  symptoms: string;
}

export interface AiPharmacistAssistantOutput {
  suggestedMedicines: string;
}

const model = google('gemini-2.5-flash');

export async function aiPharmacistAssistant(input: AiPharmacistAssistantInput): Promise<AiPharmacistAssistantOutput> {
  const { text } = await generateText({
    model,
    system: `You are an expert AI pharmacy assistant for MediTrack.
You are assisting a licensed pharmacist with medicine suggestions.

Important rules:
- Provide detailed, professional-grade medicine suggestions.
- Include generic names and common brand names available in Kenya.
- Include dosage information, contraindications, and potential drug interactions.
- Suggest alternatives when appropriate.
- Format your response with clear sections for each recommended medicine.
- Be thorough but organized.`,
    prompt: `A pharmacist needs medicine suggestions for a patient with these symptoms:\n\n${input.symptoms}\n\nProvide your professional recommendations:`,
    maxOutputTokens: 1500,
    temperature: 0.3,
  });

  return { suggestedMedicines: text };
}
