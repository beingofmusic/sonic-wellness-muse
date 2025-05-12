
import React, { useState } from 'react';
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
import { ShoppingCart, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  
  if (!product) return null;
  
  const isOutOfStock = product.stock_count <= 0;
  
  const toggleImageZoom = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default behavior
    setIsImageZoomed(!isImageZoomed);
  };

  const handleCloseZoom = (e: React.MouseEvent) => {
    // Close the zoom view if clicking the backdrop (not the image)
    if ((e.target as HTMLElement).classList.contains('zoom-backdrop')) {
      setIsImageZoomed(false);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default behavior
    onAddToCart(product.id);
  };

  // Force dialog to close when component unmounts
  React.useEffect(() => {
    return () => {
      // Cleanup function to ensure modal state is reset
      setIsImageZoomed(false);
    };
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            <DialogDescription>
              <Badge variant="secondary" className="mt-1">
                {product.category}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all hover:scale-105"
                onClick={toggleImageZoom}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="bg-black/40 hover:bg-black/60"
                  onClick={toggleImageZoom}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
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
                  onClick={handleAddToCart}
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

      {/* Image Zoom Overlay */}
      {isImageZoomed && product && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 zoom-backdrop"
          onClick={handleCloseZoom}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white z-10"
              onClick={() => setIsImageZoomed(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-contain w-full h-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
            />
            <Button 
              variant="ghost" 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setIsImageZoomed(false)}
            >
              <ZoomOut className="h-5 w-5 mr-2" />
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailModal;
