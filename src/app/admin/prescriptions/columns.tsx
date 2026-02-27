'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { updatePrescriptionStatus } from '@/lib/firestore';
import { toast } from '@/hooks/use-toast';

const statusStyles = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
};

function PrescriptionActions({ prescription }: { prescription: Prescription }) {
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; status: 'approved' | 'rejected' }>({
    open: false,
    status: 'approved',
  });
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSubmitReview = async () => {
    try {
      await updatePrescriptionStatus(db, prescription.id, reviewDialog.status, reviewNotes);
      toast({
        title: `Prescription ${reviewDialog.status}`,
        description: `The prescription has been marked as ${reviewDialog.status}.`,
      });
      setReviewDialog({ open: false, status: 'approved' });
      setReviewNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prescription status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
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
            onSelect={() => {
              setReviewNotes('');
              setReviewDialog({ open: true, status: 'approved' });
            }}
            disabled={prescription.status === 'approved'}
          >
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setReviewNotes('');
              setReviewDialog({ open: true, status: 'rejected' });
            }}
            disabled={prescription.status === 'rejected'}
          >
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.status === 'approved' ? 'Approve' : 'Reject'} Prescription
            </DialogTitle>
            <DialogDescription>
              {'Add review notes for '}
              <span className="font-medium">{prescription.patientName}</span>
              {"'s prescription."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-notes">Review Notes (optional)</Label>
            <Textarea
              id="review-notes"
              placeholder={
                reviewDialog.status === 'approved'
                  ? 'e.g., Prescription verified. Medicines can be dispensed.'
                  : 'e.g., Prescription image is unclear. Please re-upload.'
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant={reviewDialog.status === 'approved' ? 'default' : 'destructive'}
            >
              Confirm {reviewDialog.status === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
      const date = (row.getValue('uploadedAt') as any)?.toDate?.();
      return <span>{date ? date.toLocaleDateString() : 'N/A'}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <PrescriptionActions prescription={row.original} />,
  },
];
