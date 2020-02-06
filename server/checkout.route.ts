import { Request, Response } from 'express';

interface IRequestInfo {
  courseId: string;
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const info: IRequestInfo = {
      courseId: req.body.courseId
    };
    
    console.log('Purchasing course with ID: ', info.courseId);
    
    return res.status(200).send();
    
  } catch (e) {
    console.log('Unexpected error occurred while purchasing a course: ', e);
    res.status(500).json({ error: 'Could Not initiate a Stripe checkout session'});
  }
}
