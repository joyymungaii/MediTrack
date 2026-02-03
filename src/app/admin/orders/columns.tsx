"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { FirestorePermissionError } from "@/firebase/errors"
import { errorEmitter } from "@/firebase/error-emitter"
import { OrderDetailsDialog } from "@/components/order-details-dialog"
import { useState } from "react"

const statusStyles = {
    'Pending': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    'Paid': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Processing': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'Shipped': 'bg-green-500/20 text-green-700 border-green-500/30',
    'Delivered': 'bg-primary/20 text-primary border-primary/30',
    'Cancelled': 'bg-gray-500/20 text-gray-700 border-gray-500/30',
}

const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        toast({
            title: "Status Updated",
            description: `Order #${orderId.substring(0,6)} marked as ${newStatus}.`,
        });
    } catch (error) {
        console.error("Error updating status:", error);
         const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus },
        });
        errorEmitter.emit('permission-error', permissionError);
    }
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({row}) => <div className="font-mono text-sm">{row.getValue("id")?.substring(0, 6)}...</div>
  },
  {
    accessorKey: "shippingAddress.fullName",
    header: "Customer",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusStyles
        return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status}</Badge>
    }
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
        const timestamp = row.getValue("createdAt") as any;
        // Firestore timestamp can be null on client before sync
        if (!timestamp) return '...';
        const date = timestamp.toDate();
        return <span>{date.toLocaleDateString()}</span>
    }
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const order = row.original;
      const [isDetailsOpen, setIsDetailsOpen] = useState(false);

      const statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

      return (
        <>
            <OrderDetailsDialog order={order} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
                    View Details
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             {statuses.map(status => (
                                <DropdownMenuItem 
                                    key={status} 
                                    disabled={order.status === status}
                                    onSelect={() => handleStatusUpdate(order.id!, status)}>
                                    {status}
                                </DropdownMenuItem>
                             ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
            </DropdownMenu>
        </>
      )
    },
  },
]
