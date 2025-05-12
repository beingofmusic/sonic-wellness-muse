
import React, { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ isOpen, onClose, onConfirm, total }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Checkout failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Your Order</AlertDialogTitle>
          <AlertDialogDescription>
            You'll be redirected to Stripe's secure checkout to complete your purchase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="flex justify-between py-2">
            <span>Order Total:</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-white/70 mt-2">
            Your payment will be processed securely by Stripe.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <Button 
            disabled={isProcessing} 
            onClick={handleCheckout} 
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CheckoutDialog;
