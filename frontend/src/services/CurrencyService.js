export class CurrencyService {
  // Base price in CAD
  static BASE_PRICE_CAD = 12.99;
  
  // Simplified exchange rates (in production, you'd use a real API like exchangerate-api.io)
  static EXCHANGE_RATES = {
    'CAD': 1.0,     // Base currency
    'USD': 0.74,    // 1 CAD = 0.74 USD (approximate)
    'EUR': 0.68,    // 1 CAD = 0.68 EUR (approximate)
    'GBP': 0.58,    // 1 CAD = 0.58 GBP (approximate)
    'AUD': 1.07,    // 1 CAD = 1.07 AUD (approximate)
    'JPY': 107.5,   // 1 CAD = 107.5 JPY (approximate)
    'CNY': 5.2,     // 1 CAD = 5.2 CNY (approximate)
    'INR': 61.5,    // 1 CAD = 61.5 INR (approximate)
    'BRL': 3.8,     // 1 CAD = 3.8 BRL (approximate)
    'MXN': 13.2,    // 1 CAD = 13.2 MXN (approximate)
  };
  
  // Currency symbols
  static CURRENCY_SYMBOLS = {
    'CAD': '$',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': '$',
  };
  
  /**
   * Convert the base CAD price to user's currency
   * @param {string} currencyCode - Target currency code (e.g., 'USD', 'EUR')
   * @returns {object} - {amount, symbol, currencyCode, formatted}
   */
  static convertPrice(currencyCode = 'USD') {
    try {
      console.log('💰 CurrencyService: Converting price to', currencyCode);
      
      // Default to USD if currency not supported
      const targetCurrency = currencyCode.toUpperCase();
      const rate = this.EXCHANGE_RATES[targetCurrency] || this.EXCHANGE_RATES['USD'];
      const symbol = this.CURRENCY_SYMBOLS[targetCurrency] || this.CURRENCY_SYMBOLS['USD'];
      const finalCurrency = this.EXCHANGE_RATES[targetCurrency] ? targetCurrency : 'USD';
      
      // Calculate converted price
      const convertedAmount = this.BASE_PRICE_CAD * rate;
      
      // Format based on currency
      let formattedAmount;
      if (['JPY', 'CNY', 'INR'].includes(finalCurrency)) {
        // No decimals for currencies that don't typically use them
        formattedAmount = Math.round(convertedAmount);
      } else {
        // 2 decimal places for most currencies
        formattedAmount = convertedAmount.toFixed(2);
      }
      
      const result = {
        amount: convertedAmount,
        symbol: symbol,
        currencyCode: finalCurrency,
        formatted: `${symbol}${formattedAmount}`,
        originalCAD: `${this.CURRENCY_SYMBOLS['CAD']}${this.BASE_PRICE_CAD}`
      };
      
      console.log('💰 CurrencyService: Conversion result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ CurrencyService: Error converting price:', error);
      
      // Fallback to USD if conversion fails
      return {
        amount: this.BASE_PRICE_CAD * this.EXCHANGE_RATES['USD'],
        symbol: '$',
        currencyCode: 'USD',
        formatted: `$${(this.BASE_PRICE_CAD * this.EXCHANGE_RATES['USD']).toFixed(2)}`,
        originalCAD: `${this.CURRENCY_SYMBOLS['CAD']}${this.BASE_PRICE_CAD}`
      };
    }
  }
  
  /**
   * Get user's currency from location or default to USD
   * @param {object} userLocation - Location object with countryCode and currencyCode
   * @returns {string} - Currency code
   */
  static getUserCurrency(userLocation) {
    if (userLocation?.currencyCode) {
      console.log('💰 CurrencyService: Using user location currency:', userLocation.currencyCode);
      return userLocation.currencyCode;
    }
    
    console.log('💰 CurrencyService: No location currency, defaulting to USD');
    return 'USD';
  }
}