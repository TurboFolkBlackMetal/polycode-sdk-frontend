import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { throws } from 'assert'
import { BehaviorSubject, catchError, Observable, of, take } from 'rxjs'
import { PreferenceQuery } from '../preference/state/preference.query'
import { ChainID, Networks } from '../shared/networks'
import { ContractManifestData } from '../shared/services/backend/contract-manifest.service'
import { DialogService } from '../shared/services/dialog.service'
import { easeInOutAnimation } from '../shared/utils/animations'
import { ContractExplorerService } from './contract-explorer.service'

@Component({
  selector: 'app-contract-explorer',
  templateUrl: './contract-explorer.component.html',
  styleUrls: ['./contract-explorer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: easeInOutAnimation
})
export class ContractExplorerComponent implements OnInit {

  contractFieldControl = new FormControl('', [
    Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')
  ])
  txLoadingSub = new BehaviorSubject(false)
  txLoading$ = this.txLoadingSub.asObservable()
  contract$: Observable<ContractManifestData | null> = of(null)
  networks = Object.values(Networks)
  currentNetwork = Networks[this.preferenceQuery.getValue().chainID]

  constructor(private explorerService: ContractExplorerService,
    private dialogService: DialogService,
    private preferenceQuery: PreferenceQuery) { }

  ngOnInit(): void {
    this.networkSelected(ChainID.ETHEREUM_MAINNET)
  }

  searchClicked() {
    this.txLoadingSub.next(true)
    this.explorerService.getContractPreview(
      this.contractFieldControl.value,
      this.currentNetwork.chainID.toString()
    ).pipe(
      catchError(err => {
          this.txLoadingSub.next(false)
          this.dialogService.error({
            title: err.statusText,
            message: err.error.message
          })
        return of(null)
      })
    ).subscribe(res => {
      this.txLoadingSub.next(false)
      this.contract$ = of(res!.decorator)
    })
  }

  networkSelected(chainID: ChainID) {
    this.currentNetwork = Networks[chainID]
    this.contractFieldControl.setValue('')
  }

  searchAgainClicked() {
    this.contract$ = of(null)
  }

}
