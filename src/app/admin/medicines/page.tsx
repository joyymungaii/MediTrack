import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Medicine } from "@/lib/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// This would be fetched from Firestore in a real app
const mockMedicines: Medicine[] = [
  { id: "MED001", name: "Paracetamol 500mg", stock: 150, price: 599, category: "Pain Relief", imageUrl: "", description: "" },
  { id: "MED002", name: "Ibuprofen 200mg", stock: 80, price: 850, category: "Pain Relief", imageUrl: "", description: "" },
  { id: "MED003", name: "Vitamin C 1000mg", stock: 200, price: 1200, category: "Vitamins", imageUrl: "", description: "" },
  { id: "MED004", name: "Loratadine 10mg", stock: 50, price: 1575, category: "Allergy", imageUrl: "", description: "" },
  { id: "MED005", name: "Cough Syrup", stock: 30, price: 925, category: "Cold & Flu", imageUrl: "", description: "" },
  { id: "MED006", name: "Amoxicillin 250mg", stock: 0, price: 2250, category: "Antibiotics", imageUrl: "", description: "" },
];

export default function ManageMedicinesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Manage Medicines</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>
      <DataTable columns={columns} data={mockMedicines} filterColumn="name" filterPlaceholder="Filter by name..." />
    </div>
  );
}
