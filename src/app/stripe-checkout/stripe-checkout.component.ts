import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'stripe-checkout',
  templateUrl: './stripe-checkout.component.html',
  styleUrls: ['./stripe-checkout.component.scss']
})
export class StripeCheckoutComponent implements OnInit, OnDestroy {
  public message = 'Waiting for purchase to complete...';
  public waiting = true;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit() {
    const purchaseResult = this.route.snapshot.queryParamMap.get('purchaseResult');

    if (purchaseResult === 'success') {
      const ongoingPurchaseSessionId: string = this.route.snapshot.queryParamMap.get('ongoingPurchaseSessionId');

      this.checkoutService.waitForPurchaseCompleted(ongoingPurchaseSessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (value) => {
            this.waiting = false;
            this.message = 'Purchase SUCCESSFUL, redirecting...';
            // Give time to the user to read message
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 3000);
          }
        });

    } else {
      this.waiting = false;
      this.message = 'Purchase Canceled or Failed, redirecting...';
      // Give time to the user to read message
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
