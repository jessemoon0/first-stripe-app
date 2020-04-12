import { Request, Response } from 'express';
import { db, getDocData } from '../database';
import { CheckoutStatusType, FirebaseCollectionType } from '../enums';
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
      console.log('checkoutSession');
      console.log(checkoutSession);
      await onCheckoutSessionCompleted(checkoutSession);
    }

    res.send({received: true});

  } catch (err) {
    console.log('Error processing webhook event, reason: ', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

}

async function onCheckoutSessionCompleted(session) {
  const purchaseSessionId = session.client_reference_id;
  const { courseId, userId } = await getDocData(`${FirebaseCollectionType.PurchaseSession}/${purchaseSessionId}`);

  if (courseId) {
    await fulfillCoursePurchase(userId, courseId, purchaseSessionId, session.customer);
  }
}

/**
 * This function will take care of either a course purchase or a subscription
 * @param userId: The user belonging to the session
 * @param courseId: The product
 * @param purchaseSessionId: We will need to update the purchase session on the DB as completed
 */
function fulfillCoursePurchase(
  userId: string,
  courseId: string,
  purchaseSessionId: string,
  stripeCustomerId: string
): Promise<any> {
  const batch = db.batch();
  const purchaseSessionRef = db.doc(`${FirebaseCollectionType.PurchaseSession}/${purchaseSessionId}`);
  // Update existing document
  batch.update(purchaseSessionRef, { status: CheckoutStatusType.Complete });
  // Create a new user collection
  const userCoursesOwnedRef = db.doc(`${FirebaseCollectionType.Users}/${userId}/coursesOwned/${courseId}`);
  // As we create a new one, we want to create with an empty object.
  batch.create(userCoursesOwnedRef, {});
  // Get the users table
  const userRef = db.doc(`${FirebaseCollectionType.Users}/${userId}`);
  // Save the Stripe customer ID in the DB.
  // merge means that if doesnt exit, create it, otherwise, update it.
  batch.set(userRef, { stripeCustomerId }, { merge: true });
  // Finish the batch operations
  return batch.commit();
}

