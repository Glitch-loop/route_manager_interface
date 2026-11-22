import React, { useState, useEffect, Dispatch } from 'react';
import { Dayjs } from "dayjs";
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';

// DTOs
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// Types

// UI components
import { Button } from "@mui/material";
import {Column} from '@/app/route_administration/components/SortableContainer/Column';
import { Item } from '@/app/route_administration/components/SortableContainer/Item';
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";

// Utils
import { generateUUIDv4 } from "@/utils/generalUtils";
import { getNameOfRouteDay, getRouteDayFromRoutesList } from "@/shared/utils/routes/utils";
import { 
  SortableLocationType, 
  RouteDayActionStateType 
} from '@/app/route_administration/components/SortableContainer/Types/types';
import { RouteDayEffectAction } from '@/app/route_administration/types/routeDayEffectActions';

import { 
  RouteDayEffect, 
} from "@/shared/hooks/route-day-location-map/types/types";
import { getRouteDayEffect } from '@/shared/hooks/route-day-location-map/utils/utils';

type RouteDayContainerProps = {
  selectedRouteDays:Map<string, RouteDayDTO>; // id route day, compact information of location for sorting.
  locationMap: Map<string, LocationDTO>; // id location, locationDTO.
  routes: RouteDTO[];
  routeDayEffects: Map<string, RouteDayEffect>,
  onChangeRouteDayEffect: (routeDayId: string, routeDayEffect: RouteDayEffect) => void,
  onChangeRouteDayOrder: (newOrder: Map<string, RouteDayDTO>) => void;
};



// Auxiliars functions
function getRouteDayActionState(idRouteDay: string, routeActionStatesMap: Map<string, RouteDayActionStateType>): RouteDayActionStateType {
  const actionStates = routeActionStatesMap.get(idRouteDay)
  if (actionStates === undefined) {
    throw new Error(`Route day with id ${idRouteDay} doesn't have its action state.`)
  } 
  return actionStates;
}

