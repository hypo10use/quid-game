import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ExplorerApi } from "../api/explorer.api";
import { Observable } from "rxjs";
import { NetworkState } from "../models/network-state";
import {
  Address,
  BoxValue,
  Contract,
  ErgoBox,
  ErgoBoxCandidateBuilder,
  ErgoBoxCandidates,
  ErgoBoxes,
  SimpleBoxSelector,
  Tokens,
  TxBuilder,
  UnsignedTransaction
} from "ergo-lib-wasm-browser";
import { WalletService } from "./wallet.service";
import * as JSONBigInt from 'json-bigint';
import { NodeApi } from "../api/node.api";


@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(private httpClient: HttpClient, private walletService: WalletService) {
    console.log(TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str())
  }

  getNetworkState(): Observable<NetworkState> {
    return this.httpClient.get<NetworkState>(ExplorerApi.NETWORK_STATE());
  }

  p2s(contract: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    console.log(headers)
    return this.httpClient.post(NodeApi.COMPILE(), contract, {headers: headers})
  }

  async placeBet() {
    const contract = `{"script": "sigmaProp(1 == 1)"}`;

    let have = JSON.parse(JSON.stringify({
      "ERG": 1,
    }))
    have['ERG'] += TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str()

    console.log('fee', TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str())
    console.log('have', have)

    const keys = Object.keys(have);
    let ins: any[] = []
    for (let i = 0; i < keys.length; i++) {
      if (have[keys[i]] <= 0) continue
      const curIns = await this.walletService.get_utxos(have[keys[i]].toString(), keys[i]).toPromise();
      if (curIns !== undefined) {
        ins = ins.concat(curIns)
      }
    }

    this.walletService.getChangeAddress().subscribe(address => {
      let addr = address;
      let addr2 = "9gv4CVNsd181sZxyDyaBaUxPuuxkBJcpcz6VfaVxwhVyWN7aWe5"
      this.getNetworkState().subscribe((networkState: NetworkState) => {
        this.p2s(contract).subscribe((fetchContract) => {
          console.log(fetchContract.address)
          console.log(Address.from_mainnet_str(fetchContract.address).to_ergo_tree().to_base16_bytes())

          console.log(fetchContract)

          const amountToSendBoxValue = TxBuilder.SUGGESTED_TX_FEE();
          const selector = new SimpleBoxSelector();

          console.log(BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())).as_i64().to_str())
          console.log(ins)
          const boxSelection = selector.select(
            ErgoBoxes.from_boxes_json(ins),
            BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())),
            new Tokens());
          console.log(boxSelection.boxes())

          const outputCandidates = ErgoBoxCandidates.empty();
          const donationBoxBuilder = new ErgoBoxCandidateBuilder(
            amountToSendBoxValue,
            Contract.pay_to_address(Address.from_base58(addr2)),
            networkState.height);
          try {
            outputCandidates.add(donationBoxBuilder.build());
          } catch (e) {
            console.log(`building error: ${e}`);
            throw e;
          }

          console.log('outputCandidates', outputCandidates)

          const txBuilder = TxBuilder.new(
            boxSelection,
            outputCandidates,
            networkState.height,
            TxBuilder.SUGGESTED_TX_FEE(),
            Address.from_base58(addr),
            BoxValue.SAFE_USER_MIN()
          );

          const tx = txBuilder.build().to_json();
          console.log('tx', tx)

          // const correctTx = JSONBigInt.parse(UnsignedTransaction.from_json(JSON.stringify(tx)).to_json());
          let tx2 = JSONBigInt.parse(UnsignedTransaction.from_json(tx).to_json())
          //console.log(correctTx)
          tx2.inputs = tx2.inputs.map((box: { boxId: ErgoBox; }) => {
            console.log(`box: ${JSON.stringify(box)}`);
            const fullBoxInfo = ins.find(utxo => utxo.boxId === box.boxId);
            return {
              ...fullBoxInfo,
              extension: {}
            };
          });
          tx2.outputs[0].value = tx2.outputs[0].value.toString()
          tx2.outputs[1].value = tx2.outputs[1].value.toString()
          tx2.outputs[2].value = tx2.outputs[2].value.toString()
          // tx2.outputs[1].assets[0].amount = tx2.outputs[1].assets[0].amount.toString()
          console.log('unsigned_tx', tx2);

          this.walletService.sign_tx(tx2).subscribe((signed) => {
            console.log('signed', signed)
            this.walletService.submit_tx(signed).subscribe((txId) => {
              console.log('Yoroi tx id', txId)
            }, error => {
              console.log(error)
              console.log('Error while sending funds from Yoroi!')
            });
          }, error => {
            console.log(error)
            console.log('Error while signing')
          });
        });
      })
    })
  }
}
