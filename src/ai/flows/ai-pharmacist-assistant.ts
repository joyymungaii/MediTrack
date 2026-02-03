'use server';

/**
 * @fileOverview An AI-assisted tool for pharmacists to suggest medicines based on entered symptoms.
 *
 * - aiPharmacistAssistant - A function that suggests medicines based on symptoms.
 * - AiPharmacistAssistantInput - The input type for the aiPharmacistAssistant function.
 * - AiPharmacistAssistantOutput - The return type for the aiPharmacistAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPharmacistAssistantInputSchema = z.object({
  symptoms: z
    .string()
    .describe('The symptoms entered by the pharmacist.'),
});
export type AiPharmacistAssistantInput = z.infer<typeof AiPharmacistAssistantInputSchema>;

const AiPharmacistAssistantOutputSchema = z.object({
  suggestedMedicines: z
    .string()
    .describe('A list of suggested medicines based on the symptoms.'),
});
export type AiPharmacistAssistantOutput = z.infer<typeof AiPharmacistAssistantOutputSchema>;

export async function aiPharmacistAssistant(input: AiPharmacistAssistantInput): Promise<AiPharmacistAssistantOutput> {
  return aiPharmacistAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPharmacistAssistantPrompt',
  input: {schema: AiPharmacistAssistantInputSchema},
  output: {schema: AiPharmacistAssistantOutputSchema},
  prompt: `You are an AI assistant for pharmacists. Based on the symptoms entered by the pharmacist, suggest a list of medicines.

Symptoms: {{{symptoms}}}

Suggested Medicines:`,
});

const aiPharmacistAssistantFlow = ai.defineFlow(
  {
    name: 'aiPharmacistAssistantFlow',
    inputSchema: AiPharmacistAssistantInputSchema,
    outputSchema: AiPharmacistAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
