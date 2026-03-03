// Object values
import { Day } from '@/core/object-values/Day';
import { RouteDayStore } from '@/core/object-values/RouteDayStore';

// Entities
import { Route } from '@/core/entities/Route';
import { RouteDay } from '@/core/object-values/RouteDay';

export abstract class RouteRepository {
  abstract insertRouteDays(idRoute: string, idDay: string): Promise<void>;
  abstract insertRouteDayStores(routeDayStores: RouteDayStore[]): Promise<void>;
  abstract deleteRouteDayStores(idRouteDay: string): Promise<void>;
  abstract listRoutesByUser(user: string): Promise<Route[]>;
  abstract listRoutes(): Promise<Route[]>;
  abstract retrieveRouteByIds(routeIds: string[]): Promise<Route[]>;
  abstract listRouteDaysByRoute(id_route: string): Promise<RouteDay[]>;
  abstract listRouteDayStoresByRoute(id_route_day: string): Promise<RouteDayStore[]>;
  abstract listDays(): Promise<Day[]>;
}