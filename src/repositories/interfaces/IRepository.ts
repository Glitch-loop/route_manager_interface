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
  // Related to general information
  getAllDays(): Promise<IResponse<IDay[]>>;

  // Related to products
  getAllProducts(): Promise<IResponse<IProduct[]>>;
  insertProduct(product:IProduct): Promise<IResponse<IProduct>>;
  updateProduct(product:IProduct): Promise<IResponse<IProduct>>;
  // deleteProduct(product:IProduct): Promise<IResponse<IProduct>>; // Hard delete doesn't exists

  // Related stores
  getAllStoresInARouteDay(id_route_day:string): Promise<IResponse<IRouteDayStores[]>>;
  getStoresByArrID(arr_id_stores: string[]): Promise<IResponse<IStore[]>>;
  getAllStores(): Promise<IResponse<IStore[]>>;

  // Related to the work day information
  insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>>;
  updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>>;
  getWorkDayByDateRange(initialDate:string, finalDate:string):Promise<IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>>;
  getOpenWorkDays():Promise<IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>>;

  // Related to routes
  getAllRoutes():Promise<IResponse<IRoute[]>>;
  insertRouteDays(routeDay:IRouteDay, routeDayStores:IRouteDayStores[]):Promise<IResponse<IRouteDayStores[]>>;
  deleteRouteDays(routeDay:IRouteDay):Promise<IResponse<null>>;
  getAllDaysByRoute(id_route:string): Promise<IResponse<IRouteDay[]>>;
  getAllRouteDays(): Promise<IResponse<IRouteDay[]>>;
  getAllRoutesByVendor(id_vendor:string): Promise<IResponse<IRoute[]>>;
  insertRoute(route:IRoute): Promise<IResponse<IRoute>>;
  updateRoute(route:IRoute): Promise<IResponse<IRoute>>;
  insertDaysOfRoute(routeDays:IRouteDay[]): Promise<IResponse<IRouteDay[]>>;
  deleteRoute(route:IRoute): Promise<IResponse<null>>;

  // Related to users
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
