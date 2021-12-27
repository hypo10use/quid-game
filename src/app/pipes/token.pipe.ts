import { Pipe, PipeTransform } from '@angular/core';
import { TokenType } from "../services/wallet.service";

@Pipe({
  name: 'token'
})
export class TokenPipe implements PipeTransform {
  transform(value: number, token: TokenType): string {
    return (value / token.divider).toString();
  }
}
