import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IRouteDayStores,
    IStore,
    IDayGeneralInformation,
    IDay,
    IRouteDay,
    IRoute,
    IStoreStatusDay,
    IResponse,
    IUser,
} from '@/interfaces/interfaces';

// Utils
//import { determineRouteDayState } from '@/utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '@/interfaces/enumStoreStates';
import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '@/utils/responseUtils';

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function getAllRoutes():Promise<IRoute[]> {
    const allRoutesResponse:IResponse<IRoute[]> = await repository.getAllRoutes();

    const allRoutes:IRoute[] = getDataFromApiResponse(allRoutesResponse);

    return allRoutes;
}

export async function insertRoute() {};

export async function updateRoute() {}; 

export async function deleteRoute() {};

// Related to route days
export async function getRouteDays():Promise<IRouteDay[]> {
  const allRouteDaysResponse:IResponse<IRouteDay[]> = await repository.getAllRouteDays();
  return getDataFromApiResponse(allRouteDaysResponse);
};

export async function getStoresOfRouteDay(routeDay:IRouteDay):Promise<IRouteDayStores[]> {
  const { id_route_day } = routeDay;
  const allStoresInRoutedayResponse:IResponse<IRouteDayStores[]> = await repository.getAllStoresInARouteDay(id_route_day);
  return getDataFromApiResponse(allStoresInRoutedayResponse);
};

export async function updateRouteDay() {};


