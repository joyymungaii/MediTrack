'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Prescription } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { updatePrescriptionStatus } from '@/lib/firestore';
import { toast } from '@/hooks/use-toast';

const statusStyles = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
};

const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
  updatePrescriptionStatus(db, id, status);
  toast({
    title: `Prescription ${status}`,
    description: `The prescription has been marked as ${status}.`,
  });
};

export const columns: ColumnDef<Prescription>[] = [
  {
    accessorKey: 'patientName',
    header: 'Patient Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusStyles;
      return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Date Uploaded',
    cell: ({ row }) => {
      const date = row.getValue('uploadedAt')?.toDate();
      return <span>{date ? date.toLocaleDateString() : 'N/A'}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const prescription = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => window.open(prescription.prescriptionImageUrl, '_blank')}>
              View File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-green-600 focus:text-green-700"
              onSelect={() => handleStatusChange(prescription.id, 'approved')}
              disabled={prescription.status === 'approved'}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => handleStatusChange(prescription.id, 'rejected')}
              disabled={prescription.status === 'rejected'}
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
