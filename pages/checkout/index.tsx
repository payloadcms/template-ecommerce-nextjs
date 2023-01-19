import React, { Fragment, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import { useCart } from '../../providers/Cart';
import { Media } from '../../components/Media';
import { FOOTER, HEADER, SETTINGS } from '../../graphql/globals';
import { gql } from '@apollo/client'
import { useAuth } from '../../providers/Auth';
import { Price } from '../../components/Price';
import { useRouter } from 'next/router';
import { Settings } from '../../payload-types';
import Link from 'next/link';
import { CheckoutForm } from './CheckoutForm';

import classes from './index.module.scss';

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`;
const stripe = loadStripe(apiKey);

const CheckoutPage: React.FC<{
  settings: Settings
}> = (props) => {
  const {
    settings: {
      shopPage
    }
  } = props;

  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState(null);
  const [clientSecret, setClientSecret] = React.useState();
  const hasMadePaymentIntent = React.useRef(false);

  const {
    cart,
    cartIsEmpty,
    cartTotal
  } = useCart();

  useEffect(() => {
    if (user === null) {
      router.push('/account/login')
    }
  }, [router, user])

  useEffect(() => {
    if (user !== null && cartIsEmpty) {
      router.push('/cart')
    }
  }, [router, user, cartIsEmpty])

  useEffect(() => {
    if (user && cart && hasMadePaymentIntent.current === false) {
      hasMadePaymentIntent.current = true;

      const makeIntent = async () => {
        try {
          const req = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment-intent`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user,
              cart
            })
          });

          const res = await req.json();

          if (res.error) {
            setError(res.error)
          }

          if (res.client_secret) {
            setError(null);
            setClientSecret(res.client_secret);
          }
        } catch (e) {
          setError('Something went wrong.');
        }
      }

      makeIntent();
    }
  }, [cart, user]);

  if (!user || !stripe) return null;

  return (
    <Gutter className={classes.checkoutPage}>
      {!clientSecret && (
        <div>
          {'Loading...'}
        </div>
      )}
      {clientSecret && (
        <Elements
          stripe={stripe}
          options={{
            clientSecret
          }}
        >
          <h1>Checkout</h1>
          <p>
            This is a self-hosted, secure checkout using Stripe&apos;s Payment Element component. Use credit card number <b>4242 4242 4242 4242</b> with any future date and CVC to create a mock purchase. An order will be generated in the CMS and will appear in your account.
          </p>
          {error && (
            <div className={classes.error}>
              {error}
            </div>
          )}
          {cartIsEmpty && (
            <div>
              {'Your '}
              <Link href="/cart">
                cart
              </Link>
              {' is empty.'}
              {typeof shopPage === 'object' && shopPage?.slug && (
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
                          {`Quantity: ${quantity}`}
                          <Price
                            product={product}
                            button={false}
                          />
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
              <div className={classes.orderTotal}>
                {`Order total: ${cartTotal.formatted}`}
              </div>
            </div>
          )}
          <CheckoutForm />
        </Elements>
      )}
    </Gutter>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: gql(`
      query {
        ${HEADER}
        ${FOOTER}
        ${SETTINGS}
      }
    `)
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
      settings: data?.Settings || null
    },
  };
}

export default CheckoutPage;
