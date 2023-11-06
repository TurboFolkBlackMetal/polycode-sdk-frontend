import { Injectable } from '@angular/core'
import { ScreenConfig } from 'dev3-sdk/dist/core/types'
import { Observable, of, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class AuthorizationsService {
  path = `${environment.backendURL}/api/blockchain-api/v1/wallet-authorization`
  identityPath = `${environment.backendURL}/api/identity`

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore
  ) {}

  createWalletAuthRequest(messageToSign: string, beforeActionMessage: string, afterActionMessage: string) {
        return this.http.post<WalletAuthData>(`${this.path}`, 
            {
                message_to_sign: messageToSign,
                screen_config: {
                  before_action_message: beforeActionMessage,
                  after_action_message: afterActionMessage
                }
            }, false, true, true)
  }

  fetchWalletAuthRequestsForProject(projectID: string) {
        return this.http
            .get<WalletAuthsData>(`${this.path}/by-project/${projectID}`, 
                undefined, false, true, true)
  }

  fetchWalletAuthRequest(id: string) {
    return this.http
        .get<WalletAuthData>(`${this.path}/${id}`, undefined, true, false, true)
  }

  generateMessagePayload() {
    return this.http.post<{ payload: string }>(`${this.identityPath}/authorize/by-message`, { }, true,
        true, false)
  }

  attachSignedMessageToRequest(requestID: string, signedMessage: string, address: string) {
    return this.http.put(`${this.path}/${requestID}`, {
      wallet_address: address,
      signed_message: signedMessage
    }, true, true)
  }

}

interface WalletAuthsData {
    requests: WalletAuthData[]
}

interface WalletAuthRequestData {
    redirect_url: string,
    wallet_address: string,
    arbitrary_data: any
    screen_config: ScreenConfig
}

export interface WalletAuthData {
    id: string,
    project_id: string,
    status: string,
    redirect_url: string,
    wallet_address: string,
    message_to_sign: string
    signed_message: string
    screen_config: ScreenConfig
    created_at: string
}
