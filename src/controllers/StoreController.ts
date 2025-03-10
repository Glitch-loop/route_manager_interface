// Database
import { IMapMarker, IResponse, IRouteDay, IRouteDayStores, IRouteTransaction, IStore } from "@/interfaces/interfaces";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { getDataFromApiResponse } from "@/utils/responseUtils";

// Interfaces


//Initializing database repository
const repository = RepositoryFactory.createRepository('supabase');

export async function getAllStores():Promise<IStore[]> {
    const informationOfTheStoresResponse:IResponse<IStore[]> = await repository.getAllStores();

    return getDataFromApiResponse(informationOfTheStoresResponse);
}

export async function getInformationOfStores(arrIdStores:string[]):Promise<IStore[]> {
    const informationOfTheStoresResponse:IResponse<IStore[]> = await repository.getStoresByArrID(arrIdStores);

    return getDataFromApiResponse(informationOfTheStoresResponse);
}

export async function getStoresOfRouteDay(routeDay:IRouteDay):Promise<IRouteDayStores[]> {
    /*
      Getting the particular stores that belongs to the route day.
      In addition, this query provides the position of each store in the day.
    */
    let resultAllStoresInRoute:IResponse<IRouteDayStores[]> = {
      responseCode: 500,
      data: [],
    };
    const storesInTheRoute:IRouteDayStores[] = [];
    console.log("Route day to consult: ", routeDay.id_route_day)
    resultAllStoresInRoute = await repository.getAllStoresInARouteDay(routeDay.id_route_day);
    
    console.log("resultAllStoresInRoute: ", resultAllStoresInRoute)
    const allStoreInRoute:IRouteDayStores[] = getDataFromApiResponse(resultAllStoresInRoute);
  
    allStoreInRoute.forEach((storeInRouteDay) => { storesInTheRoute.push(storeInRouteDay); });
  
    resultAllStoresInRoute.data = storesInTheRoute;
  
  
    return resultAllStoresInRoute.data;
}

export async function getStoresFromRouteTransactions(routeTransactions:IRouteTransaction[]):Promise<IStore[]> {
    // Getting infotmation related to stores
    const storesOfTheDay:Set<string> = new Set<string>();
    
    // Getting all the stores of the day
    routeTransactions.forEach((routeTransaction:IRouteTransaction) => {
        const { id_store } = routeTransaction;

        if (storesOfTheDay.has(id_store) === false) {
            storesOfTheDay.add(id_store);
        }
    });
    

    const informationOfStores:IStore[] = await getInformationOfStores(
        [...storesOfTheDay.entries()].map((item) => {return item[0]}));

    return informationOfStores;
}