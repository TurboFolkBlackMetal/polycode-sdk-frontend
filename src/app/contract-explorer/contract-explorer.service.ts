import { Injectable } from '@angular/core'
import { Observable, of, switchMap, take, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { environment } from 'src/environments/env.base'
import { BackendHttpClient } from '../shared/services/backend/backend-http-client.service'
import { ContractManifestData, ContractMultiData } from '../shared/services/backend/contract-manifest.service'

@Injectable({
  providedIn: 'root',
})
export class ContractExplorerService {
  path = `${environment.backendURL}/api/blockchain-api/v1/import-smart-contract/preview`


  constructor(private http: BackendHttpClient) {

  }

  getContractPreview(contractAddress: string, chainID: string) {
    return this.http.get<ContractMultiData>(`${this.path}/${chainID}/contract/${contractAddress}`, { }, true, false, false)
  }

}

