import React, { Fragment, useCallback } from 'react';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import classes from './index.module.scss';
import { useCart } from '../../providers/Cart';
import { Media } from '../../components/Media';
import { RemoveFromCartButton } from '../../components/RemoveFromCartButton';
import Link from 'next/link';
import { CART, FOOTER, HEADER } from '../../graphql/globals';
import { gql } from '@apollo/client';
import { CartPage as CartPageType } from '../../payload-types';
import Blocks from '../../components/Blocks';
import { Hero } from '../../components/Hero';
import { useAuth } from '../../providers/Auth';

const CartPage: React.FC<{
  cartPage: CartPageType
}> = (props) => {
  const {
    cartPage: {
      shopPage,
      hero,
      layout
    }
  } = props;

  const { user } = useAuth();

  const {
    cart,
    cartIsEmpty,
    addItemToCart
   } = useCart();

  const handleChange = useCallback(({ quantity, product }) => {
    addItemToCart({
      quantity,
      product
    })
  }, [addItemToCart])

  return (
    <Fragment>
      <Hero {...hero} />
      <Gutter className={classes.cartWrapper}>
        {cartIsEmpty && (
          <div>
            Your cart is empty.
            {!user && (
              <Fragment>
                {' '}
                <Link href={`/login`}>
                  Log in
                </Link>
                {` to view a saved cart.`}
              </Fragment>
            )}
            {user && typeof shopPage === 'object' && shopPage?.slug && (
              <Fragment>
                {' '}
                <Link href={`/${shopPage.slug}`}>
                  Continue shopping?
                </Link>
              </Fragment>
            )}
          </div>
        )}
        {!cartIsEmpty && (
          <div className={classes.items}>
            <div className={classes.cartTotal}>
              {`There ${cart.items.length === 1 ? 'is' : 'are'} ${cart.items.length} item${cart.items.length === 1 ? '' : 's'} in your cart.`}
              {!user && (
                <Fragment>
                  {' '}
                  <Link href={`/login`}>
                    Log in
                  </Link>
                  {` to save your progress.`}
                </Fragment>
              )}
            </div>
            {cart.items.map((item, index) => {
              if (typeof item.product === 'object') {
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

                const isLast = index === cart.items.length - 1;

                return (
                  <Fragment key={index}>
                    <div className={classes.row}>
                      <div className={classes.mediaWrapper}>
                        {!metaImage && (
                          <span className={classes.placeholder}>
                            No image
                          </span>
                        )}
                        {metaImage && typeof metaImage !== 'string' && (
                          <Media
                            imgClassName={classes.image}
                            resource={metaImage}
                            fill
                          />
                        )}
                      </div>
                      <div className={classes.rowContent}>
                        <h6 className={classes.title}>
                          {title}
                        </h6>
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
                    </div>
                    {!isLast && (
                      <hr className={classes.rowHR} />
                    )}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}
      </Gutter>
      <Blocks
        blocks={layout}
      />
    </Fragment>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: gql(`
      query {
        ${HEADER}
        ${FOOTER}
        ${CART}
      }
    `)
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
      cartPage: data?.CartPage || null
    },
  };
}

export default CartPage;
