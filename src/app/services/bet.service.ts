import { Injectable } from '@angular/core';
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
  Transaction,
  TxBuilder
} from "ergo-lib-wasm-browser";
import { AssetI64, InputBoxYoroi, toUnsignedTransactionYoroi } from "../models/transaction";
import { TokenType, WalletService } from "./wallet.service";
import { NetworkState } from "../models/network-state";
import { BlockchainService } from "./blockchain.service";

export class Bet {
  public static readonly ODD: Bet = new Bet('odd');
  public static readonly EVEN: Bet = new Bet('even');

  private constructor(public id: string) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class BetService {

  constructor(private walletService: WalletService, private blockchainService: BlockchainService) {
  }

  async placeBet(amount: I64, address: Address, bet: Bet): Promise<void> {
    console.log('amount:', amount.as_num(), 'address:', address.to_base58(0), 'bet:', bet)
    const contract = `{"script": "sigmaProp(1 == 1)"}`;

    const asset: AssetI64 = {
      tokenId: TokenType.ERG.id,
      amount: amount.checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())
    }

    let inputBoxes: InputBoxYoroi[] = await this.walletService.get_utxos(asset).toPromise();

    const networkState: NetworkState = await this.blockchainService.getNetworkState().toPromise();
    const gameBoxAddress: Address = await this.blockchainService.getGameBoxAddress().toPromise();
    const selector: SimpleBoxSelector = new SimpleBoxSelector();

    const boxSelection: BoxSelection = selector.select(
      ErgoBoxes.from_boxes_json(inputBoxes),
      BoxValue.from_i64(asset.amount.checked_add(TxBuilder.SUGGESTED_TX_FEE().as_i64())),
      new Tokens()
    );

    const outputCandidates: ErgoBoxCandidates = ErgoBoxCandidates.empty();
    const donationBoxBuilder: ErgoBoxCandidateBuilder = new ErgoBoxCandidateBuilder(
      TxBuilder.SUGGESTED_TX_FEE(),
      Contract.pay_to_address(gameBoxAddress),
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

    try {
      const signed_tx: Transaction = await this.walletService.sign_tx(toUnsignedTransactionYoroi(txBuilder.build().to_js_eip12(), inputBoxes)).toPromise();
      const tx_id = await this.walletService.submit_tx(signed_tx).toPromise();
      console.log('Transaction: https://explorer.ergoplatform.com/en/transactions/' + tx_id)
    } catch (error) {
      console.error(error)
    }
  }
}
