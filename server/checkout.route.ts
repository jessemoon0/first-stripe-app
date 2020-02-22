import { Request, Response } from 'express';
import { getDocData } from './database';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface IRequestInfo {
  courseId: string;
  callbackUrl: string;
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const request: IRequestInfo = {
      courseId: req.body.courseId,
      callbackUrl: req.body.callbackUrl
    };

    console.log('Purchasing course with ID: ', request.courseId);

    let sessionConfig;

    if (request.courseId) {
      const course = await getDocData(`courses/${request.courseId}`);
      console.log('Course from DB');
      console.log(course);
      sessionConfig = setupPurchaseCourseSession(request, course);
    }

    console.log('sessionConfig');
    console.log(sessionConfig);


    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('session');
    console.log(session);

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

export function setupPurchaseCourseSession(info: IRequestInfo, course) {
  const config = setupBaseSessionConfig(info);
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

export function setupBaseSessionConfig(info: IRequestInfo) {
  const config: any = {
    success_url: `${info.callbackUrl}/?purchaseResult=success`,
    cancel_url: `${info.callbackUrl}/?purchaseResult=failed`,
    payment_method_types: ['card'],
  };

  return config;
}
