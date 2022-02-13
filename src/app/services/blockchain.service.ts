import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ExplorerApi } from "../api/explorer.api";
import { Observable } from "rxjs";
import { NetworkState } from "../models/network-state";
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

  p2s(contract: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.httpClient.post(NodeApi.COMPILE(), contract, {headers: headers})
  }
}