export default function ColumnsContainer({
  selectedRouteDays,
  locationMap,
  routes,
  routeDayEffects,
  onChangeRouteDayEffect,
  onChangeRouteDayOrder,
  // onSaveRouteModification,
}: RouteDayContainerProps) {
  // --Use states--
  // Related to route organization
  const [routeDaysInModification, setRouteDaysInModification] = useState<Record<string, SortableLocationType[]>>({});
  const [routeDayActionStateMap, setRouteDayActionStateMap] = useState<Map<string, RouteDayActionStateType>>(new Map<string, RouteDayActionStateType>());
  const [selectedRouteDayLocationMap, setSelectedRouteDayLocationMap] = useState<Map<string, Set<string>>>(new Map<string, Set<string>>());

  // Related to route transactions
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);


  // --Use effects
  // Synchronize state: transform selectedRouteDays to sortable format (INITIAL LOAD ONLY)
  useEffect(() => {
    const newRouteDaysInModification: Record<string, SortableLocationType[]> = {};

    // Transform to sortable format
    selectedRouteDays.forEach((routeDay: RouteDayDTO) => {
      const { id_route_day, locations } = routeDay;
      newRouteDaysInModification[id_route_day] = locations.map((loc: RouteDayLocationDTO) => {
        return {
          ...loc,
          id: loc.id_route_day_store,
        }
      });
    });

    // Update internal state - DO NOT call onChangeRouteDayOrder here
    setRouteDaysInModification(newRouteDaysInModification);

    // Setting action for the route day.
    setRouteDayActionStateMap((prev) => {
      const newRouteDayActionsMap: Map<string, RouteDayActionStateType>
        = new Map<string, RouteDayActionStateType>();

      selectedRouteDays.forEach((routeDay) => {
        const { id_route_day } = routeDay;
        if (!prev.has(id_route_day)) {
          newRouteDayActionsMap.set(id_route_day, {
            isEditable: false,
            isDeletedMode: false
          })
        } else {
          newRouteDayActionsMap.set(id_route_day, { ...prev.get(id_route_day)! });
        }
      });
      return newRouteDayActionsMap;
    });
  }, [selectedRouteDays]);

  // Handle drag-and-drop changes ONLY - sync back to parent
  useEffect(() => {
    // Create a reference to compare with selectedRouteDays
    // Only sync if internal state has changed from drag operations
    let hasChanged = false;
    
    Object.entries(routeDaysInModification).forEach(([idRouteDay, routeDayLocations]) => {
      if (selectedRouteDays.has(idRouteDay)) {
        const originalLocations = selectedRouteDays.get(idRouteDay)?.locations || [];
        // Check if the locations have changed
        if (originalLocations.length !== routeDayLocations.length) {
          hasChanged = true;
        } else {
          for (let i = 0; i < originalLocations.length; i++) {
            if (originalLocations[i].id_route_day_store !== routeDayLocations[i].id_route_day_store) {
              hasChanged = true;
              break;
            }
          }
        }
      }
    });

    // Only sync if something actually changed
    if (hasChanged) {
      const newOrderOfSelectedRouteDays = new Map<string, RouteDayDTO>(selectedRouteDays);
      Object.entries(routeDaysInModification).forEach(([idRouteDay, routeDayLocations]) => {
        if (newOrderOfSelectedRouteDays.has(idRouteDay)) {
          const currentRouteDay: RouteDayDTO = newOrderOfSelectedRouteDays.get(idRouteDay)!;
          newOrderOfSelectedRouteDays.set(
            idRouteDay,
            {
              ...currentRouteDay,
              locations: routeDayLocations as RouteDayLocationDTO[]
            }
          );
        }
      });
      onChangeRouteDayOrder(newOrderOfSelectedRouteDays);
    }
  }, [routeDaysInModification]);


  // --Handlers--
  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDateSelected(start);
    setEndDateSelected(end);
  };

  const handleApplyDateRange = (
    startDate: Dayjs | null,
    endDate: Dayjs | null,
  ) => {
    if (startDate && endDate) {
      // const allStoreIds = Object.values(routeDaysInModification)
      //   .flat()
      //   .map((store) => store.id_location);
      // onRequireRouteTransactions(
      //   startDate.toDate(),
      //   endDate.toDate(),
      //   allStoreIds,
      // );
    }
  };

  /**
   * Save route modification for a specific route day.
   */
  const handleSaveRouteModification = async (idRouteDay: string) => {
    const storesInRouteDay = routeDaysInModification[idRouteDay];
    // return
    if (!storesInRouteDay) return;

    const updatedStoresInRouteDay:SortableLocation[] = storesInRouteDay.map((store, index) => ({
      ...store,
      position_in_route: index,
    }));
    console.log("updatedStoresInRouteDay: ", updatedStoresInRouteDay)

    updatedStoresInRouteDay.forEach((store) => {
      console.log(locationMap.get(store.id_location)?.location_name)
    })
    // await onSaveRouteModification(idRouteDay, updatedStoresInRouteDay);
  };

  const handleModifyActionState = (idRouteDay: string, newState: RouteDayActionStateType) => {
    setRouteDayActionStateMap((prev) => (new Map<string, RouteDayActionStateType>(prev.set(idRouteDay, newState))));
  }

  /**
   * Remove stores from a route day by their id_route_day_store.
   */
  const handleRemoveStores = (idRouteDay: string) => {
    if(selectedRouteDayLocationMap.has(idRouteDay)) {
      const idsToRemove:Set<string> = selectedRouteDayLocationMap.get(idRouteDay)!
      setRouteDaysInModification((prev) => {
        const sortableLocations  = prev[idRouteDay];
        prev[idRouteDay] = sortableLocations.filter((location) => 
          !idsToRemove.has(location.id_route_day_store))
        return {...prev};
      });
    }
  };

  const handleSelectRouteDayLocation = (idRouteDay: string, idRouteDayLocation: string) => {
    /*
      Rules:
      1. If the item is not in the data structure then the user has selected it.
      2. If the items is already in the structure then the user is unselected it.
    */
    if(selectedRouteDayLocationMap.has(idRouteDay)) {
      const idRouteDayLocationsSet:Set<string> =  selectedRouteDayLocationMap.get(idRouteDay)!;

      if (idRouteDayLocationsSet.has(idRouteDayLocation)) {
        idRouteDayLocationsSet.delete(idRouteDayLocation);
      } else {
        idRouteDayLocationsSet.add(idRouteDayLocation);
      }
    } else {
      // This case is when the user is starting the process for selecting route day locations.
      selectedRouteDayLocationMap.set(idRouteDay, new Set(idRouteDayLocation))   
    }
    setSelectedRouteDayLocationMap(new Map<string, Set<string>>(selectedRouteDayLocationMap));
  }

  return (
  <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
    <div className="flex basis-1/5 items-center flex-col shrink-0  bg-system-third-background p-1 rounded-lg gap-2">
      <h2 className="text-lg md:text-xl font-bold mb-4">
        Administración de días en ruta
      </h2>
      <RangeDateSelection
        initialDirection="before"
        initialSelectedRange="0week"
        onRangeChange={handleDateRangeChange}
      />
      <div className="flex flex-col justify-center items-center w-full gap-2">
        <span className="text-base font-bold">Fechas seleccionadas:</span>
        <div className="flex flex-row justify-center">
          <span>
            {startDateSelected
              ? startDateSelected.format("DD/MM/YYYY")
              : "N/A"}
          </span>
          <span className="mx-2">-</span>
          <span>
            {endDateSelected ? endDateSelected.format("DD/MM/YYYY") : "N/A"}
          </span>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() =>
            handleApplyDateRange(startDateSelected, endDateSelected)
          }
        >
          Aplicar fechas
        </Button>
      </div>
    </div>
      <DragDropProvider
        onDragOver={(event) => {
          setRouteDaysInModification((items:Record<string, SortableLocationType[]>) => 
            { return {...move(items, event)}; }
          );
        }}
      >
      <div className="Root overflow-auto ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">        
        {
          Object.entries(routeDaysInModification).map(([column, items]) => {
            const currentRouteDayEffect:RouteDayEffect = getRouteDayEffect(column, routeDayEffects);
            const routeDayActionState:RouteDayActionStateType = getRouteDayActionState(column, routeDayActionStateMap)
            const {isEditable, isDeletedMode} = routeDayActionState;

            return (
              <Column 
                key={column} 
                id={column} 
                routeName={ getNameOfRouteDay(routes, column) }
                numberOfClientsInRoute={ items.length }
                onSaveRouteModification={handleSaveRouteModification}
                routeDayActionState={routeDayActionState}
                onChangeRouteDayActionState={handleModifyActionState}
                routeDayEffect={currentRouteDayEffect}
                onChangeRouteDayEffect={onChangeRouteDayEffect}
                onRemoveStores={handleRemoveStores}
                >
              <div className="overflow-auto">
                {items.map((sortableItem, index) => {
                  let isSelected: boolean = false;
                  const { id_location, id } = sortableItem;
                  const locationData = locationMap.get(id_location);
                  if(isDeletedMode) {
                    const selectedRouteDayLocationSet:Set<string>|undefined = 
                      selectedRouteDayLocationMap.get(column);
                    if (selectedRouteDayLocationSet === undefined) 
                      isSelected = false;
                    else
                      isSelected = selectedRouteDayLocationSet.has(id);
                  }
                  return (
                    <Item 
                      key={sortableItem.id} 
                      id={sortableItem.id} 
                      index={index} 
                      column={column} 
                      locationData={locationData}
                      onSelectItem={handleSelectRouteDayLocation}
                      isDraggable={isEditable}
                      isSelectable={isDeletedMode}
                      isSelected={isSelected}
                    />
                  )
                })}
              </div>
            </Column>
            )
          }
        )
        }
      </div>
    </DragDropProvider>
  </div>
  );
}