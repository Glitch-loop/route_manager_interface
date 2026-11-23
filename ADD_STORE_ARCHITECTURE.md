# Add Store Functionality - Architecture Diagram

## Component Hierarchy

```
Page (route_administration/page.tsx)
  │
  └─ ColumnsContainer ✓ BUSINESS LOGIC HERE
       │
       ├─ State Management:
       │  ├─ routeDaysInModification: Record<string, SortableLocationType[]>
       │  ├─ hoveredStore: LocationDTO | null
       │  └─ routeDayActionStateMap: Map<string, RouteDayActionStateType>
       │
       ├─ Handler Functions:
       │  ├─ handleAddStore(idRouteDay, idStore) ✓ MAIN HANDLER
       │  ├─ handleRemoveStores(idRouteDay)
       │  └─ ...other handlers
       │
       └─ Renders → Column (props, callbacks)
            │
            └─ Column ✓ PRESENTATION ONLY
                  │
                  ├─ Props Received:
                  │  ├─ onAddStore: (idRouteDay, idStore) => void
                  │  ├─ availableStores: Map<string, LocationDTO>
                  │  ├─ onHoverStore: (store | null) => void
                  │  └─ ...other props
                  │
                  ├─ State:
                  │  ├─ inputValue: string
                  │  ├─ searchStoreBy: "name" | "address"
                  │  └─ ...UI state
                  │
                  ├─ Handler:
                  │  └─ handleAddStore() calls onAddStore callback
                  │
                  └─ Renders:
                     ├─ Autocomplete Component
                     │  ├─ options: availableStores
                     │  ├─ onChange: calls handleAddStore
                     │  └─ onMouseEnter/Leave: calls onHoverStore
                     │
                     └─ Items
                        └─ Item components for each store
```

---

## Data Flow: Adding a Store

```
╔══════════════════════════════════════════════════════════════════════╗
║                     USER INTERACTION                                 ║
║   User selects store from Autocomplete dropdown                      ║
╚══════════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════════╗
║                   COLUMN COMPONENT                                   ║
║   onChange event → handleAddStore(idRouteDay, idStore)               ║
║   └─ Calls: onAddStore(idRouteDay, idStore)  [callback to parent]    ║
╚══════════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════════╗
║              COLUMNSCONTAINER COMPONENT                              ║
║   handleAddStore() - Main Business Logic:                            ║
║                                                                       ║
║   1️⃣  currentLocations = routeDaysInModification[idRouteDay]         ║
║   2️⃣  storeAlreadyExists? → return (prevent duplicate)             ║
║   3️⃣  store = locationMap.get(idStore)                              ║
║   4️⃣  store exists? → continue : return error                       ║
║   5️⃣  newPosition = currentLocations.length                          ║
║   6️⃣  Create new RouteDayLocationDTO:                                ║
║       {                                                              ║
║         id_route_day_store: generateUUIDv4(),                        ║
║         position_in_route: newPosition,                              ║
║         id_route_day: idRouteDay,                                    ║
║         id_location: idStore,                                        ║
║       }                                                              ║
║   7️⃣  Convert to SortableLocationType (add 'id' field)              ║
║   8️⃣  setRouteDaysInModification() - Update state immutably         ║
╚══════════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════════╗
║                  STATE UPDATE DETECTED                               ║
║   routeDaysInModification changes                                    ║
║   → useEffect runs                                                   ║
║   → Syncs back to parent via onChangeRouteDayOrder()                ║
╚══════════════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════════════╗
║                   COLUMN RE-RENDERS                                  ║
║   clientsInRoute prop updated with new store                         ║
║   → New Item component rendered                                      ║
║   → Autocomplete input cleared                                       ║
║   → Hover state reset                                                ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## State Transformations

### Before Adding Store:
```
routeDaysInModification = {
  "ROUTE_DAY_1": [
    { id_route_day_store: "UUID-1", position_in_route: 0, ... },
    { id_route_day_store: "UUID-2", position_in_route: 1, ... },
  ]
}
```

### After Adding Store "STORE_XYZ":
```
routeDaysInModification = {
  "ROUTE_DAY_1": [
    { id_route_day_store: "UUID-1", position_in_route: 0, ... },
    { id_route_day_store: "UUID-2", position_in_route: 1, ... },
    { id_route_day_store: "UUID-3", position_in_route: 2, id_location: "STORE_XYZ", ... },
  ]
}
```

---

## Validation Checks

```
┌─ handleAddStore(idRouteDay, idStore)
│
├─ ✓ Check 1: Store already in this route day?
│  └─ YES → console.warn() + return
│
├─ ✓ Check 2: Store exists in locationMap?
│  └─ NO → console.error() + return
│
├─ ✓ Check 3: Valid position can be assigned?
│  └─ Uses: currentLocations.length
│
└─ ✓ All checks pass → Update state immutably
```

---

## Props Contract

### Column Component Props (Related to Add Store):

```typescript
// Input Props (what Column receives)
onAddStore: (idRouteDay: string, idStore: string) => void;
availableStores: Map<string, LocationDTO>;
onHoverStore: (store: LocationDTO | null) => void;

