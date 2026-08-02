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
import { BackendResponseInterface } from '@/infrastructure/interfaces/BackendResponseInterface';

interface RetrieveTransactionsRequest {
	id_transactions: string[]
}

export async function insertRouteTransaction(route_transaction: RouteTransactionDTO, is_synced: boolean): Promise<void> { 
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  void route_transaction;
  void is_synced;
  return; 
};

export async function updateRouteTransaction(route_transaction: RouteTransactionDTO): Promise<void> {
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  void route_transaction;
  return; 
};

export async function deleteRouteTransactions(route_transactions: RouteTransactionDTO[]): Promise<void> {
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  void route_transactions;
  return; 
};

export async function listRouteTransactions(
  transaction_status?: number,
  storesId?: string[],
  fromDate?: Date, 
  toDate?: Date,
  limit?: number,
  nextItem?: string,
): Promise<BackendResponseInterface<RouteTransactionDTO[]>> { 
  try {
    const searchParams = new URLSearchParams();

    if (transaction_status !== undefined) {
      searchParams.set('transaction_status', String(transaction_status));
    }

    if (fromDate && toDate) {
      searchParams.set('fromDate', fromDate.toISOString());
      searchParams.set('toDate', toDate.toISOString());
    }

    if (storesId && storesId.length > 0) {
      searchParams.set('id_location', storesId.join(','));
    }

    searchParams.set('limit', String(limit ?? 100));

    if (nextItem) {
      searchParams.set('next_item', nextItem);
    }

    const url = `/sellings/transactions?${searchParams.toString()}`;

    const response: BackendResponseInterface<RawTransactionApiResponse[]> = await apiClient.get<RawTransactionApiResponse[]>(url);

    const routeTransactionServerModel: RawTransactionApiResponse[] = response.data;

    return {
      message: response.message,
      data: routeTransactionServerModel.map((transaction) => rawApiResponseToDTOMapper.toDTO(transaction)),
      meta: response.meta
    } as BackendResponseInterface<RouteTransactionDTO[]>;

  } catch(error: unknown) {
    console.error('Something went wrong during route transaction retrieving by store: ' + error)
    return {
      message: 'Error during retrieving transactions',
      data: [],
    };
  }
};

async function listAllRouteTransactionsByStore(
  storeId: string,
  startDate: Date,
  endDate: Date,
  transactionStatus = 1,
  limit = 100,
  nextItem?: string,
): Promise<RouteTransactionDTO[]> {
  const response = await listRouteTransactions(
    transactionStatus,
    [storeId],
    startDate,
    endDate,
    limit,
    nextItem,
  );

  const currentItems = response.data.filter(
    (transaction) => transaction.id_location === storeId,
  );

  if (!response.meta?.has_next_page || !response.meta.next_item) {
    return currentItems;
  }

  const nextItems = await listAllRouteTransactionsByStore(
    storeId,
    startDate,
    endDate,
    transactionStatus,
    limit,
    response.meta.next_item,
  );

  return [...currentItems, ...nextItems];
}

export async function listRouteTransactionsByStoreWithinDateRange(
  storesId: string[],
  startDate: Date,
  endDate: Date,
): Promise<Map<string, RouteTransactionDTO[]>> {
  const uniqueStoreIds = [...new Set(storesId)].filter(Boolean);

  const transactionsByStore = await Promise.all(
    uniqueStoreIds.map(async (storeId) => {
      const transactions = await listAllRouteTransactionsByStore(
        storeId,
        startDate,
        endDate,
      );

      return [storeId, transactions] as const;
    }),
  );

  return new Map<string, RouteTransactionDTO[]>(transactionsByStore);
}


export async function retrieveRouteTransactionById(id_route_transactions: string[]): Promise<RouteTransactionDTO[]> { 
  try {
    const resultRouteTransaction: RawTransactionApiResponse[] = await apiClient.post<RawTransactionApiResponse[], RetrieveTransactionsRequest>(
      '/sellings/transactions/ids',
      { id_transactions: id_route_transactions }
    );

    return resultRouteTransaction.map((transaction: RawTransactionApiResponse) => rawApiResponseToDTOMapper.toDTO(transaction));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upsert route transactions: ${message}`);
  }
};

export async function listRouteTransactionDescriptions(): Promise<RouteTransactionDescriptionDTO[]> { 
  /*
    Note (06-25-26)
    Vendor's app must not implement this method.
  */
  return []; 
};
