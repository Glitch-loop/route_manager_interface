// Enums
import DAY_OPERATIONS from "@/core/enums/DayOperations";

// Dtos
import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";


/**
 * Calculates the total sales of a store based on its transactions.
 * 
 * Note: 
 * 
 * From the transactions only those descriptions with type `sales` will be
 * taking account for the operation.
 * 
 * @param storeId - ID of the store to calculate the total sale.
 * @param routeTransactionsMap - Map with the transaction by store: Map<id_store, transactions of stores>
 * @returns Total sales amount or 0 if no transactions
 */
export function calculateStoreTotalSales(
  storeId: string,
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>
): number {
  const transactions = routeTransactionsMap.get(storeId);
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  let total = 0;
  for (const transaction of transactions) {
    if (transaction.state === 1) {
      for (const description of transaction.transaction_description) {
        // Only count sales operations
        if (
          description.id_transaction_operation_type === DAY_OPERATIONS.sales
        ) {
          total += description.price_at_moment * description.quantity;
        }
      }
    }
  }
  return total;
};

/**
 * Calculates the grat total sales of a store based on its transactions.
 * `Great total` means the addition of the sum of the sales for each store.
 * 
 * 
 * Note: 
 * 
 * From the transactions only those descriptions with type `sales` will be
 * taking account for the operation.
 * 
 * @param storeId - ID of the store to calculate the total sale.
 * @param routeTransactionsMap - Map with the transaction by store: Map<id_store, transactions of stores>
 * @returns Total sales amount or 0 if no transactions
 */
export function calculateStoresGreatTotalSales(
  // deleteModeActive: boolean,
  // selectedStores: Set<string>,
  storesToAttend: RouteDayLocationDTO[],
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>
): number {
  return storesToAttend.reduce((total, store) => {
    return total + calculateStoreTotalSales(store.id_location, routeTransactionsMap);
  }, 0);

};
