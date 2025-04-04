// Repository
import { IRepository } from '../interfaces/IRepository';

// Database
import { supabase } from '../../lib/supabase';
import TABLES from '../../utils/tables';
import {
  IUser,
  IRoute,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IDayOperation,
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

// Utils
import { createApiResponse } from '../../utils/responseUtils';
import { PostgrestError, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { stringify } from 'querystring';

/*
  Converts the SQL code error to the most appropiate
  HTTP status code.
*/
function determinigSQLSupabaseError(error:any):number {
  let httpStatusCode:number = 500;
  if('code' in error) {
    if(error.code === '23505') { // Duplicate keys
      httpStatusCode = 409; // Conflict
    } else {
      httpStatusCode = 500;
    }
  }
  console.log("error: ", httpStatusCode);
  return httpStatusCode;
}

export class SupabaseRepository implements IRepository {
  client:any;

  constructor() {
    this.client = supabase;
  }

  // Related to route
  async getAllDays(): Promise<IResponse<IDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.DAYS).select();

      if (error) {
        return createApiResponse<IDay[]>(500, [], null, 'Failed getting all the days.');
      } else {
        return createApiResponse<IDay[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IDay[]>(500, [], null, 'Failed getting all the days.');
    }
  }

  // Related to products
  async getAllProducts():Promise<IResponse<IProduct[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.PRODUCTS)
                                            .select()
                                            .order('order_to_show');

      if (error) {
        return createApiResponse<IProduct[]>(500, [], null,
          'Failed getting all products.');
      } else {
        return createApiResponse<IProduct[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IProduct[]>(500, [], null, 'Failed getting all products.');
    }
  }

  async insertProduct(product:IProduct):Promise<IResponse<IProduct>> {
    try {
      const {
        product_name,
        barcode,
        weight,
        unit,
        comission,
        price,
        product_status,
        order_to_show,
      } = product;

      const { data, error } = await supabase.from(TABLES.PRODUCTS)
      .insert({
        product_name: product_name,
        barcode: barcode,
        weight: weight,
        unit: unit,
        comission: comission,
        price: price,
        product_status: product_status,
        order_to_show: order_to_show,
      });

      if (error) {
        return createApiResponse<IProduct>(
          determinigSQLSupabaseError(error),
          product,
          error.details,
          'Failed inserting the product' 
        );
      } else {
        return createApiResponse<IProduct>(
          201,
          product,
          null,
          'Product inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<IProduct>(
        500,
        product,
        null,
        'Failed inserting the product: ' + error
      );
    }
  }
  
  async updateProduct(product:IProduct):Promise<IResponse<IProduct>> {
    try {
      const {
        id_product,
        product_name,
        barcode,
        weight,
        unit,
        comission,
        price,
        product_status,
        order_to_show,
      } = product;

      const { data, error } = await supabase.from(TABLES.PRODUCTS)
      .update({
        product_name: product_name,
        barcode: barcode,
        weight: weight,
        unit: unit,
        comission: comission,
        price: price,
        product_status: product_status,
        order_to_show: order_to_show,
      })
      .eq('id_product', id_product);

      if (error) {
        return createApiResponse<IProduct>(
          determinigSQLSupabaseError(error),
          product,
          error.hint,
          'Failed updating the product.'
        );
      } else {
        return createApiResponse<IProduct>(
          200,
          product,
          null,
          'Product updated successfully.'
        );
      }
    } catch(error) {
      console.log("error: ", error)
      return createApiResponse<IProduct>(
        500,
        product,
        null,
        'Failed updating the product.'
      );
    }
  }

  // Related to stores
  async getAllStoresInARouteDay(id_route_day:string):Promise<IResponse<IRouteDayStores[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAY_STORES)
                                            .select()
                                            .eq('id_route_day', id_route_day)
                                            .order('position_in_route');
      if (error) {
        console.log(error)
        return createApiResponse<IRouteDayStores[]>(500, [], null,
          'Failed getting all stores in a route day.');
      } else {
        return createApiResponse<IRouteDayStores[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteDayStores[]>(500, [], null, 'Failed getting all stores in a route day');
    }
  }

  async getStoresByArrID(arr_id_stores: string[]):Promise<IResponse<IStore[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.STORES)
                                    .select().in('id_store', arr_id_stores);

      if (error) {
        return createApiResponse<IStore[]>(500, [], null,'Failed getting stores information.');
      } else {
        return createApiResponse<IStore[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IStore[]>(500, [], null, 'Failed getting stores information.');
    }
  }

  async getAllStores():Promise<IResponse<IStore[]>>{
    try {
      const { data, error } = await supabase.from(TABLES.STORES).select();

      if (error) {
        return createApiResponse<IStore[]>(500, [], null,'Failed getting stores information.');
      } else {
        return createApiResponse<IStore[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IStore[]>(500, [], null, 'Failed getting stores information.');
    }
  }

  // Related to the work day information
  async insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>> {
    try {
      const {
        id_work_day,
        start_date,
        finish_date,
        start_petty_cash,
        final_petty_cash,
        /*Fields related to IRoute interface*/
        id_route,
        // route_name,
        // description,
        // route_status,
        id_vendor,
        /*Fields related to IDay interface*/
        // id_day,
        // day_name,
        // order_to_show,
        /*Fields relate to IRouteDay*/
        // id_route_day,
      } = workday;
      
      const { data, error } = await supabase.from(TABLES.WORK_DAYS).insert({
        id_work_day: id_work_day,
        start_date: start_date,
        id_route: id_route,
        id_vendor: id_vendor,
        finish_date: finish_date,
        start_petty_cash: start_petty_cash,
        final_petty_cash: final_petty_cash,
      });

      console.log("ID of work day: ", id_work_day)

      console.log("Insert work day: ", data)
      if (error) {
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed inserting the work day.'
        );
      } else {
        return createApiResponse<null>(201, null, null, 'Work day created successfully.');
      }
    } catch(error) {
      console.log("Insert work day: ", error)
      return createApiResponse<null>(500, null, null, 'Failed inserting the work day.');
    }
  }

  async updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<null>>{
    try {
      const {
        id_work_day,
        start_date,
        finish_date,
        start_petty_cash,
        final_petty_cash,
        /*Fields related to IRoute interface*/
        id_route,
        // route_name,
        // description,
        // route_status,
        id_vendor,
        /*Fields related to IDay interface*/
        // id_day,
        // day_name,
        // order_to_show,
        /*Fields relate to IRouteDay*/
        // id_route_day,
      } = workday;

      const { data, error } = await supabase.from(TABLES.WORK_DAYS)
      .update({
        start_date: start_date,
        id_route: id_route,
        finish_date: finish_date,
        id_vendor: id_vendor,
        start_petty_cash: start_petty_cash,
        final_petty_cash: final_petty_cash,
      })
      .eq('id_work_day', id_work_day);

      console.log("Update work day: ", data)
      if (error) {
        console.log("Update work day: ", error)
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed updating the work day.'
        );
      } else {
        return createApiResponse<null>(200, null, null, 'Work day updated successfully.');
      }
    } catch(error) {
      console.log("Update work day: ", error)
      return createApiResponse<null>(500, null, null, 'Failed updating the work day.');
    }
  }

  async getWorkDayByDateRange(initialDate:string, finalDate:string):Promise<IResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.WORK_DAYS)
                                    .select()
                                    .gte('start_date', initialDate)
                                    .lte('start_date', finalDate)
                                    .order('start_date', {ascending: true})

      if (error) {
        return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(500, [], null,'Failed getting work days by date range.');
      } else {
        return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(500, [], null, 'Failed getting work days by date range.');
    }
  }

  async getOpenWorkDays(): Promise<IResponse<(IRoute & IDayGeneralInformation & IDay & IRouteDay)[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.WORK_DAYS)
                                    .select()
                                    .is('finish_date', null)
                                    .order('start_date', {ascending: true})

      if (error) {
        return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(500, [], null,'Failed getting work days by date range.');
      } else {
        return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>(500, [], null, 'Failed getting work days by date range.');
    } 
  }

  // Related to routes
  async getAllRoutes():Promise<IResponse<IRoute[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTES)
                                    .select()

      if (error) {
        return createApiResponse<IRoute[]>(500, [], null,'Failed getting work days by date range.');
      } else {
        return createApiResponse<IRoute[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRoute[]>(500, [], null, 'Failed getting work days by date range.');
    }
  }

  async insertStoresInRouteDay(routeDay:IRouteDay, routeDayStores:IRouteDayStores[]):Promise<IResponse<IRouteDayStores[]>> {
    try {
      let supabaseError:null|PostgrestError = null;
      const {
        id_route_day,
      } = routeDay;

      for (let i = 0; i < routeDayStores.length; i++) {
        const routeDayStore:IRouteDayStores = routeDayStores[i];

        const { id_store, position_in_route } = routeDayStore;
        const { data, error } = await supabase.from(TABLES.ROUTE_DAY_STORES)
        .insert({
          id_route_day: id_route_day,    
          position_in_route: position_in_route,
          id_store: id_store
        });
        
        if (error) {
          supabaseError = error
          break;
        }
      }


      if (supabaseError) {
        return createApiResponse<IRouteDayStores[]>(
          determinigSQLSupabaseError(supabaseError),
          routeDayStores,
          null,
          'Failed inserting route day stores operation.'
        );
      } else {
        return createApiResponse<IRouteDayStores[]>(
          201,
          routeDayStores,
          null,
          'Route days store inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<IRouteDayStores[]>(
        500,
        routeDayStores,
        null,
        'Failed inserting the store in the route days.'
      );
    }
  }

  async deleteStoresInRouteDay(routeDay:IRouteDay):Promise<IResponse<null>> {
    try {
      const { id_route_day } = routeDay;
      const { data, error } = await supabase.from(TABLES.ROUTE_DAY_STORES)
      .delete()
      .eq('id_route_day', id_route_day)
      
      console.log("delete stores: ", error)
      if (error) {
        return createApiResponse<null>(500, null, null,'Failed deleting stores of a route day.');
      } else {
        return createApiResponse<null>(200, null, null, 'Stores inserted successfully in the route day.');
      }

    } catch (error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting the inventory operation.'
      );    
    } 
  }

  async getAllDaysByRoute(id_route:string):Promise<IResponse<IRouteDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAYS).select().eq('id_route', id_route);
      if (error) {
        return createApiResponse<IRouteDay[]>(500, [], null,
          'Failed getting all the days by route.');
      } else {
        return createApiResponse<IRouteDay[]>(200, data, null);
      }
    } catch(error) {
      console.log(error)
      return createApiResponse<IRouteDay[]>(500, [], null, 'Failed getting all the days by route.');
    }
  }

  async getAllRouteDays():Promise<IResponse<IRouteDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAYS).select();
      if (error) {
        return createApiResponse<IRouteDay[]>(500, [], null,
          'Failed getting all the route days.');
      } else {
        return createApiResponse<IRouteDay[]>(200, data, null);
      }
    } catch(error) {
      console.log(error)
      return createApiResponse<IRouteDay[]>(500, [], null, 'Failed getting all the route days.');
    }
  }

  async getAllRoutesByVendor(id_vendor:string):Promise<IResponse<IRoute[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTES).select().eq('id_vendor', id_vendor);
      console.log(error)
      if (error) {
        return createApiResponse<IRoute[]>(500, [], null,
          'Failed getting all routes by vendor.');
      } else {
        return createApiResponse<IRoute[]>(200, data, null);
      }
    } catch(error) {
      console.log(error)
      return createApiResponse<IRoute[]>(500, [], null, 'Failed getting all routes by vendor.');
    }
  }

  async insertRoute(route:IRoute):Promise<IResponse<IRoute>> {
    try {
      const {
        route_name,
        description,
        route_status,
        id_vendor,
      } = route;

      const { data, error } = await supabase.from(TABLES.ROUTES)
      .insert({
        route_name,
        description,
        route_status,
        id_vendor,
      })
      .select('*');

      if (error) {
        return createApiResponse<IRoute>(
          determinigSQLSupabaseError(error),
          route,
          error.details,
          'Failed inserting the route' 
        );
      } else {
        return createApiResponse<IRoute>(
          201,
          data[0],
          null,
          'Route inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<IRoute>(
        500,
        route,
        null,
        'Failed inserting the route: ' + error
      );
    }
  }
  
  async updateRoute(route:IRoute):Promise<IResponse<IRoute>> {
    try {
      const {
        id_route,
        route_name,
        description,
        route_status,
        id_vendor,
      } = route;

      const { data, error } = await supabase.from(TABLES.ROUTES)
      .update({
        route_name: route_name,
        description: description,
        route_status: route_status,
        id_vendor: id_vendor,
      })
      .eq('id_route', id_route);

      if (error) {
        return createApiResponse<IRoute>(
          determinigSQLSupabaseError(error),
          route,
          error.hint,
          'Failed updating the route.'
        );
      } else {
        return createApiResponse<IRoute>(
          200,
          route,
          null,
          'Route updated successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<IRoute>(
        500,
        route,
        null,
        'Failed updating the route.'
      );
    }
  }

  async deleteRoute(route:IRoute):Promise<IResponse<null>> {
    try {
      const { id_route } = route;
      const { data, error } = await supabase.from(TABLES.ROUTES)
      .delete()
      .eq('id_route', id_route)
      
      if (error) {
        return createApiResponse<null>(500, null, null,'Failed deleting the route.');
      } else {
        return createApiResponse<null>(200, null, null, 'Route deleted successfully.');
      }

    } catch (error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed deleting the route.'
      );    
    } 
  }

  async insertDaysOfRoute(routeDays:IRouteDay[]):Promise<IResponse<IRouteDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAYS)
      .insert(
        routeDays.map((routeDay:IRouteDay) => {return {id_day: routeDay.id_day, id_route: routeDay.id_route}})
      )
      .select('*');

      if (error) {
        return createApiResponse<IRouteDay[]>(
          determinigSQLSupabaseError(error),
          [],
          error.details,
          'Failed inserting the route' 
        );
      } else {
        return createApiResponse<IRouteDay[]>(
          201,
          data,
          null,
          'Route inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<IRouteDay[]>(
        500,
        [],
        null,
        'Failed inserting the route: ' + error
      );
    }
  }

  async deleteDaysOfRoute(route:IRoute):Promise<IResponse<null>> {
    try {
      const { id_route } = route;
      const { data, error } = await supabase.from(TABLES.ROUTE_DAYS)
      .delete()
      .eq('id_route', id_route)
  
      if (error) {
        return createApiResponse<null>(500, null, null,'Failed deleting days of the route day.');
      } else {
        return createApiResponse<null>(200, null, null, 'Route days deleted successfully.');
      }

    } catch (error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed deleting days of the route day.'
      );    
    }
  }


  //Related to users
  async getUserDataByCellphone(user: IUser):Promise<IResponse<IUser>> {
    const emptyUser:IUser = {
      id_vendor:  '',
      cellphone:  '',
      name:       '',
      password:   '',
      status:     0,
    };
    try {
      const { cellphone } = user;

      if(cellphone === undefined) {
        return createApiResponse(
          400,
          emptyUser,
          null,
          'Cellphone was not provided.'
        );
      } else {
        const { data, error } = await supabase.from(TABLES.VENDORS)
        .select()
        .eq('cellphone', cellphone);

        console.log(error)
        if (error) {
          return createApiResponse<IUser>(
            determinigSQLSupabaseError(error),
            emptyUser,
            null,
            'Failed logging the user.'
          );
        } else {
          const identifiedUser = data.pop();
          return createApiResponse<IUser>(200, identifiedUser, null, 'Work day updated successfully.');
        }
      }

    } catch (error) {
      return createApiResponse(
        500,
        emptyUser,
        null,
        'It was not possible to communicate with the server'
      );
    }
  }
  async getUserDataById(id_vendor:string):Promise<IResponse<IUser>> {
    const emptyUser:IUser = {
      id_vendor:  '',
      cellphone:  '',
      name:       '',
      password:   '',
      status:     0,
    };
    try {
      const { data, error } = await supabase.from(TABLES.VENDORS)
      .select()
      .eq('id_vendor', id_vendor);

      if (error) {
        return createApiResponse<IUser>(
          determinigSQLSupabaseError(error),
          emptyUser,
          null,
          'Failed logging the user.'
        );
      } else {
        const identifiedUser = data.pop();
        return createApiResponse<IUser>(200, identifiedUser, null, 'Work day updated successfully.');
      }
    } catch (error) {
      return createApiResponse(
        500,
        emptyUser,
        null,
        'It was not possible to communicate with the server'
      );
    }
  }

  async getAllUsers():Promise<IResponse<IUser[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.VENDORS)
                                    .select()

      if (error) {
        return createApiResponse<IUser[]>(500, [], null,'Failed getting work days by date range.');
      } else {
        return createApiResponse<IUser[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IUser[]>(500, [], null, 'Failed getting work days by date range.');
    }
  }


  // Related to products (inventory operations)
  async insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<null>> {
    try {
      const {
        id_inventory_operation,
        sign_confirmation,
        date,
        audit,
        id_inventory_operation_type,
        id_work_day,
        state,
      } = inventoryOperation;

      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS)
      .insert({
        id_inventory_operation: id_inventory_operation,
        sign_confirmation: sign_confirmation,
        date: date,
        audit: audit,
        id_inventory_operation_type: id_inventory_operation_type,
        id_work_day: id_work_day,
        state: state,
      });

      if (error) {
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed inserting the inventory operation.'
        );
      } else {
        return createApiResponse<null>(
          201,
          null,
          null,
          'Inventory operation inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting the inventory operation.'
      );
    }
  }

  async updateInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<null>> {
    try {
      const {
        id_inventory_operation,
        sign_confirmation,
        date,
        audit,
        id_inventory_operation_type,
        id_work_day,
        state,
      } = inventoryOperation;

      console.log("id_work_day: ", id_work_day)
      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS)
      .update({
        sign_confirmation: sign_confirmation,
        date: date,
        audit: audit,
        id_inventory_operation_type: id_inventory_operation_type,
        id_work_day: id_work_day,
        state: state,
      })
      .eq('id_inventory_operation', id_inventory_operation);

      console.log("update inventory operation: ", data)
      if (error) {
        console.log("update inventory operation: ", error)
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed inserting the inventory operation.'
        );
      } else {
        return createApiResponse<null>(
          201,
          data,
          null,
          'Inventory operation inserted successfully.'
        );
      }
    } catch(error) {
      console.log("update inventory operation: ", error)
      return createApiResponse<null>(
        500,
        null,
        null,'Failed updating the inventory operation.'
      );
    }
  }

  async insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<IResponse<null>> {
    try {
      for (let i = 0; i < inventoryOperationDescription.length; i++) {
        const {
          id_product_operation_description,
          amount,
          price_at_moment,
          id_inventory_operation,
          id_product,
        } = inventoryOperationDescription[i];

        const { data, error } = await supabase
        .from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS)
        .insert({
          id_product_operation_description: id_product_operation_description,
          amount: amount,
          price_at_moment: price_at_moment,
          id_inventory_operation: id_inventory_operation,
          id_product: id_product,
        });

        console.log("Insert inventory operation description (data): ", data)
        if (error) {
          console.log("Insert inventory operation description (error): ", error)
          return createApiResponse<null>(
            determinigSQLSupabaseError(error),
            null,
            null,
            'Failed inserting an operation description.'
          );
        } else {
          /* There is not instruaciton; The process continues*/
      }
    }

      return createApiResponse<null>(
        201,
        null,
        null,
        'Inventory operation description inserted successfully.'
      );

    } catch (error) {
      console.log("Insert inventory operation description: ", error)
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting an operation description.'
      );
    }
  }

  async getAllInventoryOperationDescriptionsOfInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<IInventoryOperationDescription[]>> {
    try {
      const { id_inventory_operation } = inventoryOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS)
        .select().eq('id_inventory_operation', id_inventory_operation);

      if (error) {
        return createApiResponse<IInventoryOperationDescription[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all operation description of an inventory operation.'
        );
      } else {
        return createApiResponse<IInventoryOperationDescription[]>(
          200,
          data,
          null,
          ''
        );
      }
    } catch(error) {
      return createApiResponse<IInventoryOperationDescription[]>(
        500,
        [],
        null,
        'Failed getting all operation description of an inventory operation.'
      );
    }
  }

  async getAllInventoryOperationsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IInventoryOperation[]>> {
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS).select().eq('id_work_day', id_work_day);

      if (error) {
        return createApiResponse<IInventoryOperation[]>(
          determinigSQLSupabaseError(error),
          [], 
          null,
          'Failed getting all inventory operations of the day.'
        );
      } else {
        return createApiResponse<IInventoryOperation[]>(
          200,
          data,
          null,
          ''
        );
      }
    } catch(error) {
      return createApiResponse<IInventoryOperation[]>(
        500,
        [],
        null,
        'Failed getting all inventory operations of the day.'
      );
    }
  }

  async getAllInventoryOperationDescriptionsOfWorkDay(inventoryOperations: IInventoryOperation[]):Promise<IResponse<IInventoryOperationDescription[]>> {
    try {
      const arrIdInventoryOperations = inventoryOperations.map((inventoryOperation:IInventoryOperation) => { return inventoryOperation.id_inventory_operation; });
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select().in('id_inventory_operation', arrIdInventoryOperations)

      if (error) {
        return createApiResponse<IInventoryOperationDescription[]>(
          determinigSQLSupabaseError(error),
          [], 
          null,
          'Failed getting all inventory operations of the day.'
        );
      } else {
        return createApiResponse<IInventoryOperationDescription[]>(
          200,
          data,
          null,
          ''
        );
      }
    } catch(error) {
      return createApiResponse<IInventoryOperationDescription[]>(
        500,
        [],
        null,
        'Failed getting all inventory operations of the day: ' + error
      );
    }
  }

  // Related to route transactions
  async insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<null>>{
    try {
      const {
        id_route_transaction,
        date,
        state,
        id_work_day,
        id_store,
        id_payment_method,
        cash_received,
      } = transactionOperation;

      const { data, error } = await supabase
      .from(TABLES.ROUTE_TRANSACTIONS)
      .insert({
        id_route_transaction: id_route_transaction,
        date: date,
        state: state,
        id_work_day: id_work_day,
        id_store: id_store,
        id_payment_method: id_payment_method,
        cash_received: cash_received,
      });
      if (error) {
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed inserting route transaction.'
        );
      } else {
        return createApiResponse<null>(
          201,
          data,
          null,
          'Route transaction inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting route transaction.'
      );
    }
  }

  async updateRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<null>>{
    try {
      const {
        id_route_transaction,
        date,
        state,
        cash_received,
        id_work_day,
        id_store,
        id_payment_method,
      } = transactionOperation;

      const { data, error } = await supabase
      .from(TABLES.ROUTE_TRANSACTIONS)
      .update({
        date: date,
        state: state,
        id_work_day: id_work_day,
        id_store: id_store,
        id_payment_method: id_payment_method,
        cash_received: cash_received,
      })
      .eq('id_route_transaction', id_route_transaction);

      if (error) {
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed updating route transaction.'
        );
      } else {
        return createApiResponse<null>(
          201,
          data,
          null,
          'Route transaction updated successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed updating route transaction.'
      );
    }
  }

  async getAllRouteTransactionsOfWorkDay(workDay: IDayGeneralInformation):
  Promise<IResponse<IRouteTransaction[]>>{
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTIONS)
        .select()
        .eq('id_work_day', id_work_day)
        .order('date', {ascending: true });

      if (error) {
        return createApiResponse<IRouteTransaction[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all route transactions of the day.'
        );
      } else {
        return createApiResponse<IRouteTransaction[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteTransaction[]>(
        500,
        [],
        null,
        'Failed getting all route transactions of the day.'
      );
    }
  }

  async insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<IResponse<null>>{
    try {
      const {
        id_route_transaction_operation,
        id_route_transaction,
        id_route_transaction_operation_type,
      } = transactionOperation;

      const { data, error } = await supabase
      .from(TABLES.ROUTE_TRANSACTION_OPERATIONS)
      .insert({
        id_route_transaction_operation: id_route_transaction_operation,
        id_route_transaction: id_route_transaction,
        id_route_transaction_operation_type: id_route_transaction_operation_type,
      });

      if (error) {
        return createApiResponse<null>(
          determinigSQLSupabaseError(error),
          null,
          null,
          'Failed inserting route transaction route transaction operation.'
        );
      } else {
        return createApiResponse<null>(
          201,
          data,
          null,
          'Route transaction operation inserted successfully.'
        );
      }
    } catch(error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting route transaction route transaction operation.'
      );
    }
  }

  async getAllRouteTransactionOperationsOfRouteTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<IRouteTransactionOperation[]>>{
    try {
      const { id_route_transaction } = routeTransaction;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTION_OPERATIONS).select()
        .eq('id_route_transaction', id_route_transaction);
      if (error) {
        return createApiResponse<IRouteTransactionOperation[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all route transactions operation of a route transaction.'
        );
      } else {
        return createApiResponse<IRouteTransactionOperation[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperation[]>(
        500,
        [],
        null,
        'Failed getting all route transactions operation of a route transaction.'
      );
    }
  }

  async insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<IResponse<null>> {
    try {
      transactionOperationDescription.forEach(async (transactionDescription:IRouteTransactionOperationDescription)=> {
        try {
          const {
            id_route_transaction_operation_description,
            price_at_moment,
            amount,
            id_route_transaction_operation,
            id_product,
          } = transactionDescription;

          const { data, error } = await supabase
          .from(TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS)
          .insert({
            id_route_transaction_operation_description:  id_route_transaction_operation_description,
            price_at_moment: price_at_moment,
            amount: amount,
            id_route_transaction_operation: id_route_transaction_operation,
            id_product: id_product,
          });

          if (error) {
            return createApiResponse<null>(
              determinigSQLSupabaseError(error),
              null,
              null,
              'Failed inserting route transaction operation description.'
            );
          } else {
            /* There is not instructions*/
          }
        } catch (error) {
          return createApiResponse<null>(
            determinigSQLSupabaseError(error),
            null,
            null,
            'Failed inserting route transaction operation description.'
          );
        }
      });

      return createApiResponse<null>(
        201,
        null,
        null,
        'Route transaction operation description inserted successfully.'
      );
    } catch(error) {
      return createApiResponse<null>(
        500,
        null,
        null,
        'Failed inserting route transaction operation description.'
      );
    }
  }

  async getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(routeTransactionOperation:IRouteTransactionOperation):Promise<IResponse<IRouteTransactionOperationDescription[]>> {
    try {
      const { id_route_transaction_operation } = routeTransactionOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select()
        .eq('id_route_transaction_operation', id_route_transaction_operation);
      if (error) {
        return createApiResponse<IRouteTransactionOperationDescription[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all route transactions operation description of a route transaction operation.'
        );
      } else {
        return createApiResponse<IRouteTransactionOperationDescription[]>(
          200,
          data,
          null
        );
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperationDescription[]>(
        500,
        [],
        null,
        'Failed getting all route transactions operation description of a route transaction operation.'
      );
    }
  }

  async getAllRouteTransactionOperationsOfWorkDay(routeTransactions:IRouteTransaction[]):Promise<IResponse<IRouteTransactionOperation[]>> {
    try {
      const arr_id_route_transaction:string[] = routeTransactions.map((routeTransaction) => { return routeTransaction.id_route_transaction });

      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTION_OPERATIONS)
        .select()
        .in('id_route_transaction', arr_id_route_transaction);

      if (error) {
        return createApiResponse<IRouteTransactionOperation[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all route transactions operation description of a route transaction operation.'
        );
      } else {
        return createApiResponse<IRouteTransactionOperation[]>(
          200,
          data,
          null
        );
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperation[]>(
        500,
        [],
        null,
        'Failed getting all route transactions operation description of a route transaction operation.'
      );
    }
  }

  async getAllRouteTransactionOperationsDescriptionsOfWorkDay(routeTransactionOperations:IRouteTransactionOperation[]):Promise<IResponse<IRouteTransactionOperationDescription[]>> {
    try {
      const arr_id_route_transaction_operations:string[] = routeTransactionOperations.map((routeTransactionOperation) => { return routeTransactionOperation.id_route_transaction_operation });

      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS)
        .select()
        .in('id_route_transaction_operation', arr_id_route_transaction_operations);

      if (error) {
        return createApiResponse<IRouteTransactionOperationDescription[]>(
          determinigSQLSupabaseError(error),
          [],
          null,
          'Failed getting all route transactions operation description of a route transaction operation.'
        );
      } else {
        return createApiResponse<IRouteTransactionOperationDescription[]>(
          200,
          data,
          null
        );
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperationDescription[]>(
        500,
        [],
        null,
        'Failed getting all route transactions operation description of a route transaction operation.'
      );
    }
  }

  // Related to subscriptions
  suscribeTable(nameOfTheChannel:string, typeOfEvent: 'INSERT'|'UPDATE'|'DELETE', tableName:string, handler:(payload) => void):IResponse<RealtimeChannel> {
    const newChannel:RealtimeChannel =  supabase
      .channel(nameOfTheChannel)
      .on('postgres_changes', { 
        event: typeOfEvent, 
        schema: 'public', 
        table: tableName}, 
        handler)
      .subscribe()
      console.log("channel to: ", tableName)
      console.log("Name of the channel to: ", nameOfTheChannel)
    return createApiResponse<RealtimeChannel>(
      200,
      newChannel,
      null,
      'Channel created successfully'
    );
  }
}
