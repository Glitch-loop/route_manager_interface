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
import DAYS from "@/utils/days";

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function getAllRoutes():Promise<IRoute[]> {
    const allRoutesResponse:IResponse<IRoute[]> = await repository.getAllRoutes();

    const allRoutes:IRoute[] = getDataFromApiResponse(allRoutesResponse);

    return allRoutes;
}

export async function createRouteDays(route:IRoute):Promise<IResponse<IRouteDay[]>> {
  const routeDaysOfRoute:IRouteDay[] = [];
  const { id_route } = route;
  for (const key in DAYS) {
    routeDaysOfRoute.push({
      id_route_day: '',
      id_route: id_route,
      id_day: key,
    });
  }

  return await repository.insertDaysOfRoute(routeDaysOfRoute);


}

export async function insertRoute(routeToInsert:IRoute):Promise<IResponse<IRoute>> {
  // Active routes always have route_status of 1
  const record:IRoute = {
    ...routeToInsert,
    route_status: 1,
    route_name: routeToInsert.route_name.toLocaleLowerCase()
  }


  const reponseInsertRoute:IResponse<IRoute> = await repository.insertRoute(record);
  if (apiResponseStatus(reponseInsertRoute, 201)) {
    const insertedRoute:IRoute = getDataFromApiResponse(reponseInsertRoute);
    const responseInsertRouteDays = await createRouteDays(insertedRoute);
    
    reponseInsertRoute.responseCode = responseInsertRouteDays.responseCode;

    if (!apiResponseStatus(reponseInsertRoute, 201)) {
      hardDeleteRouteDays(insertedRoute)
      hardDeleteRoute(insertedRoute);
      
    } else {
      /* There is not instructions */
    }
  }  else {
    /* There is not instrucctions. */
  }



  return reponseInsertRoute;
};

export async function updateRoute(routeToUpdate:IRoute):Promise<IResponse<IRoute>> {
  const record:IRoute = {
    ...routeToUpdate,
    route_name: routeToUpdate.route_name.toLocaleLowerCase()
  }
  const reponseUpdateRoute:IResponse<IRoute> = await repository.updateRoute(record);

  return reponseUpdateRoute;
}; 

export async function hardDeleteRoute(routeToDelete:IRoute):Promise<IResponse<null>> {
  const reponseDeleteRoute:IResponse<null> = await repository.deleteRoute(routeToDelete);

  return reponseDeleteRoute;
}

export async function hardDeleteRouteDays(route:IRoute):Promise<IResponse<null>> {
  const reponseDeleteRouteDays:IResponse<null> = await repository.deleteDaysOfRoute(route);
  
  return reponseDeleteRouteDays;

}

export async function deleteRoute(routeToUpdate:IRoute):Promise<IResponse<IRoute>> {
  const record:IRoute = {
    ...routeToUpdate,
    route_status: 0,
  }
  const reponseUpdateRoute:IResponse<IRoute> = await repository.updateRoute(record);
  return reponseUpdateRoute;
};

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

export async function updateRouteDayStores(routeDay:IRouteDay, routeDayStores:IRouteDayStores[]) {


};


