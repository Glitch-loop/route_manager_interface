
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
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription,
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

export async function getRouteTransactionsFromWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IRouteTransaction[]> {
    const responseRouteTransactions:IResponse<IRouteTransaction[]> = await repository.getAllRouteTransactionsOfWorkDay(workday);
    const routeTransactions:IRouteTransaction[] = getDataFromApiResponse(responseRouteTransactions);

    return routeTransactions;
}


export async function getRouteTransactionOperationsFromWorkDay(routeTransactions:IRouteTransaction[]):Promise<IRouteTransactionOperation[]> {
    const responseRouteTransactionOperations:IResponse<IRouteTransactionOperation[]> = await repository.getAllRouteTransactionOperationsOfWorkDay(routeTransactions);
    const routeTransactionOperations:IRouteTransactionOperation[] = getDataFromApiResponse(responseRouteTransactionOperations);

    return routeTransactionOperations;
}

export async function getRouteTransactionOperationDescriptionsFromWorkDay(routeTransactionOperations:IRouteTransactionOperation[]):Promise<IRouteTransactionOperationDescription[]> {
    const responseRouteTransactionOperationsDescriptions:IResponse<IRouteTransactionOperationDescription[]> = await repository.getAllRouteTransactionOperationsDescriptionsOfWorkDay(routeTransactionOperations);
    const routeTransactionOperationsDescriptions:IRouteTransactionOperationDescription[] = getDataFromApiResponse(responseRouteTransactionOperationsDescriptions);

    return routeTransactionOperationsDescriptions;
}

