import { Injectable, OnInit } from '@angular/core'
import { async } from '@angular/core/testing'
import { Observable, of, switchMap, take, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { environment } from 'src/environments/environment'
import { BackendHttpClient } from '../shared/services/backend/backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  path = `${environment.backendURL}/api/blockchain-api/v1/billing`

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore
  ) {}

  getAllSubscriptions(): Observable<AvailableSubscriptions> {
    return this.http.get<AvailableSubscriptions>(`${this.path}/available-plans`, { }, true, false, true)
  }

  createCustomer(email: string): Observable<void> {
    return this.http.post(`${this.path}/customer`, { email: email }, false, false, false)
  }

  createSubscription(priceID: string) {
    return this.http.post<any>(`${this.path}/subscriptions`, { price_id: priceID })
  }

  getUserSubscriptions() : Observable<UserSubscriptions> {
    return this.http.get<UserSubscriptions>(`${this.path}/subscriptions`, { }, false, false, false)
  }

}

export interface UserSubscriptions {
  subscriptions: UserSubscription[]
}

export interface UserSubscription {
  id: string,
  current_period_start: string,
  current_period_end: string,
  stripe_subscription_data: StripeSubscriptionData
}

export interface StripeSubscriptionData {
  status: 'incomplete' | 'active'
  items: StripeSubscriptionDataItems
}

export interface StripeSubscriptionDataItems {
  data: StripeSubscriptionDataItemsData[]
}

export interface StripeSubscriptionDataItemsData {
  price: StripeSubscriptionDataItemsPrice
}

export interface StripeSubscriptionDataItemsPrice {
  id: string
}

export interface AvailableSubscriptions {
    available_subscriptions: AvailableSubscription[]
}

export interface AvailableSubscription {
    id: string,
    name: string,
    description: string,
    read_requests: number,
    write_requests: number,
    prices: SubscriptionPrice[]
}

export interface SubscriptionPrice {
    id: string,
    currency: 'usd' | 'eur' | 'gbp' | 'jpy',
    amount: number,
    interval_type: IntervalType,
    interval_duration: number
}

type IntervalType = 'MONTH' | 'YEAR'