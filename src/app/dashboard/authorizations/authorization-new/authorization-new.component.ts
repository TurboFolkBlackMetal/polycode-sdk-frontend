import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, forkJoin, Observable, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service'
import { AssetType } from 'src/app/request-send/request-send.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { UserService } from 'src/app/shared/services/user.service'
import { Tab } from '../authorizations.component'
import { AuthorizationsService, WalletAuthData } from '../authorizations.service'

@Component({
  selector: 'app-authorization-new',
  templateUrl: './authorization-new.component.html',
  styleUrls: ['./authorization-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationNewComponent {


  newAuthRequestForm = new FormGroup({
    beforeMessage: new FormControl(),
    afterMessage: new FormControl(),
    requestsAmount: new FormControl(1, [Validators.min(1)])
  })

  constructor(private balanceService: RequestBalanceService,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private authSerivice: AuthorizationsService,
    private dialogService: DialogService) { }


  submitClicked() {
    return () => {
      const beforeMessage = this.newAuthRequestForm.controls.beforeMessage.value
      const afterMessage = this.newAuthRequestForm.controls.afterMessage.value

      const requestsAmount = this.newAuthRequestForm.controls.requestsAmount.value

      if(requestsAmount === 1) {
        return this.authSerivice.generateMessagePayload().pipe(
          switchMap(result => this.authSerivice.createWalletAuthRequest(result.payload, beforeMessage, afterMessage)),
          tap(_ => this.dialogService.success({ message: "Successfully created a new authorization request." }))
        )
      } else {

        let createWalletRequests$: Observable<WalletAuthData>[] = []
        for(let i = 0; i < requestsAmount; i++) {
          createWalletRequests$.push(this.authSerivice.generateMessagePayload().pipe(
            switchMap(result => this.authSerivice.createWalletAuthRequest(result.payload, beforeMessage, afterMessage))
          ))
        }
        return forkJoin(createWalletRequests$).pipe(
          tap(_ => this.dialogService.success({ message: `Successfully created ${requestsAmount} authorization requests`}))
        )
      }
      
    }
  }

}
