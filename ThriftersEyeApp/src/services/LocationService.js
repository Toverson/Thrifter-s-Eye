import Geolocation from '@react-native-community/geolocation';

export class LocationService {
  static async getCurrentLocation() {
    try {
      console.log('📍 LocationService: Getting current location...');
      
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log('📍 LocationService: Got coordinates:', latitude, longitude);
              
              // Get country/currency from coordinates using a geocoding API
              // For now, we'll use a simple mapping based on common locations
              // In production, you'd use a proper geocoding service
              
              const locationData = await this.getLocationFromCoordinates(latitude, longitude);
              console.log('📍 LocationService: Location data:', locationData);
              
              resolve(locationData);
            } catch (error) {
              console.error('❌ LocationService: Error processing location:', error);
              resolve(this.getDefaultLocation());
            }
          },
          (error) => {
            console.error('❌ LocationService: Geolocation error:', error);
            resolve(this.getDefaultLocation());
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });
    } catch (error) {
      console.error('❌ LocationService: Error getting location:', error);
      return this.getDefaultLocation();
    }
  }

  static async getLocationFromCoordinates(latitude, longitude) {
    // This is a simplified implementation
    // In production, you'd use a proper geocoding API like Google Maps or Mapbox
    
    // Simple region detection based on coordinates
    if (latitude >= 49.0 && latitude <= 83.0 && longitude >= -141.0 && longitude <= -52.0) {
      return {
        countryCode: 'CA',
        currencyCode: 'CAD',
        country: 'Canada'
      };
    } else if (latitude >= 24.0 && latitude <= 49.0 && longitude >= -125.0 && longitude <= -66.0) {
      return {
        countryCode: 'US',
        currencyCode: 'USD',
        country: 'United States'
      };
    } else if (latitude >= 35.0 && latitude <= 71.0 && longitude >= -10.0 && longitude <= 40.0) {
      return {
        countryCode: 'GB',
        currencyCode: 'GBP',
        country: 'United Kingdom'
      };
    }
    
    // Default to US if we can't determine location
    return this.getDefaultLocation();
  }

  static getDefaultLocation() {
    return {
      countryCode: 'US',
      currencyCode: 'USD',
      country: 'United States'
    };
  }

  static async requestLocationPermission() {
    // On iOS, permissions are handled automatically by the geolocation call
    // On Android, you'd need to handle runtime permissions
    console.log('📍 LocationService: Location permission will be requested when needed');
    return true;
  }
}