import { Separator } from "@components/ui/separator";
import IVStand from "@components/ward/devices/IVStand";
import HospitalBed from "@components/ward/devices/HospitalBed";
import PatientRoom from "@components/ward/rooms/PatientRoom";

const Draft = () => {
  return (
    <div style={{ padding: "1rem", color: "var(--color-base-text)" }}>
      <h1>Draft Component</h1>
      <p>This is a placeholder for the Draft component.</p>

      <Separator orientation="horizontal" className="my-4" />
      <PatientRoom
        roomId="10"
        patient={{ id: "p5", name: "Bidul", problems: [] }}
        pattern={true}
      />
      <Separator orientation="horizontal" className="my-4" />
      <HospitalBed />
      <Separator orientation="horizontal" className="my-4" />
      <IVStand />
    </div>
  );
};

export default Draft;
