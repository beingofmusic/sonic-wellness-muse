
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ itemCount, onClick }) => {
  return (
    <Button 
      variant="outline" 
      onClick={onClick} 
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
