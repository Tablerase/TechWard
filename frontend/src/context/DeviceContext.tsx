import { createContext } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

export interface DeviceInfo {
  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;

  // Device type and characteristics
  deviceType: DeviceType;
  orientation: Orientation;
  isTouchDevice: boolean;
  isRetina: boolean;

  // Browser and system info
  language: string;
  languages: readonly string[];
  userAgent: string;

  // Network and performance
  isOnline: boolean;
  connection?: {
    effectiveType: "slow-2g" | "2g" | "3g" | "4g";
    downlink: number;
    rtt: number;
    saveData: boolean;
  };

  // Preferences
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersColorScheme: "light" | "dark" | "no-preference";
}

export interface DeviceContextValue {
  deviceInfo: DeviceInfo;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export const DeviceContext = createContext<DeviceContextValue | undefined>(
  undefined
);
