export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

export const SUPPORTED_CURRENCIES = ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'SGD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
