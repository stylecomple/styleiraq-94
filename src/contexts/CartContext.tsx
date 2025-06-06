import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isPaymentDialogOpen: boolean;
  selectedPaymentMethod: 'visa_card' | 'zain_cash' | null;
  pendingOrder: any;
  openPaymentDialog: (paymentMethod: 'visa_card' | 'zain_cash', orderData: any) => void;
  closePaymentDialog: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'visa_card' | 'zain_cash' | null>(null);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const { toast } = useToast();

  const addToCart = (product: any, selectedColor?: string) => {
    setItems(prevItems => {
      const itemKey = selectedColor ? `${product.id}-${selectedColor}` : product.id;
      const existingItem = prevItems.find(item => 
        selectedColor 
          ? item.id === product.id && item.selectedColor === selectedColor
          : item.id === product.id && !item.selectedColor
      );
      
      if (existingItem) {
        toast({
          title: "تم تحديث السلة",
          description: `تم زيادة كمية ${product.name} ${selectedColor ? `(${selectedColor})` : ''} في السلة`,
        });
        return prevItems.map(item =>
          (selectedColor ? (item.id === product.id && item.selectedColor === selectedColor) : (item.id === product.id && !item.selectedColor))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "تم إضافة المنتج",
          description: `تم إضافة ${product.name} ${selectedColor ? `(${selectedColor})` : ''} إلى السلة`,
        });
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: Math.round(product.price),
          quantity: 1,
          image: product.cover_image || '/placeholder.svg',
          selectedColor: selectedColor
        }];
      }
    });
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setItems(prevItems => prevItems.filter(item => 
      selectedColor 
        ? !(item.id === productId && item.selectedColor === selectedColor)
        : !(item.id === productId && !item.selectedColor)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        (selectedColor ? (item.id === productId && item.selectedColor === selectedColor) : (item.id === productId && !item.selectedColor))
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return Math.round(items.reduce((total, item) => total + (item.price * item.quantity), 0));
  };

  const openPaymentDialog = (paymentMethod: 'visa_card' | 'zain_cash', orderData: any) => {
    setSelectedPaymentMethod(paymentMethod);
    setPendingOrder(orderData);
    setIsPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedPaymentMethod(null);
    setPendingOrder(null);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isPaymentDialogOpen,
      selectedPaymentMethod,
      pendingOrder,
      openPaymentDialog,
      closePaymentDialog
    }}>
      {children}
    </CartContext.Provider>
  );
};
