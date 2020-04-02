import { Request, Response } from 'express';
import { db, getDocData } from '../database';
import { Timestamp } from '@google-cloud/firestore';
import { CheckoutStatusType } from '../enums';
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
      userId: req['uid']
    };

    if (!request.userId) {
      const message = 'User Must be Authenticated';
      console.log(message);
      res.status(403).json({message});
      return;
    }

    const purchaseSession = await createPurchaseSessionData(request);

    let sessionConfig;

    if (request.courseId) {
      const course = await getDocData(`courses/${request.courseId}`);
      sessionConfig = setupPurchaseCourseSession(request, course, purchaseSession.id);
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

export function setupPurchaseCourseSession(requestInfo: IRequestInfo, course, sessionId: string) {
  const config = setupBaseSessionConfig(requestInfo, sessionId);
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

export function setupBaseSessionConfig(info: IRequestInfo, sessionId: string) {
  const config: any = {
    success_url: `${info.callbackUrl}/?purchaseResult=success`,
    cancel_url: `${info.callbackUrl}/?purchaseResult=failed`,
    payment_method_types: ['card'],
    client_reference_id: sessionId
  };

  return config;
}

/**
 *  Our own session creation to keep track of how the session is doing.
 *  In here we add the Hook that will inform us from Stripe when session is completed.
 * @param course: We want the courseId (which is the product) and the user to be added to the data
 */
export async function createPurchaseSessionData(course: IRequestInfo) {
  const purchaseSession = await db.collection('purchaseSession').doc();

  const checkoutSessionData: ICheckoutSessionData = {
    status: CheckoutStatusType.Ongoing,
    created: Timestamp.now(),
    userId: course.userId
  };

  if (course.courseId) {
    checkoutSessionData.courseId = course.courseId;
  }

  // Save data in the DB
  await purchaseSession.set(checkoutSessionData);

  return purchaseSession;
}
