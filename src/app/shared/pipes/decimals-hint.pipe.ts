import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { map, Observable, of, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractDeploymentService, FunctionArgumentType } from '../services/blockchain/contract-deployment.service'
import { SignerService } from '../services/signer.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
    name: 'decimalsHint',
})
export class DecimalsHintPipe implements PipeTransform {

  constructor(
    private preferenceQuery: PreferenceQuery,
    private contractService: ContractDeploymentService,
    private signerService: SignerService
  ) {}


  transform(value: any, 
    arg1: string | undefined, 
    arg2: string | undefined, 
    params: { type: FunctionArgumentType, value: string }[] | undefined): Observable<string | undefined> { 

    if(!value) { return of(undefined) }
    if(!arg1 || !arg2) { return of(value) }

    const origin = this.parseQuery(arg1)

    if(origin === DecimalsOrigin.Self) {
        return this.getAndParseDecimals(arg2, value)
    } else if(origin === DecimalsOrigin.ByArgument) {
      const argPosition = Number.parseInt(arg1.split('.')[0].replace('$arg', ''))
      const param = params?.at(argPosition)
      if(param?.value) {
        return this.getAndParseDecimals(param.value, value)
      } else {
        return of(value)
      }
    }
    return of(value)

  }

  private getAndParseDecimals(contractID: string, value: any) {
    return this.getDecimals(contractID).pipe(
      map(decimals => {
        const decimalsAsNumber = Number.parseInt(decimals)
        return String(value / Math.pow(10, decimalsAsNumber))
      })
    )
  }

  private getDecimals(contractID: string) {
    if(contractID.startsWith('0x')) {
      return this.signerService.provider$.pipe(
        switchMap(contractAddress => {
          return this.signerService.provider$.pipe(
            switchMap(provider => {
              return provider.call({
                to: contractID,
                from: this.preferenceQuery.getValue().address,
                data: '0x313ce567'
              })
            })
          )
        })
      )
    } else {
      return this.contractService.getContractDeploymentRequest(contractID).pipe(
        map(res => { return res.contract_address }),
        switchMap(contractAddress => {
          return this.signerService.provider$.pipe(
            switchMap(provider => {
              return provider.call({ 
                to: contractAddress,
                from: this.preferenceQuery.getValue().address,
                data: '0x313ce567'
              })
            })
          )
        })
      )
    }
    // return this.contractService.callReadOnlyFunction(contractID, {
    //     function_name: 'decimals',
    //     caller_address: this.preferenceQuery.getValue().address,
    //     function_params: [],
    //     output_params: ['uint256']
    //   }).pipe(
    //     map(res => { return String(value / Math.pow(10, res.return_values[0])) } ),
    //   )
  }

  getDecimalsByAddress() {

  }
  
  private parseQuery(query: string): DecimalsOrigin {
    const splitQuery = query.split('.')
    if(splitQuery.at(0) === '$this') {
        return DecimalsOrigin.Self
    } else if(splitQuery.at(0)?.includes('$arg')) {
        return DecimalsOrigin.ByArgument
    }
    return DecimalsOrigin.Self
  }

}

enum DecimalsOrigin {
    Self,
    ByArgument,
    ByAddress,
    Fetch
}


