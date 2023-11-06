import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ChainID, Network, Networks } from '../../networks'
import { environment } from '../../../../environments/environment'
import { PreferenceQuery } from '../../../preference/state/preference.query'
import { PreferenceStore } from '../../../preference/state/preference.store'

/**
 * Only this component should be used for changing the networks.
 */
@Component({
  selector: 'app-select-network',
  templateUrl: './select-network.component.html',
  styleUrls: ['./select-network.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectNetworkComponent {
  networks = Object.values(Networks).sort((x,y) => {
    return (x.name > y.name) ? 1 : -1
  })
  currentNetwork = Networks[this.preferenceQuery.getValue().chainID]
  isNetworkFixed = !!environment.fixed.chainID

  constructor(
    private preferenceStore: PreferenceStore,
    private preferenceQuery: PreferenceQuery
  ) {}

  networkChanged(network: Network): void {
    this.currentNetwork = network
    let chainID = network.chainID
    this.preferenceStore.update({ chainID })
  }
}
