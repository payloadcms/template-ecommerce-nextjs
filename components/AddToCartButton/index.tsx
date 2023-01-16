import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Product } from '../../payload-types';
import { CartItem, useCart } from '../../providers/Cart';
import classes from './index.module.scss';

export const AddToCartButton: React.FC<{
  product: Product
  quantity?: number
  className?: string
}> = (props) => {
  const {
    product,
    quantity = 1,
    className
  } = props;

  const { cart, addItemToCart, isProductInCart } = useCart();

  const [showInCart, setShowInCart] = useState<boolean>();

  useEffect(() => {
    setShowInCart(isProductInCart(product))
  }, [isProductInCart, product, cart])

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
        addItemToCart({
          product,
          quantity
        })
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
