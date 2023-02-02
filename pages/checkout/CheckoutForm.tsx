import React from 'react';
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { Button } from "../../components/Button";
import classes from './index.module.scss';
import { useCart } from '../../providers/Cart';

export const CheckoutForm: React.FC<{}> = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState(null);

  const handleSubmit = useCallback(async(e) => {
    e.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }, [stripe, elements])

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className={classes.error}>
          {error}
        </div>
      )}
      <PaymentElement />
      <Button
        className={classes.checkoutButton}
        label="Place order"
        type="submit"
        appearance='primary'
        disabled={!stripe}
      />
    </form>
  )
}
