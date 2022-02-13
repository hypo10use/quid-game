import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from "rxjs";
import { Address, Transaction } from "ergo-lib-wasm-browser";
import { AssetI64, InputBoxYoroi, UnsignedTransactionYoroi } from "../models/transaction";
import { map } from "rxjs/operators";

export class TokenType {
  public static readonly ERG: TokenType = new TokenType('ERG', 'ERG', 1000 * 1000 * 1000);
  public static readonly NANOERG: TokenType = new TokenType('ERG', 'nERG', 1);
  public static readonly QUID: TokenType = new TokenType('264a662cbeca93c982796a578a6f69d59d25954126074f658db007ed52d1d679', 'QUID', 1);

  private constructor(public id: string, public name: string, public divider: number) {
  }
}

export enum WalletConnectionState {
  NOT_CONNECTED = 'NOT_CONNECTED', // initial state
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED'
}

interface ErgoWindow extends Window {
  ergo: ErgoAPI

  _ergo_rpc_call(string: string, arr: number[]): any

  ergo_request_read_access(): Promise<boolean>
}

export interface ErgoAPI {
  get_balance(token_id: string): Promise<number>,

  sign_tx(tx: UnsignedTransactionYoroi): Promise<Transaction>;

  submit_tx(tx: Transaction): Promise<string>;

  get_utxos(amount: string, token_id: string): Promise<InputBoxYoroi[]>;

  get_used_addresses(paginate?: Object): Promise<string[]>;

  get_change_address(): Promise<string>;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private _ergoWindow: ErgoWindow;
  private _ergo: ErgoAPI | undefined;

  private _walletConnectionState: BehaviorSubject<WalletConnectionState> = new BehaviorSubject<WalletConnectionState>(WalletConnectionState.NOT_CONNECTED)
  walletConnectionState$: Observable<WalletConnectionState> = this._walletConnectionState.asObservable();

  constructor() {
    this._ergoWindow = window as any;
  }

  connectWallet() {
    if (typeof this._ergoWindow.ergo_request_read_access === "undefined") {
      console.log("ergo not found")
    } else {
      console.log("ergo found")
      this._walletConnectionState.next(WalletConnectionState.CONNECTING);
      this._ergoWindow.ergo_request_read_access().then((access_granted: boolean) => {
        if (access_granted) {
          console.log("access granted")

          // @ts-ignore
          this._ergo = ergo;
          this._walletConnectionState.next(WalletConnectionState.CONNECTED);
        } else {
          console.log("access denied")
          this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
        }
      });
    }
  }

  getBalance(token: TokenType = TokenType.ERG): Observable<number> {
    if (this._ergo) {
      return from(this._ergo.get_balance(token.id));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }

  getChangeAddress(): Observable<Address> {
    if (this._ergo) {
      return from(this._ergo.get_change_address()).pipe(map(s => Address.from_base58(s)));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }

  get_utxos(asset: AssetI64): Observable<InputBoxYoroi[]> {
    if (this._ergo) {
      return from(this._ergo.get_utxos(asset.amount.to_str(), asset.tokenId));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }

  sign_tx(tx: UnsignedTransactionYoroi): Observable<Transaction> {
    if (this._ergo) {
      return from(this._ergo.sign_tx(tx));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }

  submit_tx(tx: Transaction): Observable<string> {
    if (this._ergo) {
      return from(this._ergo.submit_tx(tx));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }

  getUsedAddresses(): Observable<Address[]> {
    if (this._ergo) {
      return from(this._ergo.get_used_addresses()).pipe(map(addresses => addresses.map(address => Address.from_base58(address))));
    }
    this._walletConnectionState.next(WalletConnectionState.DISCONNECTED);
    throw 'Wallet not initialized';
  }
}
