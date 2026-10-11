import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyRd', standalone: true })
export class CurrencyRdPipe implements PipeTransform {
  transform(value: number | null | undefined, currencyCode = 'DOP'): string {
    if (value == null || Number.isNaN(value)) return '—';
    try {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
      }).format(value);
    } catch {
      return `RD$ ${value.toFixed(2)}`;
    }
  }
}
