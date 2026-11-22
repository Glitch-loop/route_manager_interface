import { RouteDayEffect } from "@/shared/hooks/route-day-location-map/types/types";

// Auxiliar function
function getRouteDayEffect (idRouteDay: string, routeDayEffectsMap: Map<string, RouteDayEffect>): RouteDayEffect {
  const effects = routeDayEffectsMap.get(idRouteDay)
  if (effects === undefined) {
    throw new Error("Change of the color is not possible. The effect for the route day doesn't exist.")
  } 
  return effects;
}


export { 
  getRouteDayEffect
}