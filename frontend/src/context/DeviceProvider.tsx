import { ReactNode, useEffect, useState, useMemo } from "react";
import {
  DeviceContext,
  DeviceInfo,
  DeviceType,
  Orientation,
} from "./DeviceContext";

interface DeviceProviderProps {
  children: ReactNode;
}

const getDeviceType = (width: number): DeviceType => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? "landscape" : "portrait";
};

const getConnectionInfo = () => {
  // @ts-expect-error - NetworkInformation API not in all TypeScript definitions
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return undefined;

  return {
    effectiveType: connection.effectiveType || "4g",
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
};

const getColorScheme = (): "light" | "dark" | "no-preference" => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "no-preference";
};

export const DeviceProvider = ({ children }: DeviceProviderProps) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initial state
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: width,
      viewportHeight: height,
      deviceType: getDeviceType(width),
      orientation: getOrientation(width, height),
      isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      isRetina: window.devicePixelRatio > 1,
      language: navigator.language,
      languages: navigator.languages,
      userAgent: navigator.userAgent,
      isOnline: navigator.onLine,
      connection: getConnectionInfo(),
      prefersReducedMotion: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches,
      prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)")
        .matches,
      prefersColorScheme: getColorScheme(),
    };
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDeviceInfo((prev) => ({
        ...prev,
        viewportWidth: width,
        viewportHeight: height,
        deviceType: getDeviceType(width),
        orientation: getOrientation(width, height),
      }));
    };

    const updateOnlineStatus = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    const updateColorScheme = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        prefersDarkMode: window.matchMedia("(prefers-color-scheme: dark)")
          .matches,
        prefersColorScheme: getColorScheme(),
      }));
    };

    const updateReducedMotion = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        prefersReducedMotion: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches,
      }));
    };

    const updateConnection = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        connection: getConnectionInfo(),
      }));
    };

    // Event listeners
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Media query listeners
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    // Modern browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener("change", updateColorScheme);
      reducedMotionQuery.addEventListener("change", updateReducedMotion);
    } else {
      // Legacy browsers
      darkModeQuery.addListener(updateColorScheme);
      reducedMotionQuery.addListener(updateReducedMotion);
    }

    // Connection change listener
    // @ts-expect-error - NetworkInformation API not in all TypeScript definitions
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      connection.addEventListener("change", updateConnection);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);

      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener("change", updateColorScheme);
        reducedMotionQuery.removeEventListener("change", updateReducedMotion);
      } else {
        darkModeQuery.removeListener(updateColorScheme);
        reducedMotionQuery.removeListener(updateReducedMotion);
      }

      if (connection) {
        connection.removeEventListener("change", updateConnection);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      deviceInfo,
      isMobile: deviceInfo.deviceType === "mobile",
      isTablet: deviceInfo.deviceType === "tablet",
      isDesktop: deviceInfo.deviceType === "desktop",
      isPortrait: deviceInfo.orientation === "portrait",
      isLandscape: deviceInfo.orientation === "landscape",
    }),
    [deviceInfo]
  );

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
};
