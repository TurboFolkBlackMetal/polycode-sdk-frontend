import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs'
import { SessionQuery } from 'src/app/session/state/session.query'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { AvailableSubscription, BillingService } from '../billing.service'

@Component({
  selector: 'app-billing-card',
  templateUrl: './billing-card.component.html',
  styleUrls: ['./billing-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingCardComponent {

  @Input() subscription!: AvailableSubscription

  isLoggedIn$ = this.sessionQuery.isLoggedIn$
  emailFormControl = new FormControl('', [Validators.required, Validators.email])

  showBuyButtonsSub = new BehaviorSubject(true)
  showBuyButtons$ = this.showBuyButtonsSub.asObservable()

  showSpinnerSub = new BehaviorSubject(false)
  showSpinner$ = this.showSpinnerSub.asObservable()

  submitFormButtonClickedSub = new BehaviorSubject(false)
  submitFormButtonClicked$ = this.submitFormButtonClickedSub.asObservable()

  stripe: any = (window as any).Stripe(
    'pk_test_51MBbpOFVQKPpRxWmwQPsELjTvnqu9CWzqYkQdVBiUDTydyZTZ03XTdXwfrKOEWyAEH5KWXJ0ouphvwFCbPB1Ul5N00W33gvbcY'
  )

  constructor(private sessionQuery: SessionQuery,
    private billingService: BillingService,
    private dialogService: DialogService) { }


  buyButtonClicked(subscriptionID: string, priceID: string) {
    return () => {
      this.showSpinnerSub.next(true)
      this.showBuyButtonsSub.next(false)
      return this.billingService.createCustomer(this.emailFormControl.value).pipe(
        switchMap(res => { return this.billingService.createSubscription(priceID) }), 
        catchError(err => {
          if(err.status == 400) {
            return this.billingService.createSubscription(priceID).pipe(
              tap(res => this.handleStripeSubscription(res, priceID, subscriptionID) ),
              catchError(_ => {
                return this.dialogService.error({ title: 'Error', 
                  message: `Can't create your subscription. Please contact support` })
              })
            )
          } else {
            this.dialogService.error({
              title: 'Error',
              message: 'Something went wrong. Please contact Polycode support.'
            })
            return of()
          }
        })
      )
    }
  }

  createCustomer() {
    
  }

  elements: any
  options: any

  handleStripeSubscription(subObject: any, 
    priceID: string, subscriptionID: string) {

    const clientSecret = subObject
      .stripe_subscription_data.latest_invoice
      .payment_intent.client_secret

    this.options = { clientSecret: clientSecret }
    this.showSpinnerSub.next(false)
    this.elements = this.stripe.elements(this.options)
    const paymentElement = this.elements.create('payment')
    paymentElement.mount('#payment-element-' + priceID)
  }

  async formCompleteClicked() {

    this.submitFormButtonClickedSub.next(true)

    const {error} = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: `${window.location.href}?complete=true`
      }
    })

    if(error) {
      const messageContainer = document.querySelector('#error-message')
      messageContainer!.textContent = error.message
    } else {
      alert('Success')
    }
  }

}
