import { Separator } from "./ui/separator";
import IVStand from "./ward/devices/IVStand";
import HospitalBed from "./ward/devices/HospitalBed";

const Draft = () => {
  return (
    <div style={{ padding: "1rem", color: "var(--color-base-text)" }}>
      <h1>Draft Component</h1>
      <p>This is a placeholder for the Draft component.</p>

      <HospitalBed />
      <Separator orientation="horizontal" className="my-4" />
      <IVStand />
    </div>
  );
};

export default Draft;
