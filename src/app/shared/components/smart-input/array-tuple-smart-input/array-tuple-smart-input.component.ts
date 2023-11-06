import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BehaviorSubject, delay, filter, map, tap } from 'rxjs'
import { ContractManifestService, FunctionManifest } from 'src/app/shared/services/backend/contract-manifest.service'

@Component({
  selector: 'app-array-tuple-smart-input',
  templateUrl: './array-tuple-smart-input.component.html',
  styleUrls: ['./array-tuple-smart-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayTupleSmartInputComponent implements OnInit {

  tupleArrayForm = new FormGroup({})

  @Input() manifest!: FunctionManifest

  formFinishedLoadingSub = new BehaviorSubject(false)
  @Input() addedListItemSub = new BehaviorSubject<string[][]>([])
  
  successMessageDisplaySub = new BehaviorSubject(false)
  successMessageDisplay$ = this.successMessageDisplaySub.asObservable()

  constructor(private manifestService: ContractManifestService) { 
    
  }

  ngOnInit(): void {
    this.manifest.inputs.at(0)?.parameters?.forEach(res => {
      this.tupleArrayForm.addControl(res.solidity_name, new FormControl('', [Validators.required]))
    })
    this.formFinishedLoadingSub.next(true)
  }

  addToListClicked() {
    const values = this.manifest.inputs.at(0)?.parameters?.map(res => {
      return this.tupleArrayForm.get(res.solidity_name)?.value as string
    })
    if(values !== undefined) {
      let modValues = this.addedListItemSub.getValue()
      modValues.push(values!)
      this.addedListItemSub.next(modValues!)
      this.tupleArrayForm.reset()
      this.successMessageDisplaySub.next(true)
    }
  }

}
