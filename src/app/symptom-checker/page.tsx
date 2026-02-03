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
import Header from '@/components/header';
import Footer from '@/components/footer';
import { aiSymptomChecker } from '@/ai/flows/ai-symptom-checker';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe your symptoms in at least 10 characters.',
  }),
});

export default function SymptomCheckerPage() {
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
      const result = await aiSymptomChecker(values);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations('Sorry, we were unable to get recommendations at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="inline-block rounded-lg bg-primary/10 p-3 mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">AI Symptom Checker</CardTitle>
              <CardDescription className="text-lg">
                Describe your symptoms, and our AI will suggest potential over-the-counter medicines.
              </CardDescription>
              <p className="text-xs text-muted-foreground pt-2">
                This is not medical advice. Consult with a healthcare professional for any health concerns.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Your Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., I have a runny nose, a slight headache, and a sore throat..."
                            className="resize-none"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Get Recommendations'
                    )}
                  </Button>
                </form>
              </Form>

              {recommendations && (
                <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center font-headline">
                    <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                    Our Suggestions
                  </h3>
                  <p className="mt-2 text-foreground/90 whitespace-pre-wrap">{recommendations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
