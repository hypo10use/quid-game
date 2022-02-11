export interface NetworkState {
  lastBlockId: string;
  height: number;
  maxBoxGix: number;
  maxTxGix: number;
  params: {
    height: number;
    storageFeeFactor: number;
    minValuePerByte: number;
    maxBlockSize: number;
    maxBlockCost: number;
    blockVersion: number;
    tokenAccessCost: number;
    inputCost: number;
    dataInputCost: number;
    outputCost: number;
  };
}

