// Libraries
import React, { useState, useMemo } from "react";

// DTOs
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// Interfaces
import { IMapMarker } from "@/interfaces/interfaces";

// Types
import { routeDayFiltersType } from "@/app/analytics/types/types";
// import { SellingGoalType } from "@/shared/components/SellingGoal/types/types";
// import { ItemsPickerType } from "@/shared/components/ItemsPicker/types/types";
import { 
  RouteDayEffect, 
  RouteDayFilters 
} from "@/shared/hooks/route-day-location-map/types/types";

// Enums
import DAY_OPERATIONS from "@/core/enums/DayOperations";

// Utils
import { generateRandomColor } from "@/shared/utils/styles/utils";
import { calculateTotalStoreOfTransactionDescriptionConcept } from "@/shared/utils/transactions/utils";

/*
  TODO: When applying this effect the user experienced difficulties at moment of identify a particular store.
  It got worse if there was several route days each one with its own colors; All of them started in white 
  color and finnished in black.
*/ 
// TODO: At moment of displaying the gradient color, the user was not able to differentiate one 
// function calculateGradientForMarker(baseColor: string, totalItemInSet: number, itemPositionInSet: number): string {
//   // Calculate gradient color: first store is lightest, last store is darkest
//   return totalItemInSet > 1 ? 
//     getGradientColor(baseColor, totalItemInSet - 1 - itemPositionInSet, totalItemInSet)
//     : baseColor;
// }

type RouteDayLocationMap = {
  routeDaysToDisplay: RouteDayDTO[]|Map<string,RouteDayDTO>;
  storeMap: Map<string, LocationDTO>;
  routeTransactionByStoreMap: Map<string, RouteTransactionDTO[]>;
  onHoverMarkerComponent: (location: LocationDTO) => React.ReactNode;
  onClickMarkerComponent: (location: LocationDTO) => React.ReactNode;
}

