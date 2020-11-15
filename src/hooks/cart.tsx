import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(
        stateProduct => stateProduct.id === id,
      );

      if (productIndex > -1) {
        const productsUpdated = [...products];
        productsUpdated[productIndex].quantity += 1;
        setProducts(productsUpdated);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(
        stateProduct => stateProduct.id === product.id,
      );

      if (!productExists) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        increment(product.id);
      }
    },
    [increment, products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(
        stateProduct => stateProduct.id === id,
      );

      if (productIndex > -1) {
        const productsUpdated = [...products];
        productsUpdated[productIndex].quantity -= 1;
        setProducts(productsUpdated);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
