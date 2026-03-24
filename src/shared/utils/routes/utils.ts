
import RouteDTO from "@/application/dto/RouteDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import { DAYS } from "@/core/constants/Days";
import { PositionInRouteType, StorePositionInRouteType, StorePositionInRouteType } from "@/shared/types/types";


export function getRouteDayFromRoutesList(routes: RouteDTO[], idRouteDayToFind: string): RouteDayDTO | null {
    for (const route of routes) {
        const { route_day_by_day } = route;
        if (route_day_by_day === undefined || route_day_by_day === null) continue;
        
        for (const [idDay, routeDay] of route_day_by_day) {
            const { id_route_day } = routeDay;
            if (id_route_day === idRouteDayToFind) {
                return routeDay;
            }
        }
    }   
    return null;
}

export function getRouteWhereRouteDayBelongs(routes: RouteDTO[], idRouteDayToFind: string): RouteDTO | null {
    for (const route of routes) {
        const { route_day_by_day } = route;
        if (route_day_by_day === undefined || route_day_by_day === null) continue;
        for (const [idDay, routeDay] of route_day_by_day) {
            const { id_route_day } = routeDay;
            if (id_route_day === idRouteDayToFind) {
                return route;
            }
        }
    }
    return null;
}

export function createMapOfRouteDay(routes: RouteDTO[]): Map<string, RouteDayDTO> {
    const map = new Map<string, RouteDayDTO>();
    for (const route of routes) {
        const { route_day_by_day } = route;
        if (route_day_by_day === undefined || route_day_by_day === null) continue;
        for (const [idDay, routeDay] of route_day_by_day) {
            map.set(routeDay.id_route_day, routeDay);
        }
    }
    return map;
}

export function createMapStoresInRouteDay(routes: RouteDTO[]): Map<string, StorePositionInRouteType[]> {
    const map = new Map<string, StorePositionInRouteType[]>(); // id_store -> array of StorePositionInRouteType
    
    for (const route of routes) {
        const { route_day_by_day } = route;
        if (route_day_by_day === undefined || route_day_by_day === null) continue;
        for (const [idDay, routeDay] of route_day_by_day) {
            for (const routeDayStore of routeDay.stores) {
                if (!map.has(routeDayStore.id_store)) {
                    map.set(routeDayStore.id_store, []);
                }
                map.get(routeDayStore.id_store)?.push({
                    idRoute: route.id_route,
                    routeName: route.route_name,
                    idRouteDay: routeDay.id_route_day,
                    position: routeDayStore.position_in_route,
                    dayName: DAYS[routeDay.id_day].day_name,
                    idDay: idDay,
                    idStore: routeDayStore.id_store
                });
            }
        }
    }
    return map;
}