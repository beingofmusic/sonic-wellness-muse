
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/context/AuthContext";
import CategoryFilter from "@/components/shop/CategoryFilter";
import ProductGrid from "@/components/shop/ProductGrid";
import CartButton from "@/components/shop/CartButton";
import CartDrawer from "@/components/shop/CartDrawer";
import CheckoutDialog from "@/components/shop/CheckoutDialog";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import ProductsManagement from "@/components/shop/admin/ProductsManagement";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/types/shop";
import { useSearchParams } from "react-router-dom";

const Shop: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchParams] = useSearchParams();
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    cartItems,
    cartTotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    isLoading,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    checkout
  } = useShop();

  // Check URL parameters to see if we should show admin panel
  useEffect(() => {
    const adminParam = searchParams.get('admin');
    if (adminParam === 'true' && isAdmin) {
      setShowAdmin(true);
    }
  }, [searchParams, isAdmin]);

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  const processOrder = () => {
    checkout();
    setCheckoutOpen(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Music Shop</h1>
            <p className="text-white/70 mb-4">
              Browse and purchase musical merchandise and resources.
            </p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                variant={showAdmin ? "default" : "outline"}
                onClick={() => setShowAdmin(!showAdmin)}
              >
                {showAdmin ? "View Shop" : "Manage Products"}
              </Button>
            )}
            {!showAdmin && (
              <CartButton 
                itemCount={cartItemCount} 
                onClick={() => setIsCartOpen(true)} 
              />
            )}
          </div>
        </div>

        {showAdmin && isAdmin ? (
          <ProductsManagement />
        ) : (
          <>
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {products.length === 0 && !isLoading ? (
              <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-white/30 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Products Available</h2>
                <p className="text-white/70">
                  There are currently no products in this category. Check back later!
                </p>
              </div>
            ) : (
              <ProductGrid 
                products={products} 
                onAddToCart={addItemToCart} 
                onSelectProduct={handleSelectProduct}
                isLoading={isLoading} 
              />
            )}
          </>
        )}

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          cartTotal={cartTotal}
          onUpdateQuantity={updateItemQuantity}
          onRemoveItem={removeItemFromCart}
          onCheckout={handleCheckout}
        />

        <CheckoutDialog
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={processOrder}
          total={cartTotal}
        />

        <ProductDetailModal
          product={selectedProduct}
          isOpen={selectedProduct !== null}
          onClose={handleCloseProductDetail}
          onAddToCart={addItemToCart}
        />
      </div>
    </Layout>
  );
};

export default Shop;
