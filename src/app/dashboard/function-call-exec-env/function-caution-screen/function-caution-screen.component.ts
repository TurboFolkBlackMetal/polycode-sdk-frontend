import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'

@Component({
  selector: 'app-function-caution-screen',
  templateUrl: './function-caution-screen.component.html',
  styleUrls: ['./function-caution-screen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionCautionScreenComponent {

  issuer$ = this.issuerService.issuer$

  constructor(private issuerService: IssuerService) { }

}
