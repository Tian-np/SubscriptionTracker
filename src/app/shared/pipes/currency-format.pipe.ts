import { Pipe, PipeTransform } from '@angular/core';

import { formatCurrency } from '../../core/utils/currency.util';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(amount: number, currency = 'THB'): string {
    return formatCurrency(amount, currency);
  }
}
