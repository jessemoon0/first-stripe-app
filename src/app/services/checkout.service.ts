import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutSession } from '../interfaces/checkout-session.model';

// To use the library on index.html: https://js.stripe.com/v3
declare const Stripe;

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http: HttpClient) { }

  /**
   * Step 1: We start a checkout session with the ID of the product.
   * @param courseId: Id of our product
   */
  public startCourseCheckoutSession(courseId: string): Observable<CheckoutSession> {
    const body = {
      courseId,
      callbackUrl: this.buildCallbackUrl()
    };

    return this.http.post<CheckoutSession>('/api/checkout', body);
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
   * For Stripe to have a callback URL when it finishes
   */
  private buildCallbackUrl() {
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
