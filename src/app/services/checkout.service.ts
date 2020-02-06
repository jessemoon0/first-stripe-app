import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Course } from '../interfaces/course';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http: HttpClient) { }
  
  public startCourseCheckoutSession(courseId: string) {
    const body = {
      courseId
    };
    
    return this.http.post('/api/checkout', body);
  }
}
