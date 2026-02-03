'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { aiPharmacistAssistant } from '@/ai/flows/ai-pharmacist-assistant';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe symptoms in at least 10 characters.',
  }),
});

export default function AiAssistantPage() {
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations('');
    try {
      const result = await aiPharmacistAssistant(values);
      setRecommendations(result.suggestedMedicines);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setRecommendations('Sorry, we were unable to get suggestions at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">AI-Assisted Recommendation</h1>
        </div>
        <Card className="max-w-3xl">
        <CardHeader>
            <CardTitle>Symptom Analysis</CardTitle>
            <CardDescription>
            Enter patient symptoms to get AI-powered medicine suggestions.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Patient Symptoms</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., Patient reports high fever, persistent dry cough, and body aches..."
                        className="resize-none"
                        rows={5}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                    </>
                ) : (
                    'Get Suggestions'
                )}
                </Button>
            </form>
            </Form>

            {recommendations && (
            <div className="mt-8 p-4 bg-secondary rounded-lg">
                <h3 className="text-lg font-semibold flex items-center font-headline">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                Suggested Medicines
                </h3>
                <p className="mt-2 text-foreground/90 whitespace-pre-wrap">{recommendations}</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
