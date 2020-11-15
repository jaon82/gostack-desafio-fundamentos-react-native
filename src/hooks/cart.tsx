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
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
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
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
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
        const productsUpdated = [...products, { ...product, quantity: 1 }];
        setProducts(productsUpdated);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
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
        if (productsUpdated[productIndex].quantity > 1) {
          productsUpdated[productIndex].quantity -= 1;
          setProducts(productsUpdated);
        } else {
          productsUpdated.splice(productIndex, 1);
          setProducts(productsUpdated);
        }
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
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
