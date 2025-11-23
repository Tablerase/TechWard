import { useContext } from "react";
import { DeviceContext, DeviceContextValue } from "@context/DeviceContext";

export const useDevice = (): DeviceContextValue => {
  const context = useContext(DeviceContext);

  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }

  return context;
};
