# Add Store Functionality Implementation

## Overview
Successfully refactored the "Add Store" functionality to follow best practices and maintain a scalable architecture where all logic is centralized in the `ColumnsContainer` layout component.

## Architecture Pattern

### **Separation of Concerns:**
- **ColumnsContainer** = Layout & Business Logic
  - Manages state for all route days
  - Handles store additions
  - Passes handlers down to children
  
- **Column** = Presentation & User Interaction
  - Renders UI for a single route day
  - Receives data and callbacks via props
  - Calls handlers when user interacts

---

## Changes Made

### 1. **Column.tsx** (Presentation Component)

#### Added Props:
```typescript
onAddStore: (idRouteDay: string, idStore: string) => void;
availableStores: Map<string, LocationDTO>;
onHoverStore: (store: LocationDTO | null) => void;
```

#### Added Imports:
```typescript
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
```

#### Updated Handler:
```typescript
const handleAddStore = (idRouteDay: string, idStore: string) => {
  if (routeDayActionState.isEditable) return;
  onAddStore(idRouteDay, idStore);  // Call parent handler
  setInputValue("");
  onHoverStore(null);               // Reset hover state
};
```

#### Updated Autocomplete:
```typescript
<Autocomplete
  disabled={routeDayActionState.isEditable}
  options={Array.from(availableStores.values())}
  getOptionLabel={(option) =>
    searchStoreBy === "name"
      ? (option.location_name ?? "Nombre no disponible")
      : getAddressOfStore(option)
  }
  onChange={(event, newValue) => {
    if (newValue) {
      handleAddStore(id, newValue.id_location);  // Use id prop instead of idRouteDayColumn
    }
  }}
  renderOption={(props, option) => (
    <li
      {...props}
      key={option.id_location}
      onMouseEnter={() => onHoverStore(option)}    // Use new callback
      onMouseLeave={() => onHoverStore(null)}      // Use new callback
    >
      {/* render store option */}
    </li>
  )}
/>
```

---

### 2. **ColumnsContainer.tsx** (Business Logic Component)

#### Added State:
```typescript
const [hoveredStore, setHoveredStore] = useState<LocationDTO | null>(null);
```

#### Added Handler Function:
```typescript
/**
 * Add a new store to a route day.
 * Creates a new RouteDayLocationDTO entry with the next position in route.
 * 
 * @param idRouteDay - ID of the route day
 * @param idStore - ID of the store to add
 * 
 * Features:
 * - Prevents duplicate stores in same route day
 * - Validates store exists in locationMap
 * - Generates unique ID for new entry
 * - Automatically sets position based on current list length
 * - Updates state immutably
 */
const handleAddStore = (idRouteDay: string, idStore: string) => {
  // 1. Check if store is not already in this route day
  const currentLocations = routeDaysInModification[idRouteDay] || [];
  const storeAlreadyExists = currentLocations.some(
    (loc) => loc.id_location === idStore
  );

  if (storeAlreadyExists) {
    console.warn(`Store ${idStore} is already in route day ${idRouteDay}`);
    return;
  }

  // 2. Get store details from locationMap
  const store = locationMap.get(idStore);
  if (!store) {
    console.error(`Store ${idStore} not found in locationMap`);
    return;
  }

  // 3. Create new RouteDayLocationDTO
  const newPosition = currentLocations.length;
  const newRouteDayLocation: RouteDayLocationDTO = {
    id_route_day_store: generateUUIDv4(),  // Generate unique ID
    position_in_route: newPosition,
    id_route_day: idRouteDay,
    id_location: idStore,
  };

  // 4. Convert to SortableLocationType and add to state
  const sortableLocation: SortableLocationType = {
    ...newRouteDayLocation,
    id: newRouteDayLocation.id_route_day_store,
  };

  setRouteDaysInModification((prev) => {
    const updated = { ...prev };
    updated[idRouteDay] = [...(updated[idRouteDay] || []), sortableLocation];
    return updated;
  });
};
```

#### Added Import:
```typescript
import { generateUUIDv4 } from "@/utils/generalUtils";
```

#### Updated Column Props:
```typescript
<Column
  // ... existing props ...
  onAddStore={handleAddStore}
  availableStores={locationMap}
  onHoverStore={setHoveredStore}
/>
```

---

## Best Practices Applied

### 1. **Unidirectional Data Flow**
- State flows down as props (ColumnsContainer → Column)
- Events flow up through callbacks (Column → ColumnsContainer)
- No prop drilling beyond one level

### 2. **Validation & Error Handling**
- Checks for duplicate stores in route day
- Validates store exists in locationMap
- Provides console warnings for edge cases
- Prevents invalid operations gracefully

### 3. **Immutable State Updates**
```typescript
setRouteDaysInModification((prev) => {
  const updated = { ...prev };  // Shallow copy of object
  updated[idRouteDay] = [...(updated[idRouteDay] || []), sortableLocation];  // New array
  return updated;
});
```

### 4. **Type Safety**
- Full TypeScript support for all props
- Proper DTO/Type usage
- No `any` types in component interface

### 5. **Separation of Concerns**
- Business logic (validation, state updates) in ColumnsContainer
- Presentation (UI rendering) in Column
- Each component has single responsibility

### 6. **Reusability**
- Handler can be tested independently
- Autocomplete logic is isolated in Column
- Easy to add similar features (edit, duplicate, etc.)

---

## Data Flow Example

```
User Types in Autocomplete
         ↓
Column receives onChange event
         ↓
Column calls handleAddStore() callback
         ↓
ColumnsContainer.handleAddStore() receives (idRouteDay, idStore)
         ↓
1. Validates store doesn't already exist
2. Gets store details from locationMap
3. Creates new RouteDayLocationDTO with generated UUID
4. Converts to SortableLocationType
5. Updates routeDaysInModification state
         ↓
useEffect detects change in routeDaysInModification
         ↓
Effect syncs back to parent via onChangeRouteDayOrder()
         ↓
Parent state updates
         ↓
New store appears in Column's children (Item components)
```

---

## Testing Checklist

- [ ] Add store to empty route day
- [ ] Add store to route day with existing stores
- [ ] Try adding same store twice (should be prevented)
- [ ] Store appears in correct position
- [ ] Hover effects work on autocomplete options
- [ ] Input clears after adding store
- [ ] Disabled state works in edit mode
- [ ] Store details display correctly (name/address toggle)

---

## Future Enhancements

1. **Duplicate Prevention UI**
   - Show toast/snackbar when user tries to add duplicate
   - Highlight existing store in list

2. **Bulk Add**
   - Add multiple stores at once
   - Add stores from predefined groups

3. **Smart Positioning**
   - Optionally reorder stores by proximity
   - Calculate optimal route sequence

4. **Undo/Redo**
   - Track changes history
   - Allow reverting individual additions

---

## Key Files Modified

1. `src/app/route_administration/components/SortableContainer/Column.tsx`
2. `src/app/route_administration/components/SortableContainer/ColumnsContainer.tsx`

## Related Components (No Changes Needed)

- `src/app/route_administration/page.tsx` - Parent component that uses ColumnsContainer
- `src/app/route_administration/components/SortableContainer/Item.tsx` - Child component
- `src/shared/dtos/RouteDayLocationDTO.ts` - DTO model
