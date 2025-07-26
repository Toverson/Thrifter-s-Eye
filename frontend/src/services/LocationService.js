import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export class LocationService {
  static async getCurrentLocation() {
    try {
      // Request permission
      if (Platform.OS === 'ios') {
        const hasPermission = await this.hasLocationPermission();
        if (!hasPermission) {
          return this.getDefaultLocation();
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return this.getDefaultLocation();
        }
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.getCountryFromCoordinates(latitude, longitude)
              .then(resolve)
              .catch(() => resolve(this.getDefaultLocation()));
          },
          (error) => {
            console.log('Location error:', error);
            resolve(this.getDefaultLocation());
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    } catch (error) {
      console.log('Location service error:', error);
      return this.getDefaultLocation();
    }
  }

  static async hasLocationPermission() {
    if (Platform.OS === 'ios') {
      return true; // iOS permissions are handled by the system
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  }

  static async getCountryFromCoordinates(latitude, longitude) {
    try {
      // Using a free geocoding service to get country from coordinates
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      const countryCode = data.countryCode || 'US';
      const currencyCode = this.getCurrencyFromCountryCode(countryCode);
      
      return {
        countryCode,
        currencyCode,
      };
    } catch (error) {
      console.log('Geocoding error:', error);
      return this.getDefaultLocation();
    }
  }

  static getCurrencyFromCountryCode(countryCode) {
    const currencyMap = {
      'US': 'USD',
      'CA': 'CAD', 
      'GB': 'GBP',
      'AU': 'AUD',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'JP': 'JPY',
      'CN': 'CNY',
      'IN': 'INR',
      'BR': 'BRL',
      'MX': 'MXN',
      'RU': 'RUB',
    };

    return currencyMap[countryCode] || 'USD';
  }

  static getDefaultLocation() {
    return {
      countryCode: 'US',
      currencyCode: 'USD',
    };
  }
}