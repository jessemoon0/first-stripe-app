import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutSession } from '../interfaces/checkout-session.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { CheckoutStatusType, FirebaseCollectionType } from '../../../server/enums';
import { filter, first } from 'rxjs/operators';

// To use the library on index.html: https://js.stripe.com/v3
declare const Stripe;

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private jwtAuth: string;

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore
  ) {
    this.afAuth.idToken.subscribe((jwt: string | null) => {
      this.jwtAuth = jwt;
    });
  }

  /**
   * Step 1: We start a checkout session with the ID of the product.
   * @param courseId: Id of our product
   */
  public startCourseCheckoutSession(courseId: string): Observable<CheckoutSession> {
    const headers = new HttpHeaders().set('Authorization', this.jwtAuth);
    const body = { courseId, callbackUrl: this.buildCallbackUrl() };

    return this.http.post<CheckoutSession>('/api/checkout', body, {headers});
  }

  /**
   * Step 2: We start a Stripe session with the checkout session.
   * @param session: Has the Session ID and the Public API key
   */
  public redirectToCheckoutSession(session: CheckoutSession) {
    // We initialize stripe with a session
    const stripe = Stripe(session.stripePublicKey);

    stripe.redirectToCheckout({
      sessionId: session.stripeCheckoutSessionId
    });
  }

  /**
   * Step 3: After the customer added their card on stripe servers, we now have to wait
   * on that the transaction is successful in order to show a success screen.
   * @param ongoingSessionId: The ID of the session that is being completed
   */
  public waitForPurchaseCompleted(ongoingSessionId): Observable<any> {
    return this.angularFirestore.doc<any>(`${FirebaseCollectionType.PurchaseSession}/${ongoingSessionId}`)
      .valueChanges()
      .pipe(
        filter((purchase: any) => purchase.status === CheckoutStatusType.Complete),
        first()
      );
  }

  /**
   * For Stripe to have a callback URL when it finishes
   */
  private buildCallbackUrl(): string {
    // Protocol: This will be http or https depending on environment
    // Hostname: www.mysite.com
    // Port: 4200 (if provided) --> This happens only in dev.
    const protocol = window.location.protocol,
          hostName = window.location.hostname,
          port = window.location.port;

    let callbackUrl = `${protocol}//${hostName}`;
    if (port) {
      callbackUrl += `:${port}`;
    }
    callbackUrl += `/stripe-checkout`;

    return callbackUrl;
  }
}
