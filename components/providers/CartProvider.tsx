"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  colorName?: string;
  shippingType: 'FREE' | 'PAID';
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, colorName?: string) => void;
  updateQty: (id: string, qty: number, colorName?: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoading] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('aso-shno-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setIsLoading(true);
  }, []);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aso-shno-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id && i.colorName === newItem.colorName);
      if (existing) {
        return prev.map(i =>
          (i.id === newItem.id && i.colorName === newItem.colorName)
          ? { ...i, qty: i.qty + newItem.qty }
          : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string, colorName?: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.colorName === colorName)));
  };

  const updateQty = (id: string, qty: number, colorName?: string) => {
    if (qty <= 0) {
      removeItem(id, colorName);
      return;
    }
    setItems(prev => prev.map(i =>
      (i.id === id && i.colorName === colorName) ? { ...i, qty } : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalAmount, totalCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
