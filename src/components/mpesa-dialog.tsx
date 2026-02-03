'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface MpesaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

export default function MpesaDialog({ isOpen, onClose, amount, onSuccess }: MpesaDialogProps) {
  const [paymentState, setPaymentState] = useState<'processing' | 'success'>('processing');

  useEffect(() => {
    if (isOpen) {
      setPaymentState('processing');
      const timer = setTimeout(() => {
        setPaymentState('success');
      }, 4000); // Simulate 4 second delay

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Image src="/mpesa-logo.png" alt="MPESA" width={80} height={25} />
          </DialogTitle>
          <DialogDescription className="text-center">
            Simulated MPESA STK Push
          </DialogDescription>
        </DialogHeader>
        
        {paymentState === 'processing' && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-semibold">Processing MPESA payment...</p>
            <p className="text-center text-muted-foreground text-sm">
              A pop-up has been sent to your phone. Please enter your MPESA PIN to complete the payment of <span className="font-bold">{formatCurrency(amount)}</span>.
            </p>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-2xl font-semibold">Payment Confirmed!</p>
            <p className="text-center text-muted-foreground text-sm">
              Your payment of <span className="font-bold">{formatCurrency(amount)}</span> has been successfully received.
            </p>
          </div>
        )}

        <DialogFooter>
          {paymentState === 'success' ? (
            <Button onClick={handleSuccess} className="w-full">
              Complete Order
            </Button>
          ) : (
            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
