import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Pill } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { formatCurrency } from '@/lib/utils';

const featuredMedicines = placeholderImages.slice(0, 4);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Your Health, Our Priority: MediTrack Pro
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    Seamlessly manage your pharmacy needs with our comprehensive platform. From prescription uploads to AI-powered advice, we've got you covered.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/medicines">
                      Browse Medicines
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/symptom-checker">
                      AI Symptom Checker
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/pharmacy/1200/800"
                data-ai-hint="pharmacy interior"
                width={1200}
                height={800}
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="mission" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Accessible Healthcare for Everyone</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We are committed to leveraging technology to make healthcare more accessible, affordable, and understandable. Our platform connects you with the medications you need while providing tools to help you take control of your health.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="featured" className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="space-y-4 mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Featured Medicines</h2>
              <p className="max-w-[600px] mx-auto text-foreground/80 md:text-xl">
                Check out some of our most popular over-the-counter products.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredMedicines.map((med) => (
                <Card key={med.id} className="flex flex-col">
                  <CardHeader>
                    <Image
                      src={med.imageUrl}
                      alt={med.description}
                      data-ai-hint={med.imageHint}
                      width={400}
                      height={300}
                      className="rounded-lg object-cover aspect-[4/3]"
                    />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardTitle className="text-lg font-headline">{med.description}</CardTitle>
                    <CardDescription className="mt-2">
                      {formatCurrency(parseFloat((Math.random() * 50 + 5).toFixed(2)) * 100)}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/medicines">
                        <Pill className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
