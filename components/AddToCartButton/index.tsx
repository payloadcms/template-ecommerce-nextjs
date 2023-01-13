import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { CartItem, useCart } from '../../providers/Cart';
import classes from './index.module.scss';

export const AddToCartButton: React.FC<{
  className?: string
  item: CartItem
}> = (props) => {
  const {
    className,
    item
  } = props;

  const { cart, addItemToCart, isProductInCart } = useCart();

  const [showInCart, setShowInCart] = useState<boolean>();

  useEffect(() => {
    setShowInCart(isProductInCart(item.product))
  }, [isProductInCart, item, cart])

  if (showInCart) {
    return (
      <Link href="/cart">
        View in cart
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItemToCart(item)
      }}
      className={[
        className,
        classes.addToCartButton
      ].filter(Boolean).join(' ')}
    >
      Add to cart
    </button>
  );
};
