
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
} from '@/interfaces/interfaces';

// Utils
//import { determineRouteDayState } from '@/utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '@/interfaces/enumStoreStates';
import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '@/utils/apiResponse';
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import TABLES from "@/utils/tables";
import { generateUUIDv4 } from "@/utils/generalUtils";

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function getStoresByDate(initialDate:string, finalDate:string):Promise<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> {
    const workDaysInDateRange:IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> = await repository.getWorkDayByDateRange(initialDate, finalDate);

    return workDaysInDateRange.data;
}

export async function getOpenWorkDays():Promise<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> {
  const openWorkDaysResult:IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]> = await repository.getOpenWorkDays();
  return openWorkDaysResult.data;
}

export async function  createSubscriptionToRouteTransactions(handler:(payload:RealtimePostgresChangesPayload<IRouteTransaction>) => void):Promise<IResponse<RealtimeChannel>> {
  const resultCreateChannel:IResponse<RealtimeChannel> =  repository.suscribeTable(generateUUIDv4(), 'INSERT', TABLES.ROUTE_TRANSACTIONS, handler);
  return resultCreateChannel;
}
