import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http: HttpClient) { }
  
  public startCourseCheckoutSession(courseId: string) {
    const body = {
      courseId,
      callbackUrl: this.buildCallbackUrl()
    };
    
    return this.http.post('/api/checkout', body);
  }
  
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
