'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from './ui/separator';

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function OrderDetailsDialog({ order, isOpen, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order ID: {order.id?.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="text-sm">
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">{order.shippingAddress?.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                <p className="text-muted-foreground">{order.shippingAddress?.address}</p>
            </div>
             <Separator />
            <div className="text-sm">
                <p className="font-medium">Order Items</p>
                <ul className="text-muted-foreground list-disc pl-5 mt-1 space-y-1">
                    {order.items.map((item, index) => (
                        <li key={index}>
                            {item.name} (x{item.quantity}) - {formatCurrency(item.price * item.quantity)}
                        </li>
                    ))}
                </ul>
            </div>
            <Separator />
             <div className="text-sm space-y-2">
                <div className="flex justify-between">
                    <p className="font-medium">Status</p>
                    <p className="text-muted-foreground capitalize">{order.status}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="font-medium">Payment</p>
                    <p className="text-muted-foreground">{order.paymentMethod}</p>
                </div>
                 <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatCurrency(order.total)}</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
