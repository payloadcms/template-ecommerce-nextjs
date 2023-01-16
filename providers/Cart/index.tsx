import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { Product, User } from '../../payload-types';
import canUseDOM from '../../utilities/canUseDOM';
import { useAuth } from '../Auth';
// import { useNotifications } from '../Notifications';

type CartType = User['cart'];
type CartItem = User['cart']['items'][0];

export type CartContext = {
  cart: User['cart']
  addItemToCart: (item: CartItem) => void
  deleteItemFromCart: (product: Product) => void
  cartIsEmpty: boolean
  clearCart: () => void
  isProductInCart: (product: Product) => boolean
}

const Context = createContext({} as CartContext);

export const useCart = () => useContext(Context);

const arrayHasItems = (array) => Array.isArray(array) && array.length > 0;

export const CartProvider = (props) => {
  // const { setTimedNotification } = useNotifications();
  const { children } = props;

  const [cart, setCart] = useState<CartType>(() => {
    return ({
      items: [],
      ...canUseDOM ? JSON.parse(localStorage.getItem('cart')) : {},
    })
  });

  const { user } = useAuth();

  const [cartIsEmpty, setCartIsEmpty] = useState(true);
  const syncCart = useRef(true); // prevents sync from looping infinitely
  const hasLoggedIn = useRef(false); // used to fire an effect only once upon log out

  // clear the cart from local state after logging out
  useEffect(() => {
    if (hasLoggedIn.current === true && !user) {
      syncCart.current = false;
      setCart({
        items: []
      })
    }
  }, [user])

  // every time the cart changes, determine whether to save to local storage or Payload
  // when logged in, merge and sync the existing cart from local storage to Payload
  useEffect(() => {
    console.log('effect', user);
    if (user) {
      hasLoggedIn.current = true;

      if (syncCart.current) {
        syncCart.current = false;
        const syncedItems: CartItem[] = [
          ...cart?.items || [],
          ...user?.cart?.items || []
        ].reduce((acc, item) => {
          // remove duplicates
          const productId = typeof item.product === 'string' ? item.product : item.product.id;
          const indexInAcc = acc.findIndex(({ product }) => typeof product === 'string' ? product === productId : product.id === productId);
          if (indexInAcc > -1) {
            acc[indexInAcc] = {
              ...acc[indexInAcc],
              quantity: acc[indexInAcc].quantity + item.quantity
            }
          } else {
            acc.push(item)
          }
          return acc;
        }, [])

        const syncedCart = {
          ...cart,
          items: syncedItems
        }

        setCart(syncedCart);

        try {
          const syncCartToPayload = async () => {
            const req = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users/${user.id}`, {
              // Make sure to include cookies with fetch
              credentials: 'include',
              method: 'PATCH',
              body: JSON.stringify({
                cart: {
                  ...syncedCart,
                  items: syncedCart.items.map((item) => ({
                    ...item,
                    product: typeof item.product === 'string' ? item.product : item.product.id // flatten relationship
                  }))
                }
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
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
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
    const indexInCart = cart.items.findIndex(({ product }) => typeof product === 'string' ? product === incomingItem.product.id : product.id === incomingItem.product.id);
    let withAddedItem = { ...cart };

    if (indexInCart === -1) {
      withAddedItem = {
        ...cart,
        items: [
          ...cart?.items || [],
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

    syncCart.current = true;
    setCart(withAddedItem);
  }, [cart]);

  const deleteItemFromCart = useCallback((incomingProduct: Product) => {
    const withDeletedItem = { ...cart };
    const indexInCart = cart.items.findIndex(({ product }) => typeof product === 'string' ? product === incomingProduct.id : product.id === incomingProduct.id);
    if (indexInCart > -1) {
      withDeletedItem.items.splice(indexInCart, 1)
      syncCart.current = true;
      setCart(withDeletedItem)
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    const emptyCart = {
      items: []
    };

    syncCart.current = true;
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
