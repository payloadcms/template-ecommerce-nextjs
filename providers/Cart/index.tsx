import React, { createContext, useContext, useCallback, useState, useEffect, useReducer } from 'react';
import { Product, User } from '../../payload-types';
import { useAuth } from '../Auth';
import { CartItem, cartReducer } from './reducer';
// import { useNotifications } from '../Notifications';

export type CartContext = {
  cart: User['cart']
  addItemToCart: (item: CartItem) => void
  deleteItemFromCart: (product: Product) => void
  cartIsEmpty: boolean
  clearCart: () => void
  isProductInCart: (product: Product) => boolean,
  cartTotal: {
    formatted: string
    raw: number
  }
}

const Context = createContext({} as CartContext);

export const useCart = () => useContext(Context);

const arrayHasItems = (array) => Array.isArray(array) && array.length > 0;

export const CartProvider = (props) => {
  // const { setTimedNotification } = useNotifications();
  const { children } = props;

  const [cart, dispatchCart] = useReducer(cartReducer, {
    items: []
  });

  const { user, status: authStatus } = useAuth();
  const [total, setTotal] = useState<{
    formatted: string
    raw: number
  }>();

  const [cartIsEmpty, setCartIsEmpty] = useState(true);

  useEffect(() => {
    if (authStatus === 'loggedIn') {
      // merge the users cart with the local cart upon logging in
      dispatchCart({
        type: 'MERGE_CART',
        payload: user.cart
      })
    }

    if (authStatus === 'loggedOut') {
      // clear the cart from local state after logging out
      dispatchCart({
        type: 'CLEAR_CART'
      })
    }
  }, [user, authStatus])

  // every time the cart changes, determine whether to save to local storage or Payload
  // upon logging in, merge and sync the existing local cart to Payload
  useEffect(() => {
    const cartJSON = JSON.stringify({
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        // flatten relationship to product
        product: typeof item.product === 'string' ? item.product : item.product.id
      }))
    });

    if (user) {
      try {
        const syncCartToPayload = async () => {
          const req = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users/${user.id}`, {
            // Make sure to include cookies with fetch
            credentials: 'include',
            method: 'PATCH',
            body: JSON.stringify({
              cart: cartJSON
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (req.ok) {
            localStorage.setItem('cart', '[]');
          }
        }

        syncCartToPayload()
      } catch (e) {
        console.error('Error while syncing cart to Payload.')
      }
    } else {
      localStorage.setItem('cart', cartJSON);
    }
  }, [user, cart])

  const isProductInCart = useCallback((incomingProduct: Product): boolean => {
    let isInCart = false;
    const { items: itemsInCart } = cart;
    if (Array.isArray(itemsInCart) && itemsInCart.length > 0) {
      isInCart = Boolean(itemsInCart.find(({ product }) => typeof product === 'string' ? product === incomingProduct.id : product.id === incomingProduct.id));
    }
    return isInCart;
  }, [cart]);

  // this method can be used to add new items AND update existing ones
  const addItemToCart = useCallback((incomingItem) => {
    dispatchCart({
      type: 'ADD_ITEM',
      payload: incomingItem
    })
  }, []);

  const deleteItemFromCart = useCallback((incomingProduct: Product) => {
   dispatchCart({
      type: 'DELETE_ITEM',
      payload: incomingProduct
   })
  }, []);

  const clearCart = useCallback(() => {
    dispatchCart({
      type: 'CLEAR_CART'
    })
  }, []);

  useEffect(() => {
    const isEmpty = !arrayHasItems(cart.items);
    setCartIsEmpty(isEmpty);

    const newTotal = cart.items.reduce((acc, item) => {
      return acc + (typeof item.product === 'object' ? JSON.parse(item.product.priceJSON)?.data?.[0]?.unit_amount * item.quantity : 0)
    }, 0);

    setTotal({
      formatted: (newTotal / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      raw: newTotal
    })
  }, [cart]);

  return (
    <Context.Provider
      value={{
        cart,
        addItemToCart,
        deleteItemFromCart,
        cartIsEmpty,
        clearCart,
        isProductInCart,
        cartTotal: total
      }}
    >
      { children && children}
    </Context.Provider>
  );
};
