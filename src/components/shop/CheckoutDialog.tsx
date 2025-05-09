
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ isOpen, onClose, onConfirm, total }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Your Order</AlertDialogTitle>
          <AlertDialogDescription>
            Thank you for shopping with Being of Music! This is a demonstration checkout.
            In the future, this will connect to Stripe for payment processing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="flex justify-between py-2">
            <span>Order Total:</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-white/70 mt-2">
            By clicking confirm, your order will be processed and your cart will be cleared.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CheckoutDialog;
