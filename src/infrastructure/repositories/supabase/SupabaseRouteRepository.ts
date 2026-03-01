// Libraries
import { injectable, inject } from 'tsyringe';

// Object values
import { Day } from '@/core/object-values/Day';
import { RouteDay } from '@/core/object-values/RouteDay';
import { RouteDayStore } from '@/core/object-values/RouteDayStore';

// Entities
import { Route } from '@/core/entities/Route';

// Interfaces
import { RouteRepository } from '@/core/interfaces/RouteRepository';

// Infrastructure
import { SupabaseDataSource } from '@/infrastructure/datasources/SupabaseDataSource'; 

// Utils
import { TOKENS } from '@/infrastructure/di/tokens';
import { SERVER_DATABASE_ENUM } from '@/infrastructure/persistence/enums/serverTablesEnum';

@injectable()
export class SupabaseRouteRepository implements RouteRepository {
  constructor(@inject(TOKENS.SupabaseDataSource) private readonly dataSource: SupabaseDataSource) {}

  private get supabase() {
    return this.dataSource.getClient();
  }

  async listRoutes(): Promise<Route[]> {
    try {

      const routes:Route[] = [];

      const { data, error } = await this.supabase.from(SERVER_DATABASE_ENUM.ROUTES).select('*');
      if (error) throw new Error('Error fetching routes: ' + error.message);

      for (const route of data) {
        const { id_route, route_name, description, route_status, id_vendor } = route;
        routes.push(new Route(
          id_route,
          route_name,
          description,
          route_status,
          id_vendor,
          []
        ))
      }

      return routes;
    } catch (error) {
      throw new Error('Error fetching routes: ' + error);
    }
  }

  async listRoutesByUser(user: string): Promise<Route[]> {
    try {
      const { data, error } = await this.supabase
        .from(SERVER_DATABASE_ENUM.ROUTES)
        .select('*')
        .eq('id_vendor', user);

      if (error) throw new Error('Error fetching routes: ' + error.message);

      const routes: Route[] = data.map(route => {
        const { id_route, route_name, description, route_status, id_vendor } = route;
        return new Route(id_route, route_name, description, route_status, id_vendor, []);
      });

      return routes;
        
    } catch (error) {
      throw new Error('Error fetching routes: ' + error);
    }
  }

  async retrieveRouteByIds(routeIds: string[]): Promise<Route[]> {
    if (!routeIds.length) return [];

    try {
      const { data, error } = await this.supabase
        .from(SERVER_DATABASE_ENUM.ROUTES)
        .select('*')
        .in('id_route', routeIds);

      if (error) throw new Error('Error fetching routes by ids: ' + error.message);

      const routes: Route[] = data.map(route => {
        const { id_route, route_name, description, route_status, id_vendor } = route;
        return new Route(id_route, route_name, description, route_status, id_vendor, []);
      });

      return routes;
    } catch (error) {
      throw new Error('Error fetching routes by ids: ' + error);
    }
  }

  async listDays(): Promise<Day[]> {
    try {
      const { data, error } = await this.supabase.from(SERVER_DATABASE_ENUM.DAYS).select();
      if (error) throw new Error('Error fetching days: ' + error.message);
      return data;
    } catch (error) {
      throw new Error('Error fetching days: ' + error);
    }
  }

  async listRouteDaysByRoute(id_route: string): Promise<RouteDay[]> {
    try {
      const { data, error } = await this.supabase
        .from(SERVER_DATABASE_ENUM.ROUTE_DAY)
        .select('*')
        .eq('id_route', id_route);
      if (error) throw new Error('Error fetching route days by route: ' + error.message);
      return data;
    } catch (error) {
      throw new Error('Error fetching route days by route: ' + error);
    }
  }

  async listRouteDayStoresByRoute(id_route_day: string): Promise<RouteDayStore[]> {
    try {
      const { data, error } = await this.supabase
        .from(SERVER_DATABASE_ENUM.ROUTE_DAY_STORES)
        .select('*')
        .eq('id_route_day', id_route_day);
      if (error) throw new Error('Error fetching route day stores by route day: ' + error.message);
      return data;
    } catch (error) {
      throw new Error('Error fetching route day stores by route day: ' + error);
    }
  }
  
}