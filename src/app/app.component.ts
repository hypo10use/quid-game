import { Component } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Address, TokenType, WalletConnectionState, WalletService } from "./services/wallet.service";
import { Observable } from "rxjs";
import { FormControl, Validators } from "@angular/forms";
import { BlockchainService } from "./services/blockchain.service";
import { NetworkState } from "./models/network-state";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  walletConnectionState$: Observable<WalletConnectionState>;
  WALLET_CONNECTION_STATES: typeof WalletConnectionState = WalletConnectionState;
  balance: number = -1;
  address: FormControl = new FormControl(null, [Validators.required]);

  addresses: Address[] = [];
  selectedToken = TokenType.QUID;

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private walletService: WalletService, private blockchainService: BlockchainService) {
    this.blockchainService.getNetworkState().subscribe((networkState: NetworkState) => {
      console.log(networkState);
    });

    this.walletConnectionState$ = this.walletService.walletConnectionState$;

    this.walletConnectionState$.subscribe((state: WalletConnectionState) => {
      console.log(state);
      if (state === WalletConnectionState.CONNECTED) {
        this.walletService.getBalance(this.selectedToken).subscribe((balance: number) => {
          this.balance = balance;
        });
        this.walletService.getUsedAddresses().subscribe((addresses: Address[]) => {
          this.addresses = addresses;
        })
      }
    })

    this.matIconRegistry.addSvgIcon('circle', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/circle.svg'));
    this.matIconRegistry.addSvgIcon('triangle', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/triangle.svg'));
    this.matIconRegistry.addSvgIcon('rectangle', this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/rectangle.svg'));
  }

  connectWallet() {
    this.walletService.connectWallet();
  }
}
