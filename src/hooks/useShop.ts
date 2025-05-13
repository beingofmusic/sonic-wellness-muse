
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProducts,
  fetchProductsByCategory,
  fetchProductCategories,
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder
} from '@/services/shopService';
import { Product, CartItem } from '@/types/shop';

export const useShop = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load products and categories on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await fetchProductCategories();
        setCategories(categoriesData);

        const productsData = await fetchProducts();
        setProducts(productsData);

        if (user) {
          const cartData = await fetchCart();
          setCartItems(cartData);
        }
      } catch (error) {
        console.error("Failed to load shop data:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Filter products by category
  useEffect(() => {
    const filterProducts = async () => {
      setIsLoading(true);
      try {
        if (selectedCategory) {
          const filteredProducts = await fetchProductsByCategory(selectedCategory);
          setProducts(filteredProducts);
        } else {
          const allProducts = await fetchProducts();
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Failed to filter products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    filterProducts();
  }, [selectedCategory]);

  // Cart management functions
  const addItemToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addToCart(productId, quantity);
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
      setIsCartOpen(true);
      
      toast({
        title: "Item Added",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem(itemId, quantity);
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeItemFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      const updatedCart = await fetchCart();
      setCartItems(updatedCart);
      
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearCartItems = async () => {
    try {
      await clearCart();
      setCartItems([]);
      
      toast({
        title: "Cart Cleared",
        description: "Your cart has been cleared.",
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to checkout.",
        variant: "destructive",
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Processing Checkout",
        description: "You'll be redirected to our secure payment page...",
      });
      
      await createOrder(cartItems);
      // Note: The redirect to Stripe happens in createOrder, 
      // so we don't need to handle success here
    } catch (error) {
      console.error("Failed to checkout:", error);
      toast({
        title: "Checkout Failed",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
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
    clearCart: clearCartItems,
    checkout
  };
};
