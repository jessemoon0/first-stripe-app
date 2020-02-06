import { Request, Response } from 'express';

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
      sessionConfig = setupPurchaseCourseSession(request);
    }
  
    console.log('sessionConfig');
    console.log(sessionConfig);
    
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('session');
    console.log(session);
    
    
    return res.status(200).send();
    
  } catch (e) {
    console.log('Unexpected error occurred while purchasing a course: ', e);
    res.status(500).json({ error: 'Could Not initiate a Stripe checkout session'});
  }
}

export function setupPurchaseCourseSession(info: IRequestInfo) {
  const config = setupBaseSessionConfig(info);
  
  // Add our product. Amount has to include the 2 zeros from the cents
  config.line_items = [
    {
      name: 'Stripe Payments In Practice',
      description: 'Build your own ecommerce store & membership website with Firebase, Stripe and Express',
      amount: 5000,
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
