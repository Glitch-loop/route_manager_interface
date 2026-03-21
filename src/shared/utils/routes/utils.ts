
import RouteDTO from "@/application/dto/RouteDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";


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