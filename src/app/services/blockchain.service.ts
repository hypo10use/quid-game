import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ExplorerApi } from "../api/explorer.api";
import { Observable } from "rxjs";
import { NetworkState } from "../models/network-state";

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(private httpClient: HttpClient) {
  }

  getNetworkState(): Observable<NetworkState> {
    return this.httpClient.get<NetworkState>(ExplorerApi.NETWORK_STATE());
  }
}
