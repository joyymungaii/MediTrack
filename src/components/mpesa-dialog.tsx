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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MpesaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

export default function MpesaDialog({ isOpen, onClose, amount, onSuccess }: MpesaDialogProps) {
  const [paymentState, setPaymentState] = useState<'input' | 'processing' | 'success'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentState('input');
      setPhoneNumber('');
      setPhoneError('');
    }
  }, [isOpen]);

  const validatePhone = (phone: string) => {
    // Kenyan phone number: starts with 07, 01, or 254
    const cleaned = phone.replace(/\s+/g, '');
    return /^(07|01|2547|2541)\d{8}$/.test(cleaned) || /^254\d{9}$/.test(cleaned);
  };

  const handleSendSTK = () => {
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Enter a valid Kenyan phone number (e.g. 0712345678)');
      return;
    }
    setPhoneError('');
    setPaymentState('processing');

    // Simulate STK push delay
    setTimeout(() => {
      setPaymentState('success');
    }, 4000);
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const maskedPhone = phoneNumber
    ? phoneNumber.slice(0, 4) + '****' + phoneNumber.slice(-2)
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#4CAF50]/10">
              <Phone className="h-5 w-5 text-[#4CAF50]" />
            </div>
            <span className="text-xl font-bold text-[#4CAF50]">M-PESA</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            {paymentState === 'input' ? 'Enter your phone number to pay' : 'Simulated STK Push'}
          </DialogDescription>
        </DialogHeader>

        {paymentState === 'input' && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(amount)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">M-PESA Phone Number</Label>
              <Input
                id="mpesa-phone"
                placeholder="e.g. 0712345678"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                className={phoneError ? 'border-destructive' : ''}
              />
              {phoneError && (
                <p className="text-xs text-destructive">{phoneError}</p>
              )}
            </div>
          </div>
        )}

        {paymentState === 'processing' && (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#4CAF50]" />
            <p className="font-semibold">Sending STK Push...</p>
            <p className="text-center text-muted-foreground text-sm">
              {'A payment prompt has been sent to '}
              <span className="font-bold">{maskedPhone}</span>
              {'. Enter your M-PESA PIN to complete the payment of '}
              <span className="font-bold">{formatCurrency(amount)}</span>.
            </p>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#4CAF50]/10">
              <CheckCircle className="h-10 w-10 text-[#4CAF50]" />
            </div>
            <p className="text-2xl font-semibold">Payment Confirmed!</p>
            <p className="text-center text-muted-foreground text-sm">
              {'Your payment of '}
              <span className="font-bold">{formatCurrency(amount)}</span>
              {' via M-PESA ('}
              {maskedPhone}
              {') has been received.'}
            </p>
          </div>
        )}

        <DialogFooter>
          {paymentState === 'input' && (
            <div className="flex gap-2 w-full">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendSTK} className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white">
                Pay Now
              </Button>
            </div>
          )}
          {paymentState === 'processing' && (
            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
          {paymentState === 'success' && (
            <Button onClick={handleSuccess} className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white">
              Complete Order
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
