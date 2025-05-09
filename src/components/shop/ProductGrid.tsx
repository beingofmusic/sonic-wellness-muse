
import React from 'react';
import { Product } from '@/types/shop';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  isLoading: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onSelectProduct, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-card/50 rounded-xl h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70">No products found</h3>
        <p className="mt-2 text-white/50">Try selecting a different category or check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
