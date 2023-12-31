import { Injectable } from '@angular/core'
import { Observable, of, switchMap, take, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { PreferenceStore } from 'src/app/preference/state/preference.store'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  path = `${environment.backendURL}/api/blockchain-api/v1/projects`

  get apiKey() {
    return this.preferenceQuery.getValue().apiKey || ''
  }

  set apiKey(value: string) {
    this.preferenceStore.update({ apiKey: value })
  }

  get projectID() {
    return this.preferenceQuery.getValue().projectID
  }

  set projectID(value: string) {
    this.preferenceStore.update({ projectID: value })
  }

  constructor(
    private http: BackendHttpClient,
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore
  ) {}

  createNewProject(issuerContractAddress: string, redirectLink: string): Observable<ProjectModel> {

    return this.http.post<ProjectModel>(this.path, {
      issuer_contract_address: issuerContractAddress,
      base_redirect_url: redirectLink,
      chain_id: this.preferenceQuery.network.chainID,
    }).pipe(tap(res => { this.projectID = res.id }))
  }

  createApiKey(projectID: string): Observable<ApiKeyModel> {
    return this.http.post<ApiKeyModel>(`${this.path}/${projectID}/api-key`, {}, false, true, false).pipe(
      tap(result => this.saveApiKey(result.api_key))
    )
  }

  getProjectIdByChainAndAddress(): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(
      `${this.path}/by-chain/${this.preferenceQuery.network.chainID}/by-issuer/${this.preferenceQuery.issuer.address}`)
      .pipe(tap(res => { this.projectID = res.id }))
  }

  updateAPIKey(): Observable<boolean> {
    return this.getProjectIdByChainAndAddress().pipe(
      switchMap((project) => {
        return this.http.get<ApiKeyModel>(`${this.path}/${project.id}/api-key`)
      }),
      switchMap(apiKey => {
        if(apiKey.api_key.length > 0) {
          this.saveApiKey(apiKey.api_key)
          return of(true)
        } else {
          return of(false)
        }
      })
    )
  }

  fetchApiKey(): Observable<ApiKeyModel> {
    return this.getProjectIdByChainAndAddress().pipe(
      switchMap((project) =>
        this.http.get<ApiKeyModel>(`${this.path}/${project.id}/api-key`, undefined, false, false, true)
      ),
      take(1),
      switchMap(apiKey => {
        if(apiKey === undefined) {
          return this.http.post<ApiKeyModel>(`${this.path}/${this.projectID}/api-key`, {}, false, false, false).pipe(
            tap((_) => location.reload())
          )
        } else {
          this.saveApiKey(apiKey.api_key)
          return of(apiKey)
        }
      })
    )
  }

  createApiKeySet() {
     return this.getProjectIdByChainAndAddress().pipe(
      switchMap(project => this.http.post<ApiKeyModel>(`${this.path}/${this.projectID}/api-key`, {}, false, true, false)))
  }

  saveApiKey(value: string) {
    this.apiKey = value
  }
}

interface ProjectModel {
  id: string
  owner_id: string
  issuer_contract_address: string
  base_redirect_url: string
  chain_id: number
  custom_rpc_url: string
  created_at: string
}

export interface ApiKeyModel {
  id: string
  project_id: string
  api_key: string
  created_at: string
}
