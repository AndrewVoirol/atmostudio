export interface WeatherConfig {
  // Background Gradient
  bgTop: string;
  bgBottom: string;
  
  // Clouds
  cloudDensity: number; // 0 to 1
  cloudSpeed: number; // 0.0 to 2.0
  cloudColor: string;
  cloudOpacity: number; // 0 to 1
  
  // Precipitation
  rainIntensity: number; // 0 to 1
  snowIntensity: number; // 0 to 1
  windAngle: number; // degrees
  
  // Sun/Moon
  sunPositionX: number; // -1 to 1
  sunPositionY: number; // -1 to 1
  sunColor: string;
  sunScale: number;

  // Meta
  conditionLabel: string;
  temperature: number;
}

export const DEFAULT_CONFIG: WeatherConfig = {
  bgTop: '#1e3a8a', // Dark blue
  bgBottom: '#60a5fa', // Light blue
  cloudDensity: 0.4,
  cloudSpeed: 0.1,
  cloudColor: '#ffffff',
  cloudOpacity: 0.8,
  rainIntensity: 0,
  snowIntensity: 0,
  windAngle: 15,
  sunPositionX: 0.5,
  sunPositionY: 0.5,
  sunColor: '#fde047',
  sunScale: 1.0,
  conditionLabel: 'Clear Sky',
  temperature: 72,
};
