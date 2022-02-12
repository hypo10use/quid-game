import { I64 } from "ergo-lib-wasm-browser";

export function toUnsignedTransactionYoroi(unsignedTransactionEIP12: UnsignedTransactionEIP12, inputBoxes: InputBoxYoroi[]): UnsignedTransactionYoroi {
  const inputs: InputBoxYoroi[] = [];

  for (let inputBoxEIP12 of unsignedTransactionEIP12.inputs) {
    const inputBoxYoroi: undefined | InputBoxYoroi = inputBoxes.find((inputBoxYoroi: InputBoxYoroi) => inputBoxYoroi.boxId === inputBoxEIP12.boxId);
    if (inputBoxYoroi) {
      inputs.push({
        ...inputBoxYoroi,
        extension: inputBoxEIP12.extension
      })
    }
  }

 const unsignedTransactionYoroi: UnsignedTransactionYoroi =  {
    dataInputs: unsignedTransactionEIP12.data_inputs,
    inputs: inputs,
    outputs: unsignedTransactionEIP12.outputs
  }
  console.log(unsignedTransactionYoroi);
  return unsignedTransactionYoroi;
}

export interface UnsignedTransactionEIP12 {
  inputs: InputBoxEIP12[];
  data_inputs: any[];
  outputs: OutputBox[];
}

export interface InputBoxEIP12 {
  boxId: string;
  extension: Extension;
}

export interface Extension {
}

export interface UnsignedTransactionYoroi {
  inputs: InputBoxYoroi[];
  dataInputs: any[];
  outputs: OutputBox[];
}

export interface InputBoxYoroi {
  boxId: string;
  value: string;
  ergoTree: string;
  assets: Asset[];
  creationHeight: number;
  additionalRegisters: AdditionalRegisters;
  transactionId: string;
  index: number;
  extension: Extension;
}

export interface AdditionalRegisters {
}

export interface OutputBox {
  value: string;
  ergoTree: string;
  assets: Asset[];
  additionalRegisters: AdditionalRegisters;
  creationHeight: number;
}

export interface Asset {
  amount: string;
  tokenId: string;
}

export interface AssetI64 {
  amount: I64;
  tokenId: string;
}

