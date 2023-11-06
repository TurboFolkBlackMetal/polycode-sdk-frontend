import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { SignerService } from 'src/app/shared/services/signer.service'
import { UserService } from 'src/app/shared/services/user.service'
import { AuthorizationsService, WalletAuthData } from '../authorizations.service'

@Component({
  selector: 'app-authorization-exec-env',
  templateUrl: './authorization-exec-env.component.html',
  styleUrls: ['./authorization-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationExecEnvComponent {

  issuer$ = this.issuerService.issuer$
  address$ = this.preferenceQuery.address$
  authRequest$ = this.getAuthRequest()
  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(private issuerService: IssuerService,
    private preferenceQuery: PreferenceQuery,
    private route: ActivatedRoute,
    private sessionQuery: SessionQuery,
    private userService: UserService,
    private signerService: SignerService,
    private authService: AuthorizationsService) { }


  getAuthRequest() {
    return this.authService.fetchWalletAuthRequest(
      this.route.snapshot.params.id
    )
  }

  logout() {
    return () => {
      return this.signerService.logout()
    }
  }

  authorizeButtonClicked(request: WalletAuthData) {
    return () => {
      return this.signerService.signMessage(request.message_to_sign).pipe(
        switchMap(result => this.authService.attachSignedMessageToRequest(request.id, result, 
          this.preferenceQuery.getValue().address)),
        tap(_ => {
          this.authRequest$ = this.getAuthRequest()
        })
      )
    }
  }

  closeTabClicked() {
    window.close()
  }

}
