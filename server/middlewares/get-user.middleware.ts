import { Request, Response, NextFunction } from 'express';
import { auth } from '../auth';
import * as admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;

export function getUserMiddleware(req: Request, res: Response, next: NextFunction) {
  const jwt = req.headers.authorization;

  if (jwt) {
    // Get the user from jwt if its valid.
    auth.verifyIdToken(jwt)
      .then((jwtPayload: DecodedIdToken) => {
        // uid will be a property of request to be used later in the chain.
        req['uid'] = jwtPayload.uid;
        next();
      })
      .catch((error) => {
        const message = 'Error verifying the Firebase ID token';
        console.log(message, error);
        res.status(403).json({
          message
        });
      });
  } else {
    next();
  }
}
