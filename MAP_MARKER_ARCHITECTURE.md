# Map Click Component - Architecture Diagram

## 🔀 Data Flow After Refactor

```
┌─────────────────────────────────────────────────────────┐
│          useRouteDayLocationMap Hook                     │
│  (Provides markers for map, handles marker clicks)       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
         ┌────────────────────────────────┐
         │ onClickMarkerComponent Callback │
         │ (Receives: location: LocationDTO)
         └────────────────┬───────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                    │
        ▼                                    ▼
   ┌──────────────┐              ┌──────────────────────┐
   │  Callback    │              │  Parent State        │
   │  Parameter   │              │  (page.tsx scope)    │
   │              │              │                      │
   │ location:    │              │ mapStoresInRouteDay: │
   │ LocationDTO  │              │ Map<string,          │
   └──────┬───────┘              │   StorePosition[]>   │
          │                      └──────────┬───────────┘
          │                                 │
          │   ┌──────────────────────────────┘
          │   │
          │   │ lookup: mapStoresInRouteDay.get(location.id_location)
          │   │
          ▼   ▼
      ┌────────────────────────────────────────┐
      │  Extract locationPositions             │
      │  (StorePositionInRouteType[])           │
      └────────────┬─────────────────────────┘
                   │
                   ├─ location (LocationDTO)
                   ├─ locationPositions (array)
                   └─ updateHandler (function)
                   │
                   ▼
        ┌──────────────────────────────┐
        │ createMapClickComponent()     │
        │                              │
        │ Parameters:                  │
        │ - location                   │
        │ - locationPositions          │
        │ - onSelectStoreToUpdate      │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │  Rendered Component          │
        │                              │
        │  ┌─ Location name            │
        │  ├─ Location address         │
        │  ├─ Position table           │
        │  └─ Update button            │
        └──────────────────────────────┘
```

---

## 🔑 Key Relationships

### Before (Broken ❌)
```
Hook Callback
  ├─ Receives: location
  ├─ Needs: store (undefined!)
  ├─ Needs: storePositions (undefined!)
  └─ Needs: id_location (undefined!)
  
Result: ReferenceError - variables not in scope
```

### After (Working ✅)
```
Hook Callback
  ├─ Receives: location ✓
  ├─ Extracts: locationPositions from mapStoresInRouteDay ✓
  ├─ Uses: location.id_location ✓
  └─ Passes all to createMapClickComponent ✓
  
Result: Component renders correctly with all data
```

---

## 📦 Data Structure

### StorePositionInRouteType
```typescript
{
  idRouteDayStore: string;      // Unique ID in route day
  idRouteDay: string;            // Which route day
  idRoute: string;               // Which route
  position: number;              // Position in route (0, 1, 2...)
  routeName: string;             // Route name for display
  dayName: string;               // Day name for display
}
```

---

## 🔄 Complete Flow

```
1. User clicks marker on map
   │
   ├─→ dnd-kit detects click
   │
   ├─→ Calls onClickMarkerComponent(location)
   │
   ├─→ Callback executes:
   │   const locationPositions = mapStoresInRouteDay.get(location.id_location) ?? [];
   │
   ├─→ Calls: createMapClickComponent(location, locationPositions, handler)
   │
   ├─→ Function builds JSX:
   │   - Extracts: id_location, location_name, address
   │   - Shows: Location details + position table
   │   - Maps: locationPositions array to table rows
   │
   └─→ Popup appears on map
       └─ User can click "Update" button
```

---

## 🎓 Pattern: Callback Data Extraction

This pattern is useful whenever you have:
- **Hook callbacks** with limited parameters
- **Need additional data** from parent component scope
- **Cannot modify hook signature**

```typescript
// Template:
onCallback: (hookParam: Type): React.ReactNode => {
  // 1. Extract additional data from component scope
  const extractedData = parentStateMap.get(hookParam.id) ?? defaultValue;
  
  // 2. Combine with parameter and call component
  return renderComponent(hookParam, extractedData, otherHandlers);
}
```

---

**Architecture Pattern:** ✅ Callback-based Data Extraction  
**Data Flow:** ✅ Unidirectional (parent → callback → component)  
**Type Safety:** ✅ Full TypeScript coverage  
**Null Safety:** ✅ Fallback with `??` operator
