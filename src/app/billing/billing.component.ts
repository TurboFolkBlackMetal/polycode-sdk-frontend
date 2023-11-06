import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs'
import { SessionQuery } from '../session/state/session.query'
import { DialogService } from '../shared/services/dialog.service'
import { SignerService } from '../shared/services/signer.service'
import { BillingService } from './billing.service'
import { ethers } from 'ethers'


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {

  constructor(private route: ActivatedRoute) { }

  aapxSwapperAddress = '0x1096998f9531DE5cbF43A772dCa38c17E7F7dFD1'

  readRemainingTx() {
  }
}
