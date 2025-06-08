
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOption?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, selectedOption?: string, optionPrice?: number) => void;
  removeFromCart: (productId: string, selectedOption?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedOption?: string) => void;
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

  const addToCart = (product: any, selectedOption?: string, optionPrice?: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        selectedOption 
          ? item.id === product.id && item.selectedOption === selectedOption
          : item.id === product.id && !item.selectedOption
      );
      
      // Determine the correct price to use
      let finalPrice = product.price;
      if (selectedOption && optionPrice !== undefined) {
        finalPrice = optionPrice;
      } else if (selectedOption && product.options) {
        const selectedOptionData = product.options.find((opt: any) => opt.name === selectedOption);
        if (selectedOptionData && selectedOptionData.price !== undefined) {
          finalPrice = selectedOptionData.price;
        }
      }
      
      if (existingItem) {
        toast({
          title: "تم تحديث السلة",
          description: `تم زيادة كمية ${product.name} ${selectedOption ? `(${selectedOption})` : ''} في السلة`,
        });
        return prevItems.map(item =>
          (selectedOption ? (item.id === product.id && item.selectedOption === selectedOption) : (item.id === product.id && !item.selectedOption))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "تم إضافة المنتج",
          description: `تم إضافة ${product.name} ${selectedOption ? `(${selectedOption})` : ''} إلى السلة`,
        });
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: Math.round(finalPrice),
          quantity: 1,
          image: product.cover_image || '/placeholder.svg',
          selectedOption: selectedOption
        }];
      }
    });
  };

  const removeFromCart = (productId: string, selectedOption?: string) => {
    setItems(prevItems => prevItems.filter(item => 
      selectedOption 
        ? !(item.id === productId && item.selectedOption === selectedOption)
        : !(item.id === productId && !item.selectedOption)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedOption?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedOption);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        (selectedOption ? (item.id === productId && item.selectedOption === selectedOption) : (item.id === productId && !item.selectedOption))
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
