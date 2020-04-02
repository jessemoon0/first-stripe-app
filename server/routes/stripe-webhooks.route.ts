import { Request, Response } from 'express';
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * This service is going to be called by Stripe.
 * @param req
 * @param res
 */
export async function stripeWebhooks(req: Request, res: Response) {

  try {
    const stripeSignature = req.headers['stripe-signature'];

    // Decode content from stripe servers.
    // The body is a string, not a json object.
    const stripeEvent = Stripe.webhooks
      .constructEvent(req.body, stripeSignature, process.env.STRIPE_WEBHOOK_SECRET);

    if (stripeEvent.type === 'checkout.session.completed') {
      const checkoutSession = stripeEvent.data.object;
      console.log('Webhook checkoutSession');
      console.log(checkoutSession);
    }

    res.send({received: true});

  } catch (err) {
    console.log('Error processing webhook event, reason: ', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

}
