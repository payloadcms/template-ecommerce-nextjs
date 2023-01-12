import React from 'react';
import { Product } from '../../payload-types';
import { useCart } from '../../providers/Cart';
import { Button } from '../Button';
import classes from './index.module.scss';

export const RemoveFromCartButton: React.FC<{
  className?: string
  product: Product
}> = (props) => {
  const {
    className,
    product
  } = props;

  const { deleteItemFromCart, isProductInCart } = useCart();

  const productIsInCart = isProductInCart(product);

  if (!productIsInCart) {
    return (
      <div>
        Item is not in the cart
      </div>
    )
  }

  return (
    <Button
      onClick={() => {
        deleteItemFromCart(product)
      }}
      className={[
        className,
        classes.removeFromCartButton
      ].filter(Boolean).join(' ')}
      label="Remove from cart"
    />
  );
};
