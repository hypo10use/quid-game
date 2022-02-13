import { Pipe, PipeTransform } from '@angular/core';
import { Address } from "ergo-lib-wasm-browser";

@Pipe({
  name: 'address'
})
export class AddressPipe implements PipeTransform {

  transform(address: Address, length: number = 10): string {
    if (address) {
      return address.to_base58(0).substring(0, length);
    }
    return "";
  }
}
