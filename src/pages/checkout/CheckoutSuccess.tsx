
import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShop } from "@/hooks/useShop";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useShop();

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
    
    toast({
      title: "Payment Successful!",
      description: "Thank you for your purchase.",
      variant: "default", // Changed from "success" to "default"
    });
  }, [clearCart, toast]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
        <div className="rounded-full bg-green-100/10 p-6 mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        
        <p className="text-white/70 mb-8">
          Your order has been successfully placed. We'll send you an email with your order details and tracking information once your items have been shipped.
        </p>
        
        <div className="flex gap-4">
          <Button 
            className="gap-2" 
            variant="default" 
            onClick={() => navigate("/shop")}
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
