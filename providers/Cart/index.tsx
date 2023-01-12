import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Product } from '../../payload-types';
import canUseDOM from '../../utilities/canUseDOM';
// import { useNotifications } from '../Notifications';

export type CartItem = {
  product: Product
  quantity: number
}

export type Cart = {
  items: CartItem[]
}

export type CartContext = {
  cart: Cart
  addItemToCart: (item: CartItem) => void
  deleteItemFromCart: (product: Product) => void
  cartIsEmpty: boolean
  clearCart: () => void
  isProductInCart: (product: Product) => boolean
}

const Context = createContext({} as CartContext);

export const useCart = () => useContext(Context);

const getCart = (): Cart => ({
  items: [],
  ...canUseDOM ? JSON.parse(localStorage.getItem('cart')) : {},
});

const arrayHasItems = (array) => Array.isArray(array) && array.length > 0;

export const CartProvider = (props) => {
  // const { setTimedNotification } = useNotifications();
  const { children } = props;
  const [cart, setCart] = useState<Cart>(() => getCart());

  const [cartIsEmpty, setCartIsEmpty] = useState(true);

  const isProductInCart = useCallback((incomingProduct: Product): boolean => {
    let isInCart = false;
    const { items: itemsInCart } = getCart();
    if (Array.isArray(itemsInCart) && itemsInCart.length > 0) {
      isInCart = Boolean(itemsInCart.find((item) => item.product.id === incomingProduct.id));
    }
    return isInCart;
  }, []);

  // this method can be used to add new items AND update existing ones
  const addItemToCart = useCallback((incomingItem) => {
    const currentCart = getCart();
    const { items: itemsInCart } = currentCart;
    const indexInCart = currentCart.items.findIndex((item) => item.product.id === incomingItem.product.id)
    let withAddedItem = currentCart;

    if (indexInCart === -1) {
      withAddedItem = {
        ...currentCart,
        items: [
          ...itemsInCart || [],
          incomingItem,
        ],
      };
    }

    if (indexInCart > -1) {
      withAddedItem.items[indexInCart] = {
        ...withAddedItem.items[indexInCart],
        quantity: withAddedItem.items[indexInCart].quantity + 1
      }
    }

    localStorage.setItem('cart', JSON.stringify(withAddedItem));
    setCart(withAddedItem);
  }, []);

  const deleteItemFromCart = useCallback((incomingProduct: Product) => {
    const currentCart = getCart();
    const withDeletedItem = currentCart;
    const indexInCart = currentCart.items.findIndex((item) => item.product.id === incomingProduct.id)
    if (indexInCart > -1) {
      withDeletedItem.items.splice(indexInCart, 1)
      localStorage.setItem('cart', JSON.stringify(withDeletedItem));
      setCart(withDeletedItem)
    }
  }, []);

  const clearCart = useCallback(() => {
    const emptyCart = {
      items: []
    };

    localStorage.setItem('cart', JSON.stringify(emptyCart));
    setCart(emptyCart);
  }, []);

  useEffect(() => {
    const isEmpty = !arrayHasItems(cart.items);
    setCartIsEmpty(isEmpty);
  }, [cart]);

  return (
    <Context.Provider
      value={{
        cart,
        addItemToCart,
        deleteItemFromCart,
        cartIsEmpty,
        clearCart,
        isProductInCart
      }}
    >
      { children && children}
    </Context.Provider>
  );
};
