import { Request, Response } from 'express';
import { db, getDocData } from '../database';
import { Timestamp } from '@google-cloud/firestore';
import { CheckoutStatusType, FirebaseCollectionType } from '../enums';
import { ICheckoutSessionData } from '../interfaces/checkout-session-data.interface';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface IRequestInfo {
  courseId: string;
  callbackUrl: string;
  userId: string;
}

/**
 * All the checkout experience
 * @param req
 * @param res
 */
export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const request: IRequestInfo = {
      courseId: req.body.courseId,
      callbackUrl: req.body.callbackUrl,
      // Our User ID comes from the auth middleware if we are authenticated in Firebase.
      userId: req['uid']
    };

    if (!request.userId) {
      const message = 'User Must be Authenticated';
      console.log(message);
      res.status(403).json({message});
      return;
    }

    const purchaseSession: ICheckoutSessionData = await createPurchaseSessionData(request);

    // Get the user for 2nd purchases or subscriptions so multiple products can go under the same user
    const user = await getDocData(`${FirebaseCollectionType.Users}/${request.userId}`);

    let sessionConfig;

    if (request.courseId) {
      const course = await getDocData(`${FirebaseCollectionType.Courses}/${request.courseId}`);
      sessionConfig =
        setupPurchaseCourseSession(request, course, purchaseSession.id, user ? user.stripeCustomerId : undefined);
    }


    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Pass the stripe session ID and the stripe public key to the client
    return res.status(200).json({
      stripeCheckoutSessionId: session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });

  } catch (e) {
    console.log('Unexpected error occurred while purchasing a course: ', e);
    res.status(500).json({ error: 'Could Not initiate a Stripe checkout session'});
  }
}

export function setupPurchaseCourseSession(
  requestInfo: IRequestInfo,
  course,
  sessionId: string,
  stripeCustomerId: string
) {
  const config = setupBaseSessionConfig(requestInfo, sessionId, stripeCustomerId);
  const centsMultiplier = 100;
  // Add our product. Amount has to include the 2 zeros from the cents
  config.line_items = [
    {
      name: course.titles.description,
      description: course.titles.longDescription,
      amount: course.price * centsMultiplier,
      currency: 'usd',
      quantity: 1
    }
  ];

  return config;
}

export function setupBaseSessionConfig(info: IRequestInfo, sessionId: string, stripeCustomerId: string) {
  const config: any = {
    success_url: `${info.callbackUrl}/?purchaseResult=success&ongoingPurchaseSessionId=${sessionId}`,
    cancel_url: `${info.callbackUrl}/?purchaseResult=failed`,
    payment_method_types: ['card'],
    client_reference_id: sessionId
  };

  if (stripeCustomerId) {
    config.customer = stripeCustomerId;
  }

  return config;
}

/**
 *  Our own session creation to keep track of how the session is doing.
 *  In here we add the Hook that will inform us from Stripe when session is completed.
 * @param course: We want the courseId (which is the product) and the user to be added to the data
 */
export async function createPurchaseSessionData(course: IRequestInfo) {
  const purchaseSession = await db.collection(FirebaseCollectionType.PurchaseSession).doc();

  const checkoutSessionData: ICheckoutSessionData = {
    status: CheckoutStatusType.Ongoing,
    created: Timestamp.now(),
    // This is the userId coming from the request
    userId: course.userId
  };

  if (course.courseId) {
    checkoutSessionData.courseId = course.courseId;
  }

  // Save data in the DB
  await purchaseSession.set(checkoutSessionData);

  return purchaseSession;
}
