import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
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
import { addingInformationParticularFieldOfObject, convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";
import { convertInventoryOperationDescriptionToProductInventoryInterface } from "@/utils/inventoryUtils";
import { isTypeIInventoryOperationDescription, isTypeIRouteTransactionOperation, isTypeIRouteTransactionOperationDescription } from "@/utils/guards";
import DAYS_OPERATIONS from "@/utils/dayOperations";

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

// Definition
const initialProduct:IProductInventory = {
    id_product: '',
    product_name: '',
    barcode: '',
    weight: 0,
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
                // Verifying the store exists and the transaction is acive
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

export function getProductInventoryOfInventoryOperationType(
  inventoryOperationType:string, 
  inventoryOperations:IInventoryOperation[],
  inventoryDescriptions:Map<string, IInventoryOperationDescription[]>,
  inventory:IProductInventory[],
  idInventoryOperation:string|undefined
):IProductInventory[] {
  let productInventory:IProductInventory[];
  const inventoryOftheOperation:IInventoryOperation|undefined = inventoryOperations.find((inventoryOperation) => { 
    let isOperation:boolean = false;
    const {state, id_inventory_operation, id_inventory_operation_type} = inventoryOperation;

    if (idInventoryOperation === undefined) {
      isOperation = (state === 1 && id_inventory_operation_type === inventoryOperationType); 
    } else {
      isOperation = (idInventoryOperation === id_inventory_operation && state === 1 && id_inventory_operation_type === inventoryOperationType); 
    }

    return isOperation;
   })



  if (inventoryOftheOperation === undefined) {
    console.log("inventory operation wasn't found")
    productInventory = [];
  } else {
    console.log("+++++++++++++++++inventory operation found")
    const { id_inventory_operation } = inventoryOftheOperation;
    const inventoyDescriptions:IInventoryOperationDescription[]|undefined = inventoryDescriptions.get(id_inventory_operation);
    console.log("inventoyDescriptions: ", inventoyDescriptions?.length)
    productInventory = convertInventoryOperationDescriptionToProductInventoryInterface(
      inventoyDescriptions,
      inventory
    )
  }

  return productInventory;
}

export function getProductInventoryByInventoryOperationType(
  targetTypeOperation:string, 
  routeTransactions:IRouteTransaction[],
  routeTransactionOperations:Map<string, IRouteTransactionOperation[]>,
  routeTransactionOperationDescriptions:Map<string, IRouteTransactionOperationDescription[]>,
  inventory:IProductInventory[]):IProductInventory[] {
  const resultInventory:IProductInventory[] = []
  
  const newInventory = inventory.map((productInventory:IProductInventory) => {
    return {...productInventory, amount: 0}
  })

  const productInventoryMap:Record<string, IProductInventory> = convertArrayInJsonUsingInterfaces(newInventory);  
  

  for (const transaction of routeTransactions) {
    const {id_route_transaction, state} = transaction;
    if (state === 1) { // Verifying it is active
      const arrTransactionOperations:IRouteTransactionOperation[]|undefined = routeTransactionOperations.get(id_route_transaction);

      if (arrTransactionOperations) {
        for (const transactionOperation of arrTransactionOperations) {
          const { id_route_transaction_operation_type, id_route_transaction_operation } = transactionOperation;
          if (id_route_transaction_operation_type === targetTypeOperation) {
            const arrOperationDescriptions:IRouteTransactionOperationDescription[] |undefined = routeTransactionOperationDescriptions.get(id_route_transaction_operation);

            if (arrOperationDescriptions) {
              for (const transactionOperationDescription of arrOperationDescriptions) {
                const {id_product, amount} = transactionOperationDescription
                if (productInventoryMap[id_product] !== undefined) {
                  productInventoryMap[id_product].amount += amount
                }
              }
            }
          }
        }
      }
    }
  }
  


  for (const key in productInventoryMap) {
    resultInventory.push(productInventoryMap[key]);
  }

  return resultInventory;
}

export function groupConceptsInTheirParentConcept<T>(arrConceptToGroup:T[]):Map<string, T[]> {
  const groupedConcepts:Map<string, T[]> = new Map<string, T[]>()

  arrConceptToGroup.forEach((conceptToGroup:T) => {
    let key:string = "";

    if (isTypeIInventoryOperationDescription(conceptToGroup) === true) {
      key = conceptToGroup.id_inventory_operation;
    } else if(isTypeIRouteTransactionOperation(conceptToGroup)) {
      key = conceptToGroup.id_route_transaction;
    } else if(isTypeIRouteTransactionOperationDescription(conceptToGroup)) {
      key = conceptToGroup.id_route_transaction_operation
    }

    if (groupedConcepts.has(key) === false) {
      groupedConcepts.set(key, []);
    }

    if (groupedConcepts.get(key) !== undefined) {
      groupedConcepts.get(key)?.push(conceptToGroup);
    }
  })

  return groupedConcepts;
}

export function determineProblemWithInventory(
    inventory:IProductInventory[],
    inventoryOperations:IInventoryOperation[],
    inventoryOperationDescriptions:IInventoryOperationDescription[],
    routeTransactions:IRouteTransaction[],
    routeTransactionOperations:IRouteTransactionOperation[],
    routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[]) {
      // Related to inventory
      const inventoryOperationDescriptionByInventoryOperation:Map<string, IInventoryOperationDescription[]> = groupConceptsInTheirParentConcept<IInventoryOperationDescription>(inventoryOperationDescriptions);
    
      // Related to transactions
      const transactionOperationsByRouteTransactions:Map<string, IRouteTransactionOperation[]> = groupConceptsInTheirParentConcept<IRouteTransactionOperation>(routeTransactionOperations);
      const transactionDescriptionByTransactionOperation:Map<string, IRouteTransactionOperationDescription[]> = groupConceptsInTheirParentConcept<IRouteTransactionOperationDescription>(routeTransactionOperationDescriptions);
    
      // Determining inventory operations 
      const initialInventory:IProductInventory[] = getProductInventoryOfInventoryOperationType(
        DAYS_OPERATIONS.start_shift_inventory, 
        inventoryOperations, 
        inventoryOperationDescriptionByInventoryOperation, 
        inventory.map((product) => { return {...product, amount: 0}}), 
        undefined);
  
      const returnedInventory:IProductInventory[] = getProductInventoryOfInventoryOperationType(
        DAYS_OPERATIONS.end_shift_inventory, 
        inventoryOperations, 
        inventoryOperationDescriptionByInventoryOperation, 
        inventory.map((product) => { return {...product, amount: 0}}), 
        undefined);
    
      // Determining valid restock inventories (only actives)
      const validRestockInventoryOperations:IInventoryOperation[] = inventoryOperations.filter((inventoryOperation:IInventoryOperation) => {
        const { state, id_inventory_operation_type } = inventoryOperation;
        return state === 1 && id_inventory_operation_type === DAYS_OPERATIONS.restock_inventory;
      })
  
      const restockInventories:IProductInventory[][] = validRestockInventoryOperations.reduce((matrixProductInventory:IProductInventory[][], inventoryOperation:IInventoryOperation) => {
        const { id_inventory_operation } = inventoryOperation;
        matrixProductInventory.push(
          getProductInventoryOfInventoryOperationType(
            DAYS_OPERATIONS.restock_inventory, 
            validRestockInventoryOperations, 
            inventoryOperationDescriptionByInventoryOperation, 
            inventory.map((product) => { return {...product, amount: 0}}), 
            id_inventory_operation)
        )
        return matrixProductInventory;
      }, []);

      // Determining route trasnactions
      const soldOperations:IProductInventory[] = getProductInventoryByInventoryOperationType(DAYS_OPERATIONS.sales, routeTransactions, transactionOperationsByRouteTransactions, transactionDescriptionByTransactionOperation, inventory.map((product) => { return {...product, amount: 0}}));
      const repositionsOperations:IProductInventory[] = getProductInventoryByInventoryOperationType(DAYS_OPERATIONS.product_reposition, routeTransactions, transactionOperationsByRouteTransactions, transactionDescriptionByTransactionOperation, inventory.map((product) => { return {...product, amount: 0}}));

      // Determining value of product inflow
      const valueOfInitialInventory:number = initialInventory.reduce((acc, product) => {
        return acc + product.amount * product.price;
      }, 0);

      const valueOfRestocksInventory:number = restockInventories.reduce((acc, inventory) => {
        return acc + inventory.reduce((accInventory, product) => { return accInventory + product.amount * product.price; }, 0);
      }, 0);

      // Determining outflow of product
      const valueOfSoldsProduct:number = soldOperations.reduce((acc, product) => {
        return acc + product.amount * product.price;
      }, 0);
      
      const valueOfRepositionProduct:number = repositionsOperations.reduce((acc, product) => {
        return acc + product.amount * product.price;
      }, 0);
      
      // Determining returned product (remainined product)
      const valueReturnedInventory:number = returnedInventory.reduce((acc, product) => {
        return acc + product.amount * product.price;
      }, 0);

      console.log("valueOfInitialInventory: ", valueOfInitialInventory)
      console.log("valueOfRestocksInventory: ", valueOfRestocksInventory)
      console.log("valueOfSoldsProduct: ", valueOfSoldsProduct)
      console.log("valueOfRepositionProduct: ", valueOfRepositionProduct)
      console.log("valueReturnedInventory: ", valueReturnedInventory)

      const problemWithInventory:number = valueReturnedInventory - ((valueOfInitialInventory  + valueOfRestocksInventory) - (valueOfSoldsProduct + valueOfRepositionProduct));

      return problemWithInventory;
} 