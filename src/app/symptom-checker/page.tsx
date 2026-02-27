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
import { Loader2, Sparkles, Lightbulb, AlertTriangle, Stethoscope, Pill, Heart, ShieldAlert } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { aiSymptomChecker, type SymptomRecommendation } from '@/ai/flows/ai-symptom-checker';
import { ProtectedRoute } from '@/components/protected-route';

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe your symptoms in at least 10 characters.',
  }),
});

function SymptomCheckerPageContent() {
  const [recommendations, setRecommendations] = useState('');
  const [structured, setStructured] = useState<SymptomRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations('');
    setStructured(null);
    setHasError(false);
    try {
      const result = await aiSymptomChecker(values);

      if (!result.recommendations && !result.structured) {
        setHasError(true);
        setRecommendations('The AI returned no data. Please try again.');
      } else if (result.recommendations.startsWith('AI Error:')) {
        setHasError(true);
        setRecommendations(result.recommendations);
      } else {
        setRecommendations(result.recommendations);
        setStructured(result.structured);
      }
    } catch (error: any) {
      setHasError(true);
      setRecommendations('We could not process your request. Please try again.');
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

              {(recommendations || hasError) && (
                <div className="mt-8 space-y-4">
                  {hasError ? (
                    <div className="p-6 rounded-lg border bg-destructive/10 border-destructive/20">
                      <h3 className="text-lg font-semibold flex items-center font-headline text-destructive">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Unable to Process
                      </h3>
                      <p className="mt-2 text-foreground/80">{recommendations}</p>
                    </div>
                  ) : structured ? (
                    <>
                      <h3 className="text-lg font-semibold flex items-center font-headline">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        AI Assessment & Recommendations
                      </h3>

                      {/* Condition */}
                      {structured.condition && (
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-sm">Possible Condition</h4>
                          </div>
                          <p className={`text-sm leading-relaxed ${
                            structured.condition.toUpperCase().includes('EMERGENCY')
                              ? 'text-destructive font-semibold'
                              : 'text-foreground/80'
                          }`}>
                            {structured.condition}
                          </p>
                        </div>
                      )}

                      {/* Medicines */}
                      {structured.medicines && structured.medicines.length > 0 && (
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-3">
                            <Pill className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-sm">Recommended Medicines</h4>
                          </div>
                          <ul className="space-y-2">
                            {structured.medicines.map((med, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{med}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Advice */}
                      {structured.advice && (
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-sm">General Advice</h4>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80">{structured.advice}</p>
                        </div>
                      )}

                      {/* Warning / Disclaimer */}
                      {structured.warning && (
                        <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                            <h4 className="font-semibold text-sm text-amber-700">Important</h4>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80">{structured.warning}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback for non-structured plain text response */
                    <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
                      <h3 className="text-lg font-semibold flex items-center font-headline">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        AI Assessment & Recommendations
                      </h3>
                      <div className="mt-4 text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                        {recommendations}
                      </div>
                    </div>
                  )}

                  {!hasError && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground text-center">
                        This assessment was generated by AI and should not replace professional medical advice.
                        Always consult a qualified healthcare provider for diagnosis and treatment.
                      </p>
                    </div>
                  )}
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

export default function SymptomCheckerPage() {
  return (
    <ProtectedRoute>
      <SymptomCheckerPageContent />
    </ProtectedRoute>
  );
}
