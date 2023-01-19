import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { User } from '../../payload-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

// This endpoint creates a PaymentIntent with the items in the cart using the "Invoices" API
// This is required in order to associate each line item with its respective product in Stripe
// To do this, we loop through the items in the cart and create a line-item in the invoice for each cart item
// Once completed, we pass the `client_secret` of the PaymentIntent back to the client which can process the payment
const makePaymentIntent = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let stripeCustomerID = req.body?.user?.stripeCustomerID;

    if (req.body?.cart?.items.length === 0) {
      throw new Error('No items in cart');
    }

    // lookup user in Stripe and create one if not found
    if (!stripeCustomerID) {
      const customer = await stripe.customers.create({
        email: req.body?.user?.email,
        name: req.body?.user?.name,
      })
      stripeCustomerID = customer.id;
    }

    // initialize an empty invoice for the customer
    // the invoice will be charged automatically when it is sent
    // because the customer  has a payment method on record
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerID,
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    // for each item in cart, create an invoice item and send the invoice
    await Promise.all(req.body?.cart?.items.map(
      async (item: User['cart']['items'][0]) => {
      const { product } = item;

      if (typeof product === 'string' || !product.stripeProductID) {
        throw new Error('No Stripe Product ID');
      }

      const prices = await stripe.prices.list({
        product: product.stripeProductID,
        limit: 100,
        expand: ['data.product'],
      });

      if (prices.data.length === 0) {
        throw new Error('No price found');
      }

      const price = prices.data[0];

      return await stripe.invoiceItems.create({
        customer: stripeCustomerID,
        price: price.id,
        invoice: invoice.id
      })
    }));

    // send the invoice to Stripe
    const finalInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // retrieve the payment intent from the invoice
    const paymentIntent = await stripe.paymentIntents.retrieve(typeof finalInvoice.payment_intent === 'string' ? finalInvoice.payment_intent : finalInvoice.payment_intent.id);

    // return the `client_secret` of the payment intent to the client
    res.send({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    console.error(error.message);
    res.json({ error: error.message });
  }
}

export default makePaymentIntent
