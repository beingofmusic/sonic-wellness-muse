
import React from 'react';
import { CartItem } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Plus, Minus, Trash } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="mr-2" /> Your Cart
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart className="w-16 h-16 mb-4 text-white/30" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-white/50 mb-4">Add some products to your cart to see them here.</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center border-b border-white/10 pb-4">
                  <div className="w-16 h-16 rounded bg-black/20 mr-4 overflow-hidden flex-shrink-0">
                    {item.product?.image_url && (
                      <img 
                        src={item.product.image_url} 
                        alt={item.product?.name || 'Product'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                    <p className="text-sm text-white/70">${item.product?.price.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-white/50 hover:text-white"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash size={16} />
                    </Button>
                    <div className="flex items-center mt-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="mx-2 w-5 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-card">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={onCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
