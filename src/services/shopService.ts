
import { supabase } from "@/integrations/supabase/client";
import { Product, CartItem, Order, OrderItem } from "@/types/shop";

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("name");
    
    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error);
    return [];
  }
};

export const fetchProductCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .order("category");
    
    if (error) throw error;
    
    // Extract unique categories
    const categories = new Set(data.map(item => item.category));
    return Array.from(categories);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
};

// Admin functions
export const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding product:", error);
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

// Cart functions
export const fetchCart = async (): Promise<CartItem[]> => {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products(*)
      `);
    
    if (error) throw error;
    return data as CartItem[];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItem | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    // Check if item already exists in cart
    const { data: existingItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("product_id", productId)
      .maybeSingle();
    
    if (existingItems) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItems.quantity + quantity })
        .eq("id", existingItems.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Add new item if it doesn't exist
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: userData.user.id,
          product_id: productId,
          quantity
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<CartItem | null> => {
  try {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return null;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return null;
  }
};

export const removeFromCart = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
};

export const clearCart = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userData.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
};

// Order functions (MVP, to be expanded with Stripe)
export const createOrder = async (cartItems: CartItem[]): Promise<Order | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;
    
    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userData.user.id,
        total_amount: totalAmount,
        status: 'pending' as const // Explicitly set as a literal type
      })
      .select()
      .single();
    
    if (orderError) throw orderError;

    // Insert order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product?.price || 0
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    
    if (itemsError) throw itemsError;

    // Clear cart after successful order
    await clearCart();

    // Type assertion to ensure compatibility with Order type
    return {
      ...order,
      status: order.status as "pending" | "completed" | "cancelled",
      items: []
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};
