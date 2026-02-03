'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Pill } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images.json';
import type { Medicine } from '@/lib/types';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { addCartItem } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';

const mockMedicines: Medicine[] = placeholderImages.map((img, index) => ({
  id: img.id,
  name: img.description,
  description: 'A brief description of the medicine, its uses, and main ingredients goes here.',
  price: parseFloat((Math.random() * 50 + 5).toFixed(2)) * 100, // Price in KES
  stock: Math.floor(Math.random() * 100),
  imageUrl: img.imageUrl,
  category: ['Pain Relief', 'Vitamins', 'Allergy', 'Cold & Flu'][index % 4],
}));

const categories = ['All Categories', 'Pain Relief', 'Vitamins', 'Allergy', 'Cold & Flu'];

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const filteredMedicines = mockMedicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'All Categories' || med.category === selectedCategory)
  );
  
  const handleAddToCart = async (med: Medicine) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      await addCartItem(db, user.uid, {
        medicineId: med.id,
        name: med.name,
        price: med.price,
        imageUrl: med.imageUrl,
        quantity: 1,
      });
      toast({
        title: "Added to Cart",
        description: `${med.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Could not add item to cart.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Medicines</h1>
            <p className="text-lg text-muted-foreground mt-2">Find the health products you need.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              placeholder="Search for medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((med) => (
              <Card key={med.id} className="flex flex-col">
                <CardHeader>
                  <Image
                    src={med.imageUrl}
                    alt={med.name}
                    width={400}
                    height={300}
                    className="rounded-lg object-cover aspect-[4/3]"
                  />
                </CardHeader>
                <CardContent className="flex-1">
                  <CardTitle className="text-lg font-headline">{med.name}</CardTitle>
                  <CardDescription className="mt-2 text-primary font-semibold text-lg">{formatCurrency(med.price)}</CardDescription>
                  <CardDescription className="mt-1">
                    {med.stock > 0 ? `${med.stock} in stock` : 'Out of stock'}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleAddToCart(med)} disabled={med.stock === 0}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {med.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredMedicines.length === 0 && (
            <div className="text-center py-20">
                <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Medicines Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filter.
                </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
