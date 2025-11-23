# Ward Layout System

## Overview

The Ward component uses a **fixed-dimension layout** with zoom/pan/pinch capabilities to provide a consistent experience across desktop and mobile devices. This design allows for easy expansion with additional rooms and interactive features.

## Fixed Dimensions

- **Ward Width**: 2400px
- **Ward Height**: 1600px

These fixed dimensions ensure:

- Consistent layout across devices
- Predictable room positioning
- Easy calculation for future room additions
- Smooth zoom/pan behavior

## Current Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                     Ward Hallway                        │
│  ┌──────────┐        ┌───────┐        ┌──────────┐    │
│  │ Patient  │        │       │        │ Patient  │    │
│  │ Room 1   │        │       │        │ Room 2   │    │
│  │ (Left)   │        │Hallway│        │ (Right)  │    │
│  └──────────┘        │       │        └──────────┘    │
│                      │       │                         │
│  ┌──────────┐        │       │        ┌──────────┐    │
│  │ Patient  │        │       │        │ Patient  │    │
│  │ Room 3   │        │       │        │ Room 4   │    │
│  │ (Left)   │        └───────┘        │ (Right)  │    │
│  └──────────┘                         └──────────┘    │
│                                                         │
│  (Future: Breakroom, Nurse Office, Storage, etc.)     │
└─────────────────────────────────────────────────────────┘
```

## Zoom & Pan Controls

### Features

- **Initial Scale**: 0.5 (50% zoom to see full ward)
- **Min Scale**: 0.3 (30% - overview mode)
- **Max Scale**: 2.0 (200% - detail mode)
- **Mouse Wheel**: Zoom in/out with 0.1 step increments
- **Double Click**: Reset view to initial position/scale
- **Touch Gestures**: Pinch to zoom, drag to pan (mobile)

### UI Controls

Located in top-right corner:

- **Zoom In** (+) - Increase zoom level
- **Zoom Out** (-) - Decrease zoom level
- **Reset View** (maximize icon) - Return to default view

## Status Legend

The status legend has been moved out of the SVG to a **drawer component** for better mobile UX:

- **Desktop**: Click info button (bottom-right) to open drawer
- **Mobile**: Swipe up or tap info button to view legend
- **Contents**: Color-coded status indicators (Critical, Serious, Processing, Resolved, Stable)

## Adding New Rooms

### Example: Adding a Breakroom

1. **Define Room Type** (optional, for type safety):

```typescript
type RoomType = "patient" | "break" | "office" | "storage";

