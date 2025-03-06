import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
    IProduct,
    IProductInventory,
    IResponse,
    IRoute,
    IRouteTransaction,
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription,
    IStore,
} from '@/interfaces/interfaces';

// Utils
import {
  getDataFromApiResponse,
} from '@/utils/responseUtils';
import { addingInformationParticularFieldOfObject } from "@/utils/generalUtils";

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

// Definition
const initialProduct:IProductInventory = {
    id_product: '',
    product_name: '',
    barcode: '',
    weight: '',
    unit: '',
    comission: 0,
    price: 0,
    product_status: 0,
    order_to_show: 0,
    amount: 0,
  };

export async function getInventoryOperationsOfWorkDay(workday:IRoute&IDayGeneralInformation&IDay):Promise<IInventoryOperation[]> {
    const allInventoryOperationResponse:IResponse<IInventoryOperation[]> = await repository.getAllInventoryOperationsOfWorkDay(workday);

    const allInventoryOperation = getDataFromApiResponse(allInventoryOperationResponse);

    return allInventoryOperation;
}

export async function getInventoryOperationDescriptionsOfWorkDay(inventoryOperations:IInventoryOperation[]):Promise<IInventoryOperationDescription[]> {
    const allInventoryOperationDescriptionsResponse:IResponse<IInventoryOperationDescription[]> = await repository.getAllInventoryOperationDescriptionsOfWorkDay(inventoryOperations);

    const allInventoryOperationDescriptions = getDataFromApiResponse(allInventoryOperationDescriptionsResponse);

    return allInventoryOperationDescriptions;
}

export function getTotalInventoriesOfAllStoresByIdOperationType(
    id_day_operation:string,
    stores:IStore[],
    arrRouteTransactions:IRouteTransaction[],
    arrRouteTransactionOperations:IRouteTransactionOperation[],
    arrRouteTransactionOperationDescriptions:IRouteTransactionOperationDescription[]
  ):(IStore & { productInventory: IProductInventory[] })[] {
    //Declare variables of function
    const totalOfProductRelatedToOperationTypeByStore:(IStore & { productInventory: IProductInventory[] })[] = [];
  
    // Get infomration from database.
    // const arrRouteTransactions:IRouteTransaction[] = getDataFromApiResponse(
    //   await getAllRouteTransactions());
  
    // const arrRouteTransactionOperations:IRouteTransactionOperation[] = getDataFromApiResponse(
    //   await getAllRouteTransactionsOperations());
  
    // const arrRouteTransactionOperationDescriptions:IRouteTransactionOperationDescription[]
    // = getDataFromApiResponse(await getAllRouteTransactionsOperationDescriptions());
  
    // Convert information into json.
    const dictRouteTransactions = arrRouteTransactions
    .reduce<Record<string,IRouteTransaction>>((dict,routeTransaction) => {
      const {id_route_transaction} = routeTransaction;
      dict[id_route_transaction] = routeTransaction;
      return dict;
    },{});
  
    const dictRouteTransactionOperations = arrRouteTransactionOperations
    .reduce<Record<string, IRouteTransactionOperation>>((dict, routeTransactionOperation) => {
      const { id_route_transaction_operation } = routeTransactionOperation;
      dict[id_route_transaction_operation] = routeTransactionOperation;
      return dict;
    }, {});
  
  
  
    const dictStores = stores.reduce<Record<string, IStore & { dictProductInventory: Record<string, IProductInventory> }>>(
      (dict, store) => {
      const { id_store }  = store;
      dict[id_store] = {
        ...store,
        dictProductInventory: {},
      };
      return dict;
    }, {});
  
    // Find to which store belongs a 'route transaction operation description'.
      // Taking account the type of operation.
    for(const transactionDescription of arrRouteTransactionOperationDescriptions) {
      const {
        id_route_transaction_operation,
        amount,
        price_at_moment,
        id_product,
      } = transactionDescription;
  
      if(id_route_transaction_operation !== undefined) {
        if(dictRouteTransactionOperations[id_route_transaction_operation] !== undefined) {
          const {
            id_route_transaction_operation_type,
            id_route_transaction,
          } = dictRouteTransactionOperations[id_route_transaction_operation];
          if (id_route_transaction_operation_type !== undefined) {
            if (id_route_transaction_operation_type === id_day_operation) {
              if (dictRouteTransactions[id_route_transaction] !== undefined) {
                const { id_store, state } = dictRouteTransactions[id_route_transaction];
                // Verifyng the store exists and the transaction is acive
                if (dictStores[id_store] !== undefined && state === 1) {
                  const { dictProductInventory } = dictStores[id_store];
                  dictStores[id_store].dictProductInventory = addingInformationParticularFieldOfObject(
                    dictProductInventory,
                    id_product,
                    'amount',
                    amount,
                    {
                      ...initialProduct,
                      amount: amount,
                      id_product: id_product,
                      price: price_at_moment,
                    }
                  );
                }
              }
            } else {
              /* Other type of operations don't matter. */
            }
          }
        }
      }
    }
  
    // Convert the json into the interface to retrieve.
    for (const storeKey in dictStores) {
      const {dictProductInventory}  = dictStores[storeKey];
      const arrProducts:IProductInventory[] = [];
  
      for (const productKey in dictProductInventory) {
        arrProducts.push(dictProductInventory[productKey]);
      }
  
      totalOfProductRelatedToOperationTypeByStore.push({
        ...dictStores[storeKey],
        productInventory: arrProducts,
      });
    }
  
    return totalOfProductRelatedToOperationTypeByStore;
  }
  