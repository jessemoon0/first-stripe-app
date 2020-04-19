import { Component, OnInit } from '@angular/core';
import { Course } from '../interfaces/course';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoursesService } from '../services/courses.service';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutSession } from '../interfaces/checkout-session.interface';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public courses$: Observable<Course[]>;
  public beginnersCourses$: Observable<Course[]>;
  public advancedCourses$: Observable<Course[]>;
  public processingOngoing = false;

    constructor(private coursesService: CoursesService, private checkoutService: CheckoutService) {}

  public ngOnInit() {
    this.reloadCourses();
  }

  public reloadCourses() {
    this.courses$ = this.coursesService.loadAllCourses();
    this.beginnersCourses$ = this.courses$.pipe(
        map(courses => courses.filter(
          course => course.categories.includes('BEGINNER'))));
    this.advancedCourses$ = this.courses$.pipe(
        map(courses => courses.filter(
            course => course.categories.includes('ADVANCED'))));
  }

  public subscribeToPlan() {
    this.processingOngoing = true;
    // Subscription product configured in Stripe
    const stripeSubscriptionProductId = 'STRIPE_MONTHLY';
    this.checkoutService.startSubscriptionCheckoutSession(stripeSubscriptionProductId)
      .subscribe({
        next: (checkoutSession: CheckoutSession) => {
          this.checkoutService.redirectToCheckoutSession(checkoutSession);
        },
        error: (err) => {
          console.log('Error creating checkout session', err);
          this.processingOngoing = false;
        }
      });
  }

}
