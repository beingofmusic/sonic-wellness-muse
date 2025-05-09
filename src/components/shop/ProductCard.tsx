
import React from 'react';
import { Product } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock_count <= 0;
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-all hover:scale-105"
        />
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2"
        >
          {product.category}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        <p className="font-semibold text-white">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(product.id)}
          disabled={isOutOfStock}
          className="w-full"
          variant={isOutOfStock ? "outline" : "default"}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
