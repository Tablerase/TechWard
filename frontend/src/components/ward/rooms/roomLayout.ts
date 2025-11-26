import { PATIENT_ROOM_DIMENSIONS, WARD_DIMENSIONS } from "./roomDimensions";

export type RoomType = "patient" | "break" | "office" | "storage";

export interface RoomLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  id: string;
  name: string;
  patientId?: string;
  patientName?: string;
}

export interface CaregiverPosition {
  caregiverId: string;
  name: string;
  x: number;
  y: number;
  isMoving: boolean;
  assignedRoom?: string;
}

export const configuredRoomLayouts: RoomLayout[] = [];

function initializeLayouts() {
  for (let index = 0; index < WARD_DIMENSIONS.patientRoomAmount; index++) {
    const isLeftSide = index % 2 === 0;
    const rowIndex = Math.floor(index / 2);
    const name = isLeftSide
      ? "Left Patient Room " + (rowIndex + 1)
      : "Right Patient Room " + (rowIndex + 1);

    configuredRoomLayouts.push({
      x: isLeftSide
        ? WARD_DIMENSIONS.width / 2 -
          WARD_DIMENSIONS.hallwayWidth / 2 -
          PATIENT_ROOM_DIMENSIONS.width
        : WARD_DIMENSIONS.width / 2 + WARD_DIMENSIONS.hallwayWidth / 2,
      y: rowIndex * PATIENT_ROOM_DIMENSIONS.height + WARD_DIMENSIONS.padding,
      width: PATIENT_ROOM_DIMENSIONS.width,
      height: PATIENT_ROOM_DIMENSIONS.height,
      type: "patient",
      id: `${index + 1}`,
      name: name,
    });
  }

  // Add utility rooms at the bottom
  const utilityRoomY =
    configuredRoomLayouts[configuredRoomLayouts.length - 1].y +
    PATIENT_ROOM_DIMENSIONS.height +
    WARD_DIMENSIONS.padding;
  const utilityRoomHeight = PATIENT_ROOM_DIMENSIONS.height;
  const utilityRoomWidth = PATIENT_ROOM_DIMENSIONS.width;

  // Break Room (bottom-left)
  configuredRoomLayouts.push({
    x: WARD_DIMENSIONS.padding,
    y: utilityRoomY,
    width: utilityRoomWidth,
    height: utilityRoomHeight,
    type: "break",
    id: "break-room",
    name: "Break Room",
  });

  // Caregiver Office (bottom-center)
  configuredRoomLayouts.push({
    x: WARD_DIMENSIONS.width / 2 + WARD_DIMENSIONS.hallwayWidth / 2,
    y: utilityRoomY,
    width: utilityRoomWidth,
    height: utilityRoomHeight,
    type: "office",
    id: "caregiver-office",
    name: "Caregiver Office",
  });

  // Storage Room (bottom-right)
  configuredRoomLayouts.push({
    x: WARD_DIMENSIONS.width - WARD_DIMENSIONS.padding - utilityRoomWidth,
    y: utilityRoomY + utilityRoomHeight,
    width: utilityRoomWidth,
    height: utilityRoomHeight,
    type: "storage",
    id: "storage-room",
    name: "Storage Room",
  });
}

initializeLayouts();
