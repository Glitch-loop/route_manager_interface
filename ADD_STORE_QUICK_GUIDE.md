# Add Store Functionality - Quick Start Guide

## 🚀 How It Works

### User Flow
1. User selects a route day from the sidebar
2. Route day loads in a Column component
3. User toggles to "Add Client" mode (if not in delete mode)
4. User types in Autocomplete field to search stores by name or address
5. User selects a store from dropdown
6. Store is added to route day at the end of the list
7. Store appears as a new Item in the Column

---

## 📝 Testing Checklist

### Basic Functionality
- [ ] Can add store to empty route day
  - Expected: New store appears at position 0
  
- [ ] Can add store to route day with existing stores
  - Expected: New store appears after last store
  
- [ ] Cannot add same store twice
  - Expected: Console warning, no duplicate added
  
- [ ] Input clears after adding
  - Expected: Autocomplete field empties
  
- [ ] Hover shows store details
  - Expected: Store name and address appear on hover

### UI State Management
- [ ] Autocomplete disabled during edit mode
  - Expected: Input field appears grayed out
  
- [ ] Name/Address toggle works
  - Expected: Can switch search type with toggle
  
- [ ] Search filters correctly
  - Expected: Only matching stores show in dropdown

### Edge Cases
- [ ] Try to add store that doesn't exist
  - Expected: Console error, nothing added
  
- [ ] Switch route days while adding
  - Expected: Different store list loads, input clears
  
- [ ] Add many stores in succession
  - Expected: All added, positions increment correctly

### Integration
- [ ] Save changes after adding store
  - Expected: Store persists in route configuration
  
- [ ] Reorder stores after adding
  - Expected: Drag & drop works with new store
  
- [ ] Delete store after adding
  - Expected: Can remove in delete mode

---

## 🔧 Code Locations

### Main Handler
**File**: `ColumnsContainer.tsx` (lines ~220-270)
```typescript
const handleAddStore = (idRouteDay: string, idStore: string) => {
  // Business logic here
}
```

### UI Implementation
**File**: `Column.tsx` (lines ~390-440)
- Autocomplete component
- Store selection handling
- Input management

### Type Definitions
**File**: `Column.tsx` (lines ~28-48)
```typescript
type ColumnType = {
  // ...existing props...
  onAddStore: (idRouteDay: string, idStore: string) => void;
  availableStores: Map<string, LocationDTO>;
  onHoverStore: (store: LocationDTO | null) => void;
}
```

---

## 🎯 Key Implementation Details

### 1. Duplicate Prevention
```typescript
const storeAlreadyExists = currentLocations.some(
  (loc) => loc.id_location === idStore
);

if (storeAlreadyExists) {
  console.warn(`Store ${idStore} is already in route day ${idRouteDay}`);
  return;  // ← Silently prevent duplicate
}
```

### 2. Auto Position Assignment
```typescript
const newPosition = currentLocations.length;
// Position automatically set to next index
```

### 3. UUID Generation
```typescript
id_route_day_store: generateUUIDv4()  // Guaranteed unique
```

### 4. Immutable State Update
```typescript
setRouteDaysInModification((prev) => {
  const updated = { ...prev };  // Shallow copy
  updated[idRouteDay] = [...(updated[idRouteDay] || []), sortableLocation];
  return updated;
});
```

---

## 🐛 Debugging Tips

### Enable Console Logging
Add these to `handleAddStore()` for debugging:
```typescript
console.log('Adding store:', { idRouteDay, idStore });
console.log('Current locations:', currentLocations);
console.log('Store details:', store);
console.log('New position:', newPosition);
console.log('Final location:', newRouteDayLocation);
```

### Check State in DevTools
1. Open React DevTools browser extension
2. Find ColumnsContainer component
3. Check `routeDaysInModification` state
4. Verify new store appears with correct structure

### Verify Store Map
```javascript
// In browser console:
// If you have access to component props
console.log('Available stores:', availableStores.size)
console.log('Store details:', availableStores.get('STORE_ID'))
```

---

## 📊 Data Structure Reference

### Input: LocationDTO (from availableStores)
```typescript
{
  id_location: "LOC-123",
  location_name: "Store Name",
  latitude: 40.7128,
  longitude: -74.0060,
  // ... other location fields
}
```

