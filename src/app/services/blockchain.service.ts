import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ExplorerApi } from "../api/explorer.api";
import { Observable, of } from "rxjs";
import { NetworkState } from "../models/network-state";
import {
  Address,
  BoxSelection,
  BoxValue,
  Contract,
  ErgoBoxCandidateBuilder,
  ErgoBoxCandidates,
  ErgoBoxes,
  I64,
  SimpleBoxSelector,
  Tokens,
  TxBuilder
} from "ergo-lib-wasm-browser";
import { TokenType, WalletService } from "./wallet.service";
import { NodeApi } from "../api/node.api";
import { AssetI64, InputBoxYoroi, toUnsignedTransactionYoroi } from "../models/transaction";


@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(private httpClient: HttpClient, private walletService: WalletService) {
  }

  getNetworkState(): Observable<NetworkState> {
    return this.httpClient.get<NetworkState>(ExplorerApi.NETWORK_STATE());
  }

  p2s(contract: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.httpClient.post(NodeApi.COMPILE(), contract, {headers: headers})
  }

  async placeBet(amount: I64) {
    const contract = `{"script": "sigmaProp(1 == 1)"}`;

    const asset: AssetI64 = {
      tokenId: TokenType.ERG.id,
      amount: amount.checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())
    }

    let ins: InputBoxYoroi[] = await this.walletService.get_utxos(asset).toPromise();

    this.walletService.getChangeAddress().subscribe((address: Address) => {
      let addr2: Address = Address.from_base58('9gv4CVNsd181sZxyDyaBaUxPuuxkBJcpcz6VfaVxwhVyWN7aWe5');
      this.getNetworkState().subscribe((networkState: NetworkState) => {
        this.p2s(contract).subscribe((fetchContract) => {
          const amountToSendBoxValue: BoxValue = TxBuilder.SUGGESTED_TX_FEE();
          const selector: SimpleBoxSelector = new SimpleBoxSelector();

          const boxSelection: BoxSelection = selector.select(
            ErgoBoxes.from_boxes_json(ins),
            BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())),
            new Tokens());

          const outputCandidates: ErgoBoxCandidates = ErgoBoxCandidates.empty();
          const donationBoxBuilder: ErgoBoxCandidateBuilder = new ErgoBoxCandidateBuilder(
            amountToSendBoxValue,
            Contract.pay_to_address(addr2),
            networkState.height);
          try {
            outputCandidates.add(donationBoxBuilder.build());
          } catch (e) {
            console.error(`building error: ${e}`);
            throw e;
          }

          const txBuilder = TxBuilder.new(
            boxSelection,
            outputCandidates,
            networkState.height,
            TxBuilder.SUGGESTED_TX_FEE(),
            address,
            BoxValue.SAFE_USER_MIN()
          );

          this.walletService.sign_tx(toUnsignedTransactionYoroi(txBuilder.build().to_js_eip12(), ins)).subscribe((signed) => {
            this.walletService.submit_tx(signed).subscribe((txId) => {
              console.log('Transaction: https://explorer.ergoplatform.com/en/transactions/' + txId)
            }, error => {
              console.error(error)
              console.error('Error while sending funds from Yoroi!')
            });
          }, error => {
            console.error(error)
            console.error('Error while signing')
          });
        });
      })
    })
  }
}
