// pipes/price.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../core/service/currency.service';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number, currencyCode?: string): string {
    console.log("currencyCode1111",value);
    console.log("currencyCode",currencyCode);
    return this.currencyService.formatPrice(value, currencyCode);
  }
}