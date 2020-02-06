import * as express from 'express';
import { Application, Request, Response } from 'express';
import { createCheckoutSession } from './checkout.route';

export function initServer() {
  const app: Application = express();
  const bodyParser = require('body-parser');
  
  app.route('/').get(((req: Request, res: Response) => {
    res.status(200).send('<h1>API is running!!!!</h1>');
  }));
  
  app.route('/api/checkout').post(bodyParser.json(), createCheckoutSession);
  
  const PORT = process.env.PORT || 9000;
  
  app.listen(PORT, () => {
    console.log('API is running in port: ', PORT);
  });
}
