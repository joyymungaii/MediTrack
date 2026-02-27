'use server';
/**
 * @fileOverview An AI symptom checker that recommends wellness products based on user-described feelings.
 *
 * Technology: Vercel AI SDK 6 with @ai-sdk/google (direct Google Gemini API, free tier).
 * Env: Requires GOOGLE_GENERATIVE_AI_API_KEY
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface AISymptomCheckerInput {
  symptoms: string;
}

export interface SymptomRecommendation {
  condition: string;
  medicines: string[];
  advice: string;
  warning: string;
}

export interface AISymptomCheckerOutput {
  recommendations: string;
  structured: SymptomRecommendation | null;
}

const model = google('gemini-2.5-flash');

export async function aiSymptomChecker(input: AISymptomCheckerInput): Promise<AISymptomCheckerOutput> {
  if (!input.symptoms || input.symptoms.trim().length === 0) {
    return { recommendations: 'Please enter your symptoms.', structured: null };
  }

  try {
    const result = await generateText({
      model,
      prompt: `You are a helpful wellness assistant for a pharmacy in Kenya called MediTrack. A customer describes how they are feeling. Suggest helpful over-the-counter products they can buy.

The customer says: "${input.symptoms}"

Respond with a JSON object in this format (no markdown fences, just raw JSON):
{
  "condition": "What this might be, in simple terms",
  "medicines": ["Product 1 - what it helps with - how to use it", "Product 2 - what it helps with - how to use it"],
  "advice": "Simple self-care tips",
  "warning": "When they should see a doctor. End with: This is general guidance only, not medical advice."
}

Always suggest 2-4 products. Keep it helpful and concise.`,
      maxOutputTokens: 1000,
      temperature: 0.4,
    });

    const text = result.text;

    if (!text || text.trim().length === 0) {
      return {
        recommendations: 'The AI returned an empty response. Please try rephrasing your symptoms.',
        structured: null,
      };
    }

    // Try to parse structured JSON
    try {
      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed: SymptomRecommendation = JSON.parse(cleanedText);

      return {
        recommendations: formatStructuredResponse(parsed),
        structured: parsed,
      };
    } catch {
      // If JSON parsing fails, return the raw text as-is
      return {
        recommendations: text,
        structured: null,
      };
    }
  } catch (error: any) {
    return {
      recommendations: `AI Error: ${error?.message || 'Unknown error'}. Please try again.`,
      structured: null,
    };
  }
}

function formatStructuredResponse(data: SymptomRecommendation): string {
  const sections: string[] = [];

  if (data.condition) {
    sections.push(`POSSIBLE CONDITION\n${data.condition}`);
  }

  if (data.medicines && data.medicines.length > 0) {
    const meds = data.medicines.map((m, i) => `  ${i + 1}. ${m}`).join('\n');
    sections.push(`RECOMMENDED PRODUCTS\n${meds}`);
  }

  if (data.advice) {
    sections.push(`ADVICE\n${data.advice}`);
  }

  if (data.warning) {
    sections.push(`IMPORTANT\n${data.warning}`);
  }

  return sections.join('\n\n');
}
