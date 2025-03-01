import { RealtimeChannel } from '@supabase/supabase-js';
import {
  IUser,
  IRoute,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
  IStore,
  IInventoryOperation,
  IInventoryOperationDescription,
  IProduct,
  IRouteDayStores,
  IResponse,
} from '../../interfaces/interfaces';

export interface IRepository {
  // Related to route
  getAllDays(): Promise<IResponse<IDay[]>>;
  getAllDaysByRoute(id_route:string): Promise<IResponse<IRouteDay[]>>;
  getAllRoutesByVendor(id_vendor:string): Promise<IResponse<IRoute[]>>;
  
  // Related to products
  getAllProducts(): Promise<IResponse<IProduct[]>>;

  // Related stores
  getAllStoresInARouteDay(id_route_day:string): Promise<IResponse<IRouteDayStores[]>>;
  getStoresByArrID(arr_id_stores: string[]): Promise<IResponse<IStore[]>>;

  // Related to the work day information
  insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>>;
  updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>>;
  getWorkDayByDateRange(initialDate:string, finalDate:string):Promise<IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>>;
  getOpenWorkDays():Promise<IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>>;

  // Related to routes
  getAllRoutes():Promise<IResponse<IRoute[]>>;

  // related to users
  getUserDataByCellphone(user:IUser):Promise<IResponse<IUser>>;
  getUserDataById(id_vendor:string):Promise<IResponse<IUser>>;
  getAllUsers():Promise<IResponse<IUser[]>>;

  // Related to products (inventory operations)
  insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<null>>;
  updateInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<null>>;
  insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<IResponse<null>>;
  getAllInventoryOperationDescriptionsOfInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<IInventoryOperationDescription[]>>;
  getAllInventoryOperationsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IInventoryOperation[]>>;
  getAllInventoryOperationDescriptionsOfWorkDay(inventoryOperations: IInventoryOperation[]):Promise<IResponse<IInventoryOperationDescription[]>>;

  // Related to route transactions
  insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<null>>;
  updateRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<null>>;
  getAllRouteTransactionsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IRouteTransaction[]>>;
  insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<IResponse<null>>;
  getAllRouteTransactionOperationsOfRouteTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<IRouteTransactionOperation[]>>;
  insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<IResponse<null>>;
  getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(routeTransactionOperation:IRouteTransactionOperation):Promise<IResponse<IRouteTransactionOperationDescription[]>>;

  getAllRouteTransactionOperationsOfWorkDay(routeTransaction:IRouteTransaction[]):Promise<IResponse<IRouteTransactionOperation[]>>;
  getAllRouteTransactionOperationsDescriptionsOfWorkDay(routeTransactionOperation:IRouteTransactionOperation[]):Promise<IResponse<IRouteTransactionOperationDescription[]>>;

  // Subscriptions
  suscribeTable(typeOfEvent: 'INSERT'|'UPDATE'|'DELETE', tableName:string, action:(payload) => void):IResponse<RealtimeChannel>;
}
