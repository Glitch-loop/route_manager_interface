'use server'

// Dtos
import { RouteDTO } from '@/shared/dtos/RouteDTO';
import { RouteDayDTO } from '@/shared/dtos/RouteDayDTO';
import { RouteDayLocationDTO } from '@/shared/dtos/RouteDayLocationDTO';
import { RawRouteApiResponse } from '@/shared/raw-api-responses/rawRouteApiResponse';
import { RawRouteDayApiResponse } from '@/shared/raw-api-responses/rawRouteDayApiResponse';

// Raw api response
import { rawApiResponseToDTOMapper, RawApiResponseToDTOMapper } from '@/shared/mappers/rawApiResponseToDTOMapper';

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';


interface RouteDayByUserRequest {
  id_users: string[];
}

interface RouteDaysByRouteRequest {
  id_routes: string[];
}

interface RouteDaysByRouteDayRequest {
  id_route_days: string[];
}

interface OrganizeRouteDayLocationRequest {
  position_in_route: number;
  id_location: string;
  id_route_day_location: string;
}

interface OrganizeRouteDayRequest {
  locations: OrganizeRouteDayLocationRequest[];
}

const mapper = new RawApiResponseToDTOMapper();

export async function listRoutesByUser(user: string): Promise<RouteDTO[]> {
  try {
    const routeDayByUserRequest: RouteDayByUserRequest = { id_users: [] };
    const routesId = new Set<string>();
    const routes = new Map<string, RouteDTO>();
    const routesArr: RouteDTO[] = [];

    routeDayByUserRequest.id_users.push(user);
    const responseRouteDays: RawRouteDayApiResponse[] = await apiClient.post<RawRouteDayApiResponse[], RouteDayByUserRequest>(
      '/route-organization/routes/days/users/ids',
      routeDayByUserRequest
    );

    responseRouteDays.forEach((assignedRoute) => {
      const { id_route } = assignedRoute;
      routesId.add(id_route);
    });

    const responseRoutes = await apiClient.get<RawRouteApiResponse[]>(
      '/route-organization/routes'
    );

    responseRoutes.data.forEach((route: RawRouteApiResponse) => {
      const { id_route } = route;
      if (routesId.has(id_route)) {
        routes.set(id_route, mapper.toDTO(route));
      }
    });

    responseRouteDays.forEach((assignedRoute) => {
      const { id_route } = assignedRoute;
      if (routes.has(id_route)) {
        routes.get(id_route)?.route_day.push(mapper.toDTO(assignedRoute));
      }
    });

    for (const id_route of routesId) {
      routesArr.push(routes.get(id_route)!);
    }

    return routesArr;
  } catch (error) {
    throw new Error('Error fetching routes: ' + error);
  }
}

export async function listRoutes(): Promise<RouteDTO[]> {
  try {
    const routesArr: RouteDTO[] = [];
    

    const responseRoutes: RawRouteApiResponse[] = await apiClient.get<RawRouteApiResponse[]>(
      '/route-organization/routes'
    );

    for (const rawRoute of responseRoutes.data) {
      const { id_route } = rawRoute;

      const routeDays:RouteDayDTO[] = await listRouteDaysByRoute(id_route);
      const route:RouteDTO = rawApiResponseToDTOMapper.toDTO(rawRoute);

      for (const routeDay of routeDays) {
        route.route_day.push(routeDay);
      }

      routesArr.push(route);
    }

    return routesArr;
  } catch (error) {
    throw new Error('Error fetching routes: ' + error);
  }
}

export async function listRouteDaysByRoute(id_route: string): Promise<RouteDayDTO[]> {
  try {
    const routeDayByRouteRequest: RouteDaysByRouteRequest = { id_routes: [id_route] };
    const responseRouteDays: RawRouteDayApiResponse[] = await apiClient.post<RawRouteDayApiResponse[], RouteDaysByRouteRequest>(
      '/route-organization/routes/days/routes/ids',
      routeDayByRouteRequest
    );

    return responseRouteDays.map((assignedRoute) => mapper.toDTO(assignedRoute));
  } catch (error) {
    throw new Error('Error fetching route days by route' + error);
  }
}

export async function listRouteDayStoresByRoute(id_route_day: string): Promise<RouteDayLocationDTO[]> {
  try {
    const routeDayByRouteDayID: RouteDaysByRouteDayRequest = { id_route_days: [id_route_day] };
    const responseRouteDays: RawRouteDayApiResponse[] = await apiClient.post<RawRouteDayApiResponse[], RouteDaysByRouteDayRequest>(
      '/route-organization/routes/days/ids',
      routeDayByRouteDayID
    );

    const routeDay = responseRouteDays.at(0);
    if (!routeDay) {
      return [];
    }

    const routeDayDTO = mapper.toDTO(routeDay);
    return routeDayDTO.locations;
  } catch (error) {
    throw new Error('Error fetching route day stores by route day' + error);
  }
}

export async function organizeRouteDay(
  id_route_day: string,
  routeDayStoresDTO: RouteDayLocationDTO[]
): Promise<void> {
  const routeDayStore = [...routeDayStoresDTO];

  routeDayStore.sort((a, b) => a.position_in_route - b.position_in_route);

  const routeDayStoreToUpdate: OrganizeRouteDayLocationRequest[] = routeDayStore.map((store, index) => ({
    id_location: store.id_location,
    id_route_day_location: store.id_route_day_store,
    position_in_route: index + 1,
  }));

  const requestBody: OrganizeRouteDayRequest = {
    locations: routeDayStoreToUpdate,
  };

  try {
    await apiClient.patch<null, OrganizeRouteDayRequest>(
      `/route-organization/routes/days/${id_route_day}/organize`,
      requestBody
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error organizing route day ${id_route_day}: ${message}`);
  }
}