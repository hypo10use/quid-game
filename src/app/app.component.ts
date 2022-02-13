import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { TokenType, WalletConnectionState, WalletService } from "./services/wallet.service";
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NetworkState } from "./models/network-state";
import { Address, I64, TxBuilder } from "ergo-lib-wasm-browser";
import { Bet, BetService } from "./services/bet.service";
import { BlockchainService } from "./services/blockchain.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  walletConnectionState$: Observable<WalletConnectionState>;
  WALLET_CONNECTION_STATES: typeof WalletConnectionState = WalletConnectionState;
  balance: number = -1;
  betForm: FormGroup;
  bet: typeof Bet = Bet;

  addresses: Address[] = [];
  selectedToken = TokenType.NANOERG;
  placingBet: boolean = false;

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer, private fb: FormBuilder,
              private walletService: WalletService, private blockchainService: BlockchainService,
              private betService: BetService) {

    this.betForm = fb.group({
      address: [null, Validators.required],
      amount: [TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num(), [Validators.required, Validators.min(TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num())]],
      bet: [Bet.ODD]
    })

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
          if (addresses.length > 0) {
            this.betForm.patchValue({address: addresses[0]})
          }
        });
      }
    })

    this.matIconRegistry.addSvgIcon('circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/circle.svg'));
    this.matIconRegistry.addSvgIcon('triangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/triangle.svg'));
    this.matIconRegistry.addSvgIcon('rectangle',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/svg/rectangle.svg'));
  }

  get selectedAddress(): Address {
    return this.betForm.get('address')?.value;
  }

  ngOnInit(): void {
    this.connectWallet();
  }

  connectWallet() {
    this.walletService.connectWallet();
  }

  placeBet() {
    if (this.betForm.valid) {
      this.placingBet = true;
      this.betService.placeBet(I64.from_str(this.betForm.get('amount')?.value.toString()), this.betForm.get('address')?.value, this.betForm.get('bet')?.value).then(() => {

      }).catch((error) => console.error(error)).finally(() => this.placingBet = false);
    }
  }
}