### Created: RouteDayLocationDTO
```typescript
{
  id_route_day_store: "UUID-abc123",      // Generated
  position_in_route: 2,                   // Auto calculated
  id_route_day: "ROUTE_DAY_1",            // From parameter
  id_location: "LOC-123",                 // From parameter
}
```

### Stored As: SortableLocationType
```typescript
{
  // All RouteDayLocationDTO fields plus:
  id: "UUID-abc123"  // Same as id_route_day_store
}
```

---

## ✅ Validation Rules

| Check | Condition | Action |
|-------|-----------|--------|
| Duplicate | Store already in route day | Warn & return |
| Exists | Store not in locationMap | Error & return |
| Valid ID | idRouteDay exists in state | Continue |
| Valid Store | idStore is non-empty string | Continue |

---

## 🔄 State Flow After Adding

```
1. User selects store
   ↓
2. Column calls onAddStore callback
   ↓
3. ColumnsContainer.handleAddStore validates & creates entry
   ↓
4. setRouteDaysInModification updates state
   ↓
5. useEffect detects change
   ↓
6. onChangeRouteDayOrder syncs to parent
   ↓
7. Parent state updates (if needed)
   ↓
8. ColumnsContainer re-renders with new store
   ↓
9. Column re-renders with updated clientsInRoute
   ↓
10. New Item component renders for the store
```

---

## 🎨 UI Behavior Details

### Autocomplete Component
- **Options**: All available stores from locationMap
- **Search**: By location name or address (togglable)
- **Disabled**: When in edit mode (routeDayActionState.isEditable)
- **On Selection**: Clear input, call onAddStore callback

### After Adding
- Input field clears automatically
- Hover state resets
- Dropdown closes
- New store appears in list below

### Error Cases
- **Duplicate**: Silent (console warning only)
- **Not Found**: Silent (console error only)
- **Invalid**: Silent (early return, no update)

---

## 📱 Responsive Design

The Autocomplete component is wrapped in a flex container:
```typescript
<div className="flex basis-4/5">
  <Autocomplete className="w-full" {...props} />
</div>
```
- Takes 80% of available width
- Responsive on mobile/tablet
- Aligns with other UI elements

---

## 🔐 Security Considerations

✅ **Input Validation**
- Store ID must exist in locationMap
- Route day ID validated

✅ **Immutable Updates**
- No direct state mutations
- Previous state preserved

✅ **Type Safety**
- Full TypeScript coverage
- No `any` types

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Store not appearing | Duplicate prevention triggered | Check console for warning |
| Autocomplete disabled | Edit mode active | Exit edit mode first |
| Wrong position | Race condition | Verify no concurrent updates |
| Input not clearing | Handler not called | Check callback implementation |
| Store details wrong | locationMap outdated | Verify locationMap has latest data |

---

## 📚 Related Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `generateUUIDv4()` | utils/generalUtils | Generate unique IDs |
| `getAddressOfStore()` | utils/stores/utils | Format address display |
| `getRouteDayFromRoutesList()` | utils/routes/utils | Retrieve route day data |
| `move()` | @dnd-kit/helpers | Reorder items (drag & drop) |

---

## 🎓 Learning Resources

### Understanding the Architecture
1. Read `ADD_STORE_ARCHITECTURE.md` for detailed flow
2. Read `IMPLEMENTATION_SUMMARY.md` for complete changes
3. Review inline comments in `handleAddStore()` function

### TypeScript/React Concepts Used
- Callback Props Pattern
- Immutable State Updates
- Controlled Components
- Event Handling
- State Synchronization

### Related Features (Similar Pattern)
- Remove stores
- Reorder stores (drag & drop)
- Select stores (multi-select)
- Edit store details

---

## 🔮 Next Steps

After confirming this works:
1. Test integration with save/reset functionality
2. Add toast notifications on add
3. Implement bulk add feature
4. Add undo/redo capability
5. Optimize performance for large store lists

---

**Last Updated**: 2026-11-22
**Status**: Implementation Complete ✅
**Needs Testing**: Yes - Run test checklist above