// Derived/Related Props
clientsInRoute: SortableLocationType[];  // Current stores in route day
routeDayActionState: RouteDayActionStateType;  // Contains isEditable flag

// Usage in Column:
- availableStores → Pass to Autocomplete options
- onAddStore → Call when user selects store
- onHoverStore → Call on mouse enter/leave
- routeDayActionState.isEditable → Disable autocomplete during edit
```

### ColumnsContainer Props (what it receives from parent):

```typescript
selectedRouteDays: Map<string, RouteDayDTO>;  // Source data
locationMap: Map<string, LocationDTO>;        // All available stores
routes: RouteDTO[];                           // Route configuration
// ... other props

// Props it passes to Column:
onAddStore={handleAddStore}
availableStores={locationMap}
onHoverStore={setHoveredStore}
```

---

## Error Handling

```
Scenario 1: Store Already Exists
├─ Input: addStore("ROUTE_DAY_1", "STORE_1") [STORE_1 already there]
├─ Check: storeAlreadyExists = true
├─ Action: console.warn("Store ... is already in route day ...")
└─ Result: State unchanged, no visual update

Scenario 2: Store Not Found
├─ Input: addStore("ROUTE_DAY_1", "INVALID_STORE")
├─ Check: locationMap.get("INVALID_STORE") = undefined
├─ Action: console.error("Store ... not found in locationMap")
└─ Result: State unchanged, no visual update

Scenario 3: Success
├─ Input: addStore("ROUTE_DAY_1", "STORE_2") [new store]
├─ Check: All validations pass
├─ Action: Create new RouteDayLocationDTO
├─ Update: setRouteDaysInModification()
└─ Result: New store rendered in UI
```

---

## Best Practices Checklist ✓

- [x] **Unidirectional Data Flow**: Data down, events up
- [x] **Single Responsibility**: Each component has one job
- [x] **Immutable State Updates**: Using spread operator and new arrays
- [x] **Validation**: Multiple checks before state update
- [x] **Error Handling**: Console warnings for edge cases
- [x] **Type Safety**: Full TypeScript coverage, no `any`
- [x] **Scalability**: Easy to extend with similar features
- [x] **Testability**: Logic isolated and pure functions
- [x] **Documentation**: Clear comments explaining flow
- [x] **Naming**: Descriptive handler names and variables

---

## Integration Points

```
ColumnsContainer
  ├─ Receives: selectedRouteDays, locationMap from Page
  │
  ├─ Updates: routeDaysInModification (internal)
  │
  ├─ Calls: onChangeRouteDayOrder() callback (up to Page)
  │
  ├─ Passes: onAddStore handler (down to Column)
  │
  └─ Uses: generateUUIDv4(), getRouteDayFromRoutesList()
```

---

## Future-Proofing

The architecture is designed to easily support:
1. **Bulk Add** - Just call handleAddStore() multiple times
2. **Conditional Add** - Add validation logic before creating RouteDayLocationDTO
3. **Transform on Add** - Calculate optimal positions after adding
4. **Notify on Add** - Dispatch events/callbacks after successful add
5. **Undo/Redo** - Track state changes in separate history store
