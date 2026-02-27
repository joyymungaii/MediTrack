'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { uploadPrescription } from '@/lib/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedRoute } from '@/components/protected-route';

const formSchema = z.object({
  notes: z.string().optional(),
  file: z.any().refine((file) => file?.size > 0, 'Please select a file to upload.'),
});


function UploadPrescriptionPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });

  const file = form.watch('file');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      form.setValue('file', event.target.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    form.setValue('file', undefined!);
    const fileInput = document.getElementById('prescription-file') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.file || !user) {
      toast({
        title: "Submission Error",
        description: "Please ensure you are logged in and have selected a file.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    const storageRef = ref(storage, `prescriptions/${user.uid}/${Date.now()}_${values.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, values.file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: "There was an error uploading your prescription. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await uploadPrescription(db, user.uid, {
            patientName: user.email?.split('@')[0] || 'Anonymous', // Placeholder name
            email: user.email!,
            prescriptionImageUrl: downloadURL,
            notes: values.notes,
        });
        
        toast({
          title: "Upload Successful",
          description: "Your prescription has been submitted for verification.",
        });
        
        setIsUploading(false);
        form.reset();
        handleRemoveFile();
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="inline-block rounded-lg bg-primary/10 p-3 mx-auto mb-4">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Upload Prescription</CardTitle>
              <CardDescription className="text-lg">
                Submit your prescription for verification to purchase controlled medicines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="e.g., Requesting a refill..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                  <FormField control={form.control} name="file" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Prescription File</FormLabel>
                        <FormControl>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="prescription-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 border-primary/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-10 h-10 mb-3 text-primary/80" />
                                        <p className="mb-2 text-sm text-foreground/80"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <Input id="prescription-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                                </label>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />

                {file && (
                    <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
                        <div className="flex items-center gap-3">
                            <File className="h-6 w-6 text-primary" />
                            <div className="text-sm">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" type="button" onClick={handleRemoveFile}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for Verification'}
                </Button>
              </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function UploadPrescriptionPage() {
  return (
    <ProtectedRoute>
      <UploadPrescriptionPageContent />
    </ProtectedRoute>
  );
}
