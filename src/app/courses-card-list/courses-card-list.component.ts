import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {Course} from '../interfaces/course';
import {MatDialog} from '@angular/material/dialog';
import {AngularFireAuth} from '@angular/fire/auth';
import { map, takeUntil } from 'rxjs/operators';
import { CheckoutService } from '../services/checkout.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'courses-card-list',
  templateUrl: './courses-card-list.component.html',
  styleUrls: ['./courses-card-list.component.css']
})
export class CoursesCardListComponent implements OnInit, OnDestroy {

  @Input()
  courses: Course[];

  @Output()
  courseEdited = new EventEmitter();

  isLoggedIn: boolean;

  purchaseStarted = false;
  
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit() {

    this.afAuth.authState
      .pipe(
        map(user => !!user)
      )
      .subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn);

  }

  public purchaseCourse(course: Course, isLoggedIn: boolean) {
    if (!isLoggedIn) {
      alert('Please login first');
    }
    
    // Avoid creating multiple checkout sessions.
    this.purchaseStarted = true;
    this.checkoutService.startCourseCheckoutSession(course.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Stripe Checkout Session has been initialized...');
        },
        error: (err) => {
          console.log('Error Creating Stripe Checkout Session');
          this.purchaseStarted = false;
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}









