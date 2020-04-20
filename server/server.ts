import * as express from 'express';
import { Application, Request, Response } from 'express';
import { createCheckoutSession } from './routes/checkout.route';
import { getUserMiddleware } from './middlewares/get-user.middleware';
import { stripeWebhooks } from './routes/stripe-webhooks.route';
import * as cors from 'cors';

export function initServer() {
  const app: Application = express();
  const bodyParser = require('body-parser');
  app.use(cors());


  app.route('/').get(((req: Request, res: Response) => {
    res.status(200).send('<h1>API is running!!!!</h1>');
  }));

  app.route('/api/checkout').post(bodyParser.json(), getUserMiddleware, createCheckoutSession);
  // The body is a JSON string instead of a JSON object.
  app.route('/stripe-webhooks').post(bodyParser.raw({ type: 'application/json' }), stripeWebhooks);

  const PORT = process.env.PORT || 9000;

  app.listen(PORT, () => {
    console.log('API is running in port: ', PORT);
  });
}
