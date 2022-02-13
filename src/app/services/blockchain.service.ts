import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ExplorerApi } from "../api/explorer.api";
import { Observable } from "rxjs";
import { NetworkState } from "../models/network-state";
import { Address } from "ergo-lib-wasm-browser";
import { map } from "rxjs/operators";
import { NodeApi } from "../api/node.api";


@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(private httpClient: HttpClient) {
  }

  getNetworkState(): Observable<NetworkState> {
    return this.httpClient.get<NetworkState>(ExplorerApi.NETWORK_STATE());
  }

  getGameBoxAddress(): Observable<Address> {
    return this.httpClient.get(NodeApi.GET_GAME_BOX_ADDRESS(), {responseType: 'text'}).pipe(map(s => Address.from_base58(s)))
  }
}
