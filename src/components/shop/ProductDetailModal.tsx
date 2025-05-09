
import React from 'react';
import { Product } from '@/types/shop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;
  
  const isOutOfStock = product.stock_count <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mt-1">
              {product.category}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-2xl font-bold mb-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-400 mb-4">{product.description}</p>
              
              <div className="mb-6">
                <p className="flex items-center">
                  <span className="mr-2 font-medium">Status:</span> 
                  {isOutOfStock ? (
                    <span className="text-destructive">Out of Stock</span>
                  ) : (
                    <span className="text-green-500">In Stock</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="mt-auto">
              <Button 
                onClick={() => onAddToCart(product.id)}
                disabled={isOutOfStock}
                className="w-full"
                size="lg"
              >
                {isOutOfStock ? (
                  "Check back soon!"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