interface RoomLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  id: string;
  name: string;
  patientId?: string; // Only for patient rooms
  patientName?: string; // Only for patient rooms
}
```

2. **Add Room to Layout** in `Ward.tsx`:

```typescript
const roomLayouts: RoomLayout[] = useMemo(() => {
  const layouts: RoomLayout[] = [];

  // Patient rooms (existing logic)
  wardPatients.patients.forEach((patient, index) => {
    // ... existing patient room logic
  });

  // Add breakroom at bottom-left
  layouts.push({
    x: 40,
    y: WARD_HEIGHT - 240,
    width: 300,
    height: 200,
    type: "break",
    id: "breakroom-1",
    name: "Break Room",
  });

  // Add nurse office at bottom-right
  layouts.push({
    x: WARD_WIDTH - 340,
    y: WARD_HEIGHT - 240,
    width: 300,
    height: 200,
    type: "office",
    id: "office-1",
    name: "Nurse Office",
  });

  return layouts;
}, [wardPatients]);
```

3. **Render New Rooms** in SVG:

```typescript
{
  roomLayouts
    .filter((room) => room.type !== "patient")
    .map((room) => (
      <g key={room.id}>
        <rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          fill="var(--color-azure-100)"
          stroke="var(--color-primary)"
          strokeWidth="3"
          rx="8"
        />
        <text
          x={room.x + room.width / 2}
          y={room.y + 30}
          textAnchor="middle"
          fill="var(--color-base-text)"
          fontSize="18"
          fontWeight="bold"
        >
          {room.name}
        </text>
        {/* Add room-specific icons/furniture here */}
      </g>
    ));
}
```

### Recommended Room Positions

Based on 2400x1600 layout with patient rooms:

| Room Type    | Suggested Position        | Size     | Notes                |
| ------------ | ------------------------- | -------- | -------------------- |
| Break Room   | Bottom-left (40, 1360)    | 300x200  | Caregiver rest area  |
| Nurse Office | Bottom-right (2060, 1360) | 300x200  | Administrative space |
| Storage      | Top-left corner (40, 40)  | 200x150  | Medical supplies     |
| ICU Section  | Custom zone               | Variable | High-priority area   |

## Caregiver Movement

### Current Implementation

Caregivers move between:

- **Hallway** (center: x=1200, y=800)
- **Patient Rooms** (on problem assignment)

### Future: Multi-Room Navigation

To enable caregiver movement to breakroom, office, etc.:

1. **Add Room Destinations**:

```typescript
interface CaregiverPosition {
  caregiverId: string;
  name: string;
  x: number;
  y: number;
  isMoving: boolean;
  currentRoom?: string; // Track current location
  assignedRoom?: string; // Track assignment
}
```

2. **Implement Room Navigation**:

```typescript
const moveCaregiverToRoom = (caregiverName: string, roomId: string) => {
  const targetRoom = roomLayouts.find((r) => r.id === roomId);
  if (!targetRoom) return;

  const targetX = targetRoom.x + targetRoom.width / 2;
  const targetY = targetRoom.y + targetRoom.height / 2;

  setCaregivers((prev) => {
    const updated = new Map(prev);
    const caregiver = updated.get(caregiverName);
    if (caregiver) {
      updated.set(caregiverName, {
        ...caregiver,
        x: targetX,
        y: targetY,
        isMoving: true,
        currentRoom: roomId,
      });

      // Reset moving state after animation
      setTimeout(() => {
        setCaregivers((prev) => {
          const updated = new Map(prev);
          const c = updated.get(caregiverName);
          if (c) {
            updated.set(caregiverName, { ...c, isMoving: false });
          }
          return updated;
        });
      }, 2000);
    }
    return updated;
  });
};
```

3. **Add UI Controls** (e.g., click room to send caregiver):

```typescript
<rect
  x={room.x}
  y={room.y}
  width={room.width}
  height={room.height}
  onClick={() => moveCaregiverToRoom(caregiverInfo.name.firstName, room.id)}
  style={{ cursor: "pointer" }}
  // ... other props
/>
```

## Mobile Optimization

### Touch Gestures

- **Pan**: Single-finger drag
- **Zoom**: Pinch gesture
- **Reset**: Double-tap
- **Legend**: Swipe up drawer from bottom

### Performance Considerations

- Fixed dimensions prevent expensive recalculations
- SVG rendering is hardware-accelerated
- TransformComponent uses CSS transforms (GPU-accelerated)
- Limit caregiver count for smooth animations (<20 recommended)

## Responsive Behavior

The ward uses a **mobile-first** approach:

- Container fills 100vw x 100vh
- Initial zoom of 50% shows entire ward
- Users zoom in for detail, pan to navigate
- Works on screens from 320px (mobile) to 4K desktop

## Future Enhancements

### Planned Features

1. **Room Types System**: Different icons/colors for room categories
2. **Interactive Rooms**: Click to view details, assign tasks
3. **Pathfinding**: Animated caregiver routes through hallways
4. **Minimap**: Small overview in corner showing position
5. **Room Filters**: Toggle visibility of room types
6. **Multi-Floor Support**: Tabs or buttons to switch between floors

### Layout Expansion

The 2400x1600 canvas can accommodate:

- Up to 12 patient rooms (current: ~6)
- 4-6 utility rooms (break, office, storage, etc.)
- Larger hallway areas for common spaces
- Emergency zones (ER, ICU sections)

## Code References

- **Main Component**: `frontend/src/components/ward/Ward.tsx`
- **Legend Component**: `frontend/src/components/ward/StatusLegend.tsx`
- **Status Utilities**: `frontend/src/utils/problemStatus.ts`
- **Socket Context**: `frontend/src/context/WardSocketContext.tsx`

## Dependencies

```json
{
  "react-zoom-pan-pinch": "^3.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-dialog": "^1.x" // via shadcn drawer
}
```
