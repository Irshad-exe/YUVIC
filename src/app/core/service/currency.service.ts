// services/currency.service.ts
import { Injectable, signal,effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap } from 'rxjs';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate?: number; // Exchange rate relative to base currency
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private baseCurrency = signal<string>('USD');
  private availableCurrencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.33 },
    // Add more currencies as needed
  ];

  currencies = signal<Currency[]>(this.availableCurrencies);
  currentCurrency = signal<Currency>(this.availableCurrencies[0]);

  constructor(private http: HttpClient) {
    this.initialize();
    effect(() => {
      const currency = this.currentCurrency();
      console.log('Currency changed to:', currency.code);
    });
    
  }
  initialize() {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && this.availableCurrencies.some(c => c.code === savedCurrency)) {
      this.setCurrency(savedCurrency);
    } else {
      // Set default currency
      this.setCurrency(this.baseCurrency());
    }
    this.loadExchangeRates();
  }
  private loadExchangeRates() {
    // Example using a free API (you might need to use a paid service for production)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${this.baseCurrency()}`;
    
    this.http.get<any>(apiUrl).pipe(
      map(response => {
        return this.availableCurrencies.map(currency => {
          return {
            ...currency,
            rate: response.rates[currency.code] || 1
          };
        });
      }),
      tap(currencies => this.currencies.set(currencies)),
      catchError(error => {
        console.error('Failed to load exchange rates:', error);
        return of(this.availableCurrencies); // Fallback to default rates
      })
    ).subscribe();
  }

  setCurrency(currencyCode: string) {
    console.log("Setting currency to:", currencyCode);
    const currency = this.currencies().find(c => c.code === currencyCode);
    if (currency) {
      this.currentCurrency.set(currency);
      localStorage.setItem('preferredCurrency', currencyCode);
    }
  }

  convertPrice(price: number, toCurrency?: string): number {
    const targetCurrency = toCurrency 
      ? this.currencies().find(c => c.code === toCurrency) 
      : this.currentCurrency();
    
    if (!targetCurrency || !targetCurrency.rate) return price;
    
    // Convert from base currency to target currency
    return price * (targetCurrency.rate || 1);
  }

  formatPrice(price: number, currencyCode?: string): string {
    console.log("price", price);
    console.log("currencyCode", currencyCode);
    const currency = currencyCode 
      ? this.currencies().find(c => c.code === currencyCode) 
      : this.currentCurrency();
    
    if (!currency) return price.toString();
    
    const convertedPrice = this.convertPrice(price, currency.code);
    console.log("convertedPrice", convertedPrice);
    // Use Intl.NumberFormat for proper formatting
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedPrice);
  }

 
}