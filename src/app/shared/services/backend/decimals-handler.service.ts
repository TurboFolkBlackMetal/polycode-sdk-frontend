import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { map, Observable, of } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { BackendHttpClient } from './backend-http-client.service'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { ContractDeploymentService } from '../blockchain/contract-deployment.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
    name: 'decimals',
})
export class DecimalsPipe implements PipeTransform {

  constructor(
    private preferenceQuery: PreferenceQuery,
    private contractService: ContractDeploymentService
  ) {}


  transform(value: any, arg1: string, arg2: string): Observable<number | undefined> { 

    if(!value) { return of(undefined) }
    if(!arg1 || !arg2) { return of(value) }

    const origin = this.parseQuery(arg1)

    if(origin === DecimalsOrigin.Self) {
        return this.contractService.callReadOnlyFunction(arg2, {
            function_name: 'decimals',
            caller_address: this.preferenceQuery.getValue().address,
            function_params: [],
            output_params: ['uint256']
        }).pipe(map(res => res.return_values[0]))
    }
    return of(-1)

  }
  
  private parseQuery(query: string): DecimalsOrigin {
    const splitQuery = query.split('.')
    if(splitQuery.at(0) === '$this') {
        return DecimalsOrigin.Self
    }
    return DecimalsOrigin.Self
  }

}

enum DecimalsOrigin {
    Self,
    ByAddress,
    Fetch
}


