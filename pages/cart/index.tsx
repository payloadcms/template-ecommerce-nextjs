import React, { Fragment, useCallback } from 'react';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import classes from './index.module.scss';
import { useCart } from '../../providers/Cart';
import { Media } from '../../components/Media';
import { RemoveFromCartButton } from '../../components/RemoveFromCartButton';
import Link from 'next/link';
import { Page, Settings } from '../../payload-types';
import Blocks from '../../components/Blocks';
import { Hero } from '../../components/Hero';
import { useAuth } from '../../providers/Auth';
import { Button } from '../../components/Button';
import { Price } from '../../components/Price';
import { PAGE } from '../../graphql/pages';

const CartPage: React.FC<{
  settings: Settings
  page: Page
}> = (props) => {
  const {
    settings: {
      shopPage,
    },
    page: {
      hero,
      layout
    }
  } = props;

  const { user } = useAuth();

  const {
    cart,
    cartIsEmpty,
    addItemToCart,
    cartTotal
  } = useCart();

  return (
    <Fragment>
      <Hero {...hero} />
      <Gutter>
        {cartIsEmpty && (
          <div>
            Your cart is empty.
            {typeof shopPage === 'object' && shopPage?.slug && (
              <Fragment>
                {' '}
                <Link href={`/${shopPage.slug}`}>
                  Click here
                </Link>
                {` to shop.`}
              </Fragment>
            )}
            {!user && (
              <Fragment>
                {' '}
                <Link href={`/login?redirect=%2Fcart`}>
                  Log in
                </Link>
                {` to view a saved cart.`}
              </Fragment>
            )}
          </div>
        )}
        {cartIsEmpty === false && (
          <div className={classes.items}>
            <div className={classes.itemsTotal}>
              {`There ${cart.items.length === 1 ? 'is' : 'are'} ${cart.items.length} item${cart.items.length === 1 ? '' : 's'} in your cart.`}
              {!user && (
                <Fragment>
                  {' '}
                  <Link href={`/login?redirect=%2Fcart`}>
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
                              addItemToCart({
                                product,
                                quantity: Number(e.target.value)
                              })
                            }}
                          />
                        </label>
                        <Price
                          product={product}
                          button={false}
                        />
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
            <div className={classes.cartTotal}>
              {`Cart total: ${cartTotal.formatted}`}
            </div>
            <Button
              className={classes.checkoutButton}
              href={user ? '/checkout' : '/login?redirect=%2Fcheckout'}
              label={user ? 'Checkout' : 'Login to checkout'}
              appearance='primary'
            />
          </div>
        )}
      </Gutter>
      <Blocks blocks={layout} />
    </Fragment>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: PAGE,
    variables: {
      slug: "cart",
    },
  });

  if (!data.Pages.docs[0]) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      page: data?.Pages?.docs?.[0] || null,
      header: data?.Header || null,
      footer: data?.Footer || null,
      settings: data?.Settings || null,
      collection: 'pages',
      id: data?.Pages?.docs?.[0]?.id || null,
    },
  };
}

export default CartPage;
