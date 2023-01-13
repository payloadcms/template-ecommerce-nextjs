import React, { useCallback } from 'react';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import classes from './index.module.scss';
import { useCart } from '../../providers/Cart';
import { Media } from '../../components/Media';
import { RemoveFromCartButton } from '../../components/RemoveFromCartButton';
import Link from 'next/link';
import { HEADER_QUERY } from '../../graphql/globals';

const Cart: React.FC = () => {
  const { cart, cartIsEmpty, addItemToCart } = useCart();

  const handleChange = useCallback(({ quantity, product }) => {
    addItemToCart({
      quantity,
      product
    })
  }, [addItemToCart])

  return (
    <Gutter>
      <div className={classes.cart}>
        <header className={classes.header}>
          <h1 className={classes.headerTitle}>
            Cart
          </h1>
        </header>
      </div>
      {cartIsEmpty && (
        <div>
          Your cart is empty
          <Link href="/shop">
            Shop now
          </Link>
        </div>
      )}
      {!cartIsEmpty && (
        <div className={classes.items}>
          {cart.items.map((item, index) => {
            const {
              quantity,
              product,
              product: {
                title,
                meta: {
                  image: metaImage
                }
              }
            } = item;

            return (
              <div
                key={index}
                className={classes.row}
              >
                <div className={classes.image}>
                  {!metaImage && (
                    <span>
                      No image
                    </span>
                  )}
                  {metaImage && typeof metaImage !== 'string' && (
                    <Media
                      className={classes.media}
                      resource={metaImage}
                    />
                  )}
                </div>
                <p className={classes.title}>
                  {title}
                </p>
                <label>
                  Quantity
                  &nbsp;
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange({
                        quantity: value,
                        product
                      })
                    }}
                  />
                </label>
                <div>
                  <RemoveFromCartButton product={product} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Gutter>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: HEADER_QUERY
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  };
}

export default Cart;
