import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string | null;
  selectedOption?: string | null;
  discountPercentage?: number;
}

interface CartState {
  items: CartItem[];
}

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string, selectedOption?: string | null) => void;
  updateQuantity: (id: string, quantity: number, selectedOption?: string | null) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isPaymentDialogOpen: boolean;
  selectedPaymentMethod: 'visa_card' | 'zain_cash' | null;
  pendingOrder: { orderId: string; totalAmount: number; items: CartItem[] } | null;
  openPaymentDialog: (method: 'visa_card' | 'zain_cash', orderData: { orderId: string; totalAmount: number; items: CartItem[] }) => void;
  closePaymentDialog: () => void;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { id: string; selectedOption?: string | null } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number; selectedOption?: string | null } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
        (item.selectedOption || item.selectedColor) === (action.payload.selectedOption || action.payload.selectedColor)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: updatedItems };
      }

      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter(
          item => !(item.id === action.payload.id && 
          (item.selectedOption || item.selectedColor) === action.payload.selectedOption)
        ),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            item => !(item.id === action.payload.id && 
            (item.selectedOption || item.selectedColor) === action.payload.selectedOption)
          ),
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && 
          (item.selectedOption || item.selectedColor) === action.payload.selectedOption
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'visa_card' | 'zain_cash' | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ orderId: string; totalAmount: number; items: CartItem[] } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const cartItem: CartItem = {
      ...item,
      quantity: item.quantity || 1,
      selectedOption: item.selectedColor || item.selectedOption || null,
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (id: string, selectedOption?: string | null) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, selectedOption } });
  };

  const updateQuantity = (id: string, quantity: number, selectedOption?: string | null) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, selectedOption } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const openPaymentDialog = (method: 'visa_card' | 'zain_cash', orderData: { orderId: string; totalAmount: number; items: CartItem[] }) => {
    setSelectedPaymentMethod(method);
    setPendingOrder(orderData);
    setIsPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedPaymentMethod(null);
    setPendingOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isPaymentDialogOpen,
        selectedPaymentMethod,
        pendingOrder,
        openPaymentDialog,
        closePaymentDialog,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
