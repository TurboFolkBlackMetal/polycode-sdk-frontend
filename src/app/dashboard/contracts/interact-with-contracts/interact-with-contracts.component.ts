import { Location } from '@angular/common'
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, from, map, Observable, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ContractManifestService, FunctionManifest } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { easeInOutAnimation } from 'src/app/shared/utils/animations'

@Component({
  selector: 'app-interact-with-contracts',
  templateUrl: './interact-with-contracts.component.html',
  styleUrls: ['./interact-with-contracts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: easeInOutAnimation
})
export class InteractWithContractsComponent {

  contractManifestID =        this.route.snapshot.params.manifestID
  contractDeploymentID =      this.route.snapshot.params.deployedID
  selectedIndexSub =          new BehaviorSubject(-1)
  selectedIndex$ =            this.selectedIndexSub.asObservable()
  formFinishedLoadingSub =    new BehaviorSubject(false)
  currentTab =                new BehaviorSubject<TabType>("contracts")
  currentTab$ =               this.currentTab.asObservable()
  contractTokenBalanceForm =  new FormGroup({})

  
  formFinishedLoadingSubContractTokenBalance = new BehaviorSubject(false)
  deployedContract$ = this.deploymentService.getContractDeploymentRequest(this.contractDeploymentID)

  getERC20FunctionManifest: FunctionManifest = {
    name: 'Get ERC20 balance of this contract',
    description: 'Contracts can be owners of ERC20 tokens. Use this utility function to find ERC20 balance of this smart contract',
    inputs: [
      { 
        name: 'Token address', 
        description: 'The address of the ERC20 token of which you are checking the balance',
        recommended_types: ['traits.erc20'],
        solidity_name: 'balance',
        solidity_type: 'address'
      }
    ],
    outputs: [
      {
        name: 'Token balance',
        description: 'Balance of ERC20 tokens',
        recommended_types: [],
        solidity_name: '',
        solidity_type: 'uint256'
      }
    ],
    read_only: true,
    solidity_name: 'balance'
  }
  
  contract$ = this.deployedContract$.pipe(
    switchMap(res => {
      if(res.imported) {
        return this.manifestService.getByID(this.contractManifestID, this.projectService.projectID)
      } else {
        return this.manifestService.getByID(this.contractManifestID)
      }
    })
  )

  formGroups$: Observable<FormGroup[]> = this.contract$.pipe(
    map(result => {
      let groups: FormGroup[] = []

      result.functions.forEach(func => {
        let group = new FormGroup({})
        func.inputs.forEach((input, index) => { 
          group.addControl(index.toString(), new FormControl('')) 
        })
        groups.push(group)
      })

      return groups
    }),
    tap(_ => this.formFinishedLoadingSub.next(true))
  )

  changeTab(type: TabType) {
    this.currentTab.next(type)
  }

  checkContractERC20Balance(contractID: string, tokenAddress: string) {
    this.deploymentService.callReadOnlyFunction(contractID, {
      caller_address: this.preferenceQuery.getValue().address,
      function_name: '',
      function_params: [],
      output_params: [],
      block_number: 12
    })
  }

  resultsBufferSub: BehaviorSubject<Map<string, string[]>> = new BehaviorSubject(new Map<string, string[]>())
  resultsBuffer$ = this.resultsBufferSub.asObservable()

  routeRoot = window.location.href.split("/")[0] 
    + "//" + window.location.href.split("/")[2]

  constructor(private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService,
    private location: Location,
    private projectService: ProjectService,
    private preferenceQuery: PreferenceQuery,
    private route: ActivatedRoute
  ) { }

  setSelectedIndex(i: number) {
    if(this.selectedIndexSub.value !== i) {
      this.selectedIndexSub.next(i)
    } else {
      this.selectedIndexSub.next(-1)
    }
  }

  goBack() {
    this.location.back()
  }

}

type TabType = "contracts" | "utilities"