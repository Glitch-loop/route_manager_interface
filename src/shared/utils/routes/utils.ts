import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { DAYS } from "@/core/constants/Days";
import { StorePositionInRouteType } from "@/shared/types/types";

export function getRouteDayFromRoutesList(
  routes: RouteDTO[],
  idRouteDayToFind: string,
): RouteDayDTO | null {
  for (const route of routes) {
    const { route_day } = route;

    const routeDayFound: RouteDayDTO | undefined = route_day.find(
      (routeDay) => routeDay.id_route_day === idRouteDayToFind
    );

    if (routeDayFound !== undefined) {
      return routeDayFound;
    }
  }
  return null;
}

export function getRouteWhereRouteDayBelongs(
  routes: RouteDTO[],
  idRouteDayToFind: string,
): RouteDTO | null {
  for (const route of routes) {
    const { route_day } = route;
    for (const routeDay of route_day) {
      const { id_route_day } = routeDay;
      if (id_route_day === idRouteDayToFind) {
        return route;
      }
    }
  }
  return null;
}

export function createMapOfRouteDay(
  routes: RouteDTO[],
): Map<string, RouteDayDTO> {
  const map = new Map<string, RouteDayDTO>();
  for (const route of routes) {
    const { route_day } = route;
    for (const routeDay of route_day) {
      map.set(routeDay.id_route_day, routeDay);
    }
  }
  return map;
}

export function createMapStoresInRouteDay(
  routes: RouteDTO[],
): Map<string, StorePositionInRouteType[]> {
  const map = new Map<string, StorePositionInRouteType[]>(); // id_location -> array of StorePositionInRouteType

  for (const route of routes) {
    const { route_day } = route;
    for (const routeDay of route_day) {
      for (const routeDayLocation of routeDay.locations) {
        if (!map.has(routeDayLocation.id_location)) {
          map.set(routeDayLocation.id_location, []);
        }
        map.get(routeDayLocation.id_location)?.push({
          idRoute: route.id_route,
          routeName: route.route_name,
          idRouteDay: routeDay.id_route_day,
          position: routeDayLocation.position_in_route,
          dayName: DAYS[routeDay.id_day]?.day_name ?? '',
          idDay: routeDay.id_day,
          idStore: routeDayLocation.id_location,
          idRouteDayStore: routeDayLocation.id_route_day_store,
        });
      }
    }
  }
  return map;
}
