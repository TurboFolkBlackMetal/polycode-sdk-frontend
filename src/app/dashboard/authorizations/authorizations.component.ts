import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { BehaviorSubject, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service'
import { SendRequestStatus } from 'src/app/request-send/request-send.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { AuthorizationsService } from './authorizations.service'

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.component.html',
  styleUrls: ['./authorizations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationsComponent implements OnInit {

  constructor(private requestBalanceService: RequestBalanceService,
    private authorizationService: AuthorizationsService,
    private preferenceQuery: PreferenceQuery,
    private projectService: ProjectService) { }

  activeTab = Tab.Manage
  tabType = Tab

  authRequestStatusType = SendRequestStatus
  
  authRequests$ = this.authorizationService.fetchWalletAuthRequestsForProject(
    this.projectService.projectID
  )

  changeTabSub = new BehaviorSubject<Tab>(Tab.Manage)
  changeTab$ = this.changeTabSub.asObservable().pipe(
    tap(newTab => this.activeTab = newTab)
  )

  ngOnInit(): void {
    this.authRequests$.subscribe(res => {
      console.log("AUTH REQUESTS: " + res)
    })
  }

  changeTab(tab: Tab) {
    this.activeTab = tab
  }
}

export enum Tab {
  Manage, 
  New
}