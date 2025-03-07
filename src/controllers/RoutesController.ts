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