export function useRouteDayLocationMap({
  routeDaysToDisplay,
  storeMap,
  routeTransactionByStoreMap,
  onHoverMarkerComponent,
  onClickMarkerComponent
}: RouteDayLocationMap) {
  
  const [
    effectRouteDay, 
    setEffectRouteDay
  ] = useState<Map<string, RouteDayEffect>>(new Map());

  const [
    routeDayFilters, 
    setRouteDaysFilters
  ] = useState<RouteDayFilters>({ sellingGoal: null, pickerProduct: null });

  const routeDayLocationMarkers = useMemo<IMapMarker[]>(() => {
    const markers: IMapMarker[] = [];
    let routeDays:RouteDayDTO[] = [];
    
    if (Array.isArray(routeDaysToDisplay)) routeDays = [...routeDays];
    else routeDays = Array.from(routeDaysToDisplay.values());
    
    routeDays.forEach((routeDay: RouteDayDTO) => {
      const { id_route_day, locations } = routeDay;
      
      // Apply effects
      const effect = effectRouteDay.get(id_route_day);
      if (!effect?.showStores) return; // Skip if showStores is false
      const baseColor = effect.assignedColor;

      // Create markers
      locations.forEach((routeDayLocation) => {
        const location = storeMap.get(routeDayLocation.id_location);
        if (location !== undefined) {
          const gradientColor = baseColor;
          const { id_route_day_store } = routeDayLocation;
          const { latitude, longitude, id_location } = location;

          markers.push({
            id_marker: id_route_day_store,
            id_item: id_location,
            id_group: id_route_day,
            color_item: gradientColor,
            latitude: latitude,
            longitude: longitude,
            hoverComponent: onHoverMarkerComponent(location),
            clickComponent: onClickMarkerComponent(location),
          });
        }
      });
    });

    // Apply filters
    let filteredMarkers = [...markers];
    const { sellingGoal } = routeDayFilters;
    if (sellingGoal !== null) {
      const { target, show } = sellingGoal;
      if (target !== null && show !== "show_all") {
        filteredMarkers = filteredMarkers.filter((marker) => {
          const total = calculateTotalStoreOfTransactionDescriptionConcept(
            marker.id_item,
            DAY_OPERATIONS.sales,
            routeTransactionByStoreMap,
            false
          )
          return show === "show_only_meet" ? total >= target : total < target;
        });
      }
    }

    // if (routeDayFilter.pickerProduct !== null) {
    //   const { selectedItems, show } = routeDayFilter.pickerProduct;
    //   if (selectedItems.length > 0) {
    //     const selectedSet = new Set(selectedItems);
    //     filteredMarkers = filteredMarkers.filter((marker) => {
    //       const transactions = mapRouteTransactionByStore.get(marker.id_item) ?? [];
    //       const hasProduct = transactions.some((transaction) =>
    //         transaction.transaction_description.some(
    //           (desc) =>
    //             desc.id_transaction_operation_type === DAY_OPERATIONS.sales &&
    //             selectedSet.has(desc.id_product)
    //         )
    //       );
    //       return show === "show_only_meet" ? hasProduct : !hasProduct;
    //     });
    //   }
    // }
    return filteredMarkers;
  }, [
    routeDaysToDisplay,
    storeMap,
    routeTransactionByStoreMap,
    onHoverMarkerComponent,
    onClickMarkerComponent,
    routeDayFilters,
    effectRouteDay
  ]);

  const [selectedLocation, setSelectedLocation] = 
    useState<string | null>(null);

  /**
   * This function add a new effect to a route day.
   * 
   * By default locations are being displayed, a random color
   * is generated for the route day and selected is set as undefined.
   * 
   * @param routeDayId 
   * @param showLocationEffect
   * @param initialColorEffect 
  */
  const handleAddRouteDayEffects = (
    routeDayId: string,
    routeDayEffect: RouteDayEffect = {
      showStores: true,
      assignedColor: generateRandomColor(),
      selectedLocation: undefined
    }
  ) => {
    setEffectRouteDay((prev) => {
      const newMap = new Map(prev);
      newMap.set(routeDayId, { ...routeDayEffect });
      return newMap;
    });
  }

  /**
   * Removes a set of effects for a particuar day.
   * 
   * @param routeDayId 
   */
  const handleRemoveRouteDayEffects = (routeDayId: string) => {
    setEffectRouteDay((prev) => {
      const newMap = new Map(prev);
      newMap.delete(routeDayId);
      return newMap;
    });
  }


  /**
   * Updates an existing set of effects for a particular day.
   * 
   * If the day that it is intended to update doesn't exist then 
   * it passes it (avoiding to set effects to unexising route days).
   * 
   * @param routeDayId 
   * @param routeDayEffect 
   */
  const handleUpdateRouteDayEffects = (
    routeDayId: string,
    routeDayEffect: RouteDayEffect
  ) => {

    // Business rule (11/25/26): Only one location can be selected at a time.
    const { selectedLocation } = routeDayEffect;

    // Only one location can be selected at a time.
    if(selectedLocation) {
      setSelectedLocation(selectedLocation);

      effectRouteDay.forEach((value, key) => {
        if (key === routeDayId) {
          effectRouteDay.set(key, {...routeDayEffect}) 
        } else {
          effectRouteDay.set(key, {...value, selectedLocation: undefined}) 
        }
      })
    }


    if (effectRouteDay.has(routeDayId)) {
      effectRouteDay.set(routeDayId, routeDayEffect);
      setEffectRouteDay(new Map(effectRouteDay));
    }
  }

  const handleSetRouteDayFilters = (
    setFilters: RouteDayFilters
  ) => {
    setRouteDaysFilters(setFilters);
  }

  const handleResetRouteDayFilter = (filterToReset: routeDayFiltersType) => {
    if (filterToReset === "sellingGoal") {
      setRouteDaysFilters({...routeDayFilters, sellingGoal: null});
    } else if (filterToReset === "pickItemsFilter") {
      setRouteDaysFilters({...routeDayFilters, pickerProduct: null});
    }
  }

  return {
    effectRouteDay,
    handleAddRouteDayEffects,
    handleRemoveRouteDayEffects,
    handleUpdateRouteDayEffects,
    routeDayFilters,
    handleSetRouteDayFilters,
    handleResetRouteDayFilter,
    routeDayLocationMarkers,
    selectedLocation
  };
}