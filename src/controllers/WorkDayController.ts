
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
    IRouteTransaction,
    IInventoryOperation,
} from '@/interfaces/interfaces';
import { 
  RealtimeChannel, 
  RealtimePostgresChangesPayload 
} from "@supabase/supabase-js";

// Utils
//import { determineRouteDayState } from '@/utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '@/interfaces/enumStoreStates';
import TABLES from "@/utils/tables";
import { generateUUIDv4 } from "@/utils/generalUtils";
import DAYS from "@/utils/days";
import { getDataFromApiResponse } from "@/utils/responseUtils";


// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function getStoresByDate(initialDate:string, finalDate:string):Promise<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> {
    const workDaysInDateRange:IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> = await repository.getWorkDayByDateRange(initialDate, finalDate);

    return workDaysInDateRange.data;
}

export async function getOpenWorkDays():Promise<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> {
  const openWorkDaysResult:IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> = await repository.getOpenWorkDays();
  const resultGetAllRoutes:IResponse<IRoute[]> = await repository.getAllRoutes();
  const resultRouteDays:IResponse<IRouteDay[]> = await repository.getAllRouteDays();
  
  const routes:IRoute[] = getDataFromApiResponse(resultGetAllRoutes);
  const openWorkDays:(IRoute&IDayGeneralInformation&IDay&IRouteDay)[] = getDataFromApiResponse(openWorkDaysResult);
  const routeDays:IRouteDay[] = getDataFromApiResponse(resultRouteDays);

  openWorkDaysResult.data = openWorkDays.map((workday) => {
    let day_name:string = '';
    console.log(workday)
    const routeDay:IRouteDay|undefined = routeDays.find((routeDay) => routeDay.id_route_day === workday.id_route_day);

    if (routeDay) day_name = DAYS[routeDay.id_day]?.day_name || 'Nombre de dia no encontrado';
    else day_name = 'Nombre de dia no encontrado'

    return {
      ...workday,
      route_name: routes.find((route) => route.id_route === workday.id_route)?.route_name || 'Ruta no encontrada',
      day_name: day_name,
    }
  })

  return openWorkDaysResult.data;
}

export async function  createSubscriptionToRouteTransactions(handler:(payload:RealtimePostgresChangesPayload<IRouteTransaction>) => void):Promise<IResponse<RealtimeChannel>> {
  const resultCreateChannel:IResponse<RealtimeChannel> =  repository.suscribeTable('route_transactions', 'INSERT', TABLES.ROUTE_TRANSACTIONS, handler);
  return resultCreateChannel;
}
export async function  createSubscriptionToInventoryOperations(handler:(payload:RealtimePostgresChangesPayload<IInventoryOperation>) => void):Promise<IResponse<RealtimeChannel>> {
  const resultCreateChannel:IResponse<RealtimeChannel> = repository.suscribeTable('inventory_operations', 'INSERT', TABLES.INVENTORY_OPERATIONS, handler);
  return resultCreateChannel;

}