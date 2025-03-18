
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

/*
    Functions that calculates the amount of a type of operation of a route transaction.
*/
export function getTotalOfTypeOperationOfRouteTransaction(
    id_operation_type:string,
    routeTransaction:IRouteTransaction,
    routeTransactionOperations:IRouteTransactionOperation[],
    routeTransactionOperationsDescriptions:IRouteTransactionOperationDescription[],
):number {
    let totalAmount:number = 0;
    const { id_route_transaction } = routeTransaction;
    
    const routeTransactionOperation:IRouteTransactionOperation|undefined = routeTransactionOperations
        .find((transactionOperation:IRouteTransactionOperation) => {
            return (transactionOperation.id_route_transaction === id_route_transaction 
                    && transactionOperation.id_route_transaction_operation_type === id_operation_type)
        });

    if (routeTransactionOperation === undefined) {
        totalAmount = 0;
    } else {
        const { id_route_transaction_operation } = routeTransactionOperation;
        totalAmount = routeTransactionOperationsDescriptions
            .reduce((acc:number, operationDescrption:IRouteTransactionOperationDescription) => {
                let currentValue = 0;
                if (operationDescrption.id_route_transaction_operation === id_route_transaction_operation) {
                    const { amount, price_at_moment } = operationDescrption;
                    currentValue = amount * price_at_moment;
                } else {
                    currentValue = 0;
                }
                return acc + currentValue;
            }, 0)   
    }

    return totalAmount;
}
