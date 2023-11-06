import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { switchMap, tap } from 'rxjs'
import { IssuerService, IssuerWithInfo } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { MagicSubsignerService } from 'src/app/shared/services/subsigners/magic-subsigner.service'

@Component({
  selector: 'app-third-party-integrations-overview',
  templateUrl: './third-party-integrations-overview.component.html',
  styleUrls: ['./third-party-integrations-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyIntegrationsOverviewComponent {

  magicLinkAPIKeyForm = new FormControl('', [Validators.required])
  rampApiKeyControl = new FormControl('', [Validators.required])
  crispApiKeyControl = new FormControl('', [Validators.required])

  issuer$ = this.issuerService.issuer$.pipe(
    tap(res => {
      this.magicLinkAPIKeyForm.setValue(res.infoData.magicLinkApiKey)
      this.crispApiKeyControl.setValue(res.infoData.crispWebsiteId)
      this.rampApiKeyControl.setValue(res.infoData.rampApiKey)
    })
  )
  apiKey$ = this.magicSubsigner.apiKey$

  constructor(private issuerService: IssuerService,
    private dialogService: DialogService,
    private magicSubsigner: MagicSubsignerService) {}

  updateMagicAPIKey(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService.uploadInfo({
        crispWebsiteId: issuer.infoData.crispWebsiteId,
        magicLinkApiKey: this.magicLinkAPIKeyForm.value,
        name: issuer.infoData.name,
        rampApiKey: issuer.infoData.rampApiKey
      }).pipe(
        switchMap( res => this.issuerService.updateInfo(issuer.contractAddress, res.path)),
        tap(_ => this.dialogService.success({ title: 'Success!', message: 'Updated Magic API Key.' }))
      )
    } 
  }

  updateRampAPIKey(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService.uploadInfo({
        crispWebsiteId: issuer.infoData.crispWebsiteId,
        magicLinkApiKey: issuer.infoData.magicLinkApiKey,
        name: issuer.infoData.name,
        rampApiKey: this.rampApiKeyControl.value
      }).pipe(
        switchMap(res => this.issuerService.updateInfo(issuer.contractAddress, res.path)),
        tap(_ => this.dialogService.success({ title: 'Success!', message: 'Updated Ramp API Key'}))
      )
    }
  }

  updateCrispAPIKey(issuer: IssuerWithInfo) {
    return () => {
      return this.issuerService.uploadInfo({
        crispWebsiteId: this.crispApiKeyControl.value,
        magicLinkApiKey: issuer.infoData.magicLinkApiKey,
        name: issuer.infoData.name,
        rampApiKey: this.rampApiKeyControl.value
      }).pipe(
        switchMap(res => this.issuerService.updateInfo(issuer.contractAddress, res.path)),
        tap(_ => this.dialogService.success({ title: 'Success!', message: 'Updated Ramp API Key'}))
      )
    }
  }

  
}
