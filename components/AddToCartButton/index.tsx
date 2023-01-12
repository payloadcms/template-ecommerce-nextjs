import Link from 'next/link';
import React from 'react';
import { CartItem, useCart } from '../../providers/Cart';
import { Button } from '../Button';
import classes from './index.module.scss';

export const AddToCartButton: React.FC<{
  className?: string
  item: CartItem
}> = (props) => {
  const {
    className,
    item
  } = props;

  const { addItemToCart, isProductInCart } = useCart();

  const productIsInCart = isProductInCart(item.product);

  if (productIsInCart) {
    return (
      <Link href="/cart">
        View in cart
      </Link>
    )
  }

  return (
    <Button
      onClick={() => {
        addItemToCart(item)
      }}
      className={[
        className,
        classes.addToCartButton
      ].filter(Boolean).join(' ')}
      label="Add to cart"
    />
  );
};
