import { useState } from "react";

import { IMapMarker } from "@/interfaces/interfaces";

import { RouteDayEffect, RouteDayFilters } from "@/shared/hooks/route-day-location-map/types/types";

import { generateRandomColor } from "@/shared/utils/styles/utils";

export function useRouteDayLocationMap() {
  const [
    effectRouteDay, 
    setEffectRouteDay
  ] = useState<Map<string, RouteDayEffect>>(new Map());

  const [ 
    filterRouteDay,
    setFilterRouteDay
  ] = useState<Map<string, RouteDayFilters>>(new Map());

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
    if (effectRouteDay.has(routeDayId)) {
      effectRouteDay.set(routeDayId, routeDayEffect);
      setEffectRouteDay(new Map(effectRouteDay));
    }
  }

  const handleAddRouteDayFilters = (
    routeDayId: string,
    routeDayFilters: RouteDayFilters = {
      sellingGoal: null,
      pickerProduct: null
    }
  ) => {
    setFilterRouteDay((prev) => {
      const newMap = new Map(prev);
      newMap.set(routeDayId, { ...routeDayFilters });
      return newMap;
    });
  }

  const handleRemoveRouteDayFilter = (routeDayId: string) => {
    setFilterRouteDay((prev) => {
      const newMap = new Map(prev);
      newMap.delete(routeDayId);
      return newMap;
    });
  }

  return {
    effectRouteDay,
    handleAddRouteDayEffects,
    handleRemoveRouteDayEffects,
    handleUpdateRouteDayEffects,
    filterRouteDay,
    handleAddRouteDayFilters,
    handleRemoveRouteDayFilter,

  };
}