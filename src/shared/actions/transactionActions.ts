'use server'

// Raw api response
import { RawTransactionApiResponse } from '@/shared/raw-api-responses/rawTransactionApiResponse';

// Dtos
import { RouteTransactionDTO } from '@/shared/dtos/RouteTransactionDTO';
import { RouteTransactionDescriptionDTO } from '@/shared/dtos/RouteTransactionDescriptionDTO';

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

// Mapper
import { rawApiResponseToDTOMapper } from '@/shared/mappers/rawApiResponseToDTOMapper';

interface RetrieveTransactionsRequest {
	id_transactions: string[]
}

export async function insertRouteTransaction(route_transaction: RouteTransactionDTO, is_synced: boolean): Promise<void> { 
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return; 
};

export async function updateRouteTransaction(route_transaction: RouteTransactionDTO): Promise<void> {
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return; 
};

export async function deleteRouteTransactions(route_transactions: RouteTransactionDTO[]): Promise<void> {
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return; 
};

export async function listRouteTransactionByStore(id_store: string): Promise<RouteTransactionDTO[]> { 
  /*
    Note (06-25-26)

    The intention of this implementation is to retrieve historical data to avoid 
    heavy requests, this call is limited to the 'last' 4 active transactions.
  */
  try {
    const response = await apiClient.get<RawTransactionApiResponse[]>(
      `/sellings/transactions?limit=4&transaction_status=1&id_location=${id_store}`
    );

    const routeTransactionServerModel: RawTransactionApiResponse[] = response.data;

    return routeTransactionServerModel.map((transaction) => rawApiResponseToDTOMapper.toDTO(transaction));
  } catch(error) {
    console.error('Something went wrong during route transaction retrieving by store: ' + error)
    return [];
  }
};

export async function listRouteTransactions(): Promise<RouteTransactionDTO[]> { 
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return []; 
};

export async function retrieveRouteTransactionById(id_route_transactions: string[]): Promise<RouteTransactionDTO[]> { 
  try {
    const resultRouteTransaction: RawTransactionApiResponse[] = await apiClient.post<RawTransactionApiResponse[], RetrieveTransactionsRequest>(
      '/sellings/transactions/ids',
      { id_transactions: id_route_transactions }
    );

    return resultRouteTransaction.data.map((transaction) => rawApiResponseToDTOMapper.toDTO(transaction));
  } catch (error: any) {
    throw new Error(`Failed to upsert route transactions: ${error.message}`);
  }
};

export async function listRouteTransactionDescriptions(): Promise<RouteTransactionDescriptionDTO[]> { 
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return []; 
};
