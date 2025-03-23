'use client'

// Libraries
import React from 'react';

// Interfaces and utils
import { 
  IProductInventory, 
  IRouteTransaction, 
  IRouteTransactionOperation, 
  IRouteTransactionOperationDescription, 
  IStore 
} from '../../interfaces/interfaces';

// Components
import RouteTransactionFormat from './RouteTransactionFormat';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';

// Utils
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord, convertArrayInJsonUsingInterfaces } from '@/utils/generalUtils';


const SummarizeRouteTransacionsOfTheDay = ({
    routeTransactionOfTheDay,
    routeTransactionOperationsOfTheDay,
    routeTransactionOperationDescriptionsOfTheDay,
    productsInventory,
    storesOfTheDay,
  }:{
    routeTransactionOfTheDay:IRouteTransaction[],
    routeTransactionOperationsOfTheDay:IRouteTransactionOperation[],
    routeTransactionOperationDescriptionsOfTheDay:IRouteTransactionOperationDescription[],
    productsInventory:IProductInventory[],
    storesOfTheDay:IStore[],
  }) => {
    // let jsonRouteTransactionOperations:Record<string, IRouteTransactionOperation> = convertArrayInJsonUsingInterfaces(routeTransactionOperationsOfTheDay);
    // let jsonRouteTransactionOperationsDescription:Record<string, IRouteTransactionOperationDescription> = convertArrayInJsonUsingInterfaces(routeTransactionOperationDescriptionsOfTheDay);
    const jsonStores:Record<string, IStore> = convertArrayInJsonUsingInterfaces(storesOfTheDay);

    const routeTransactionsGroupedByStore:Map<string, IRouteTransaction[]> = new Map<string, IRouteTransaction[]>();

    routeTransactionOfTheDay.forEach((routeTransaction:IRouteTransaction) => {
      const { id_store } = routeTransaction;
      if(routeTransactionsGroupedByStore.has(id_store) === false) {
        routeTransactionsGroupedByStore.set(id_store, []);
      }
      
      if (routeTransactionsGroupedByStore.get(id_store) !== undefined) {
        routeTransactionsGroupedByStore.get(id_store)?.push(routeTransaction)
      }
    });
    
  return (
    <div className='flex flex-col'>
      { [...routeTransactionsGroupedByStore.entries()].map(([idStore, routeTransactionsOfStore]) => {
        return (
          <Accordion
          key={idStore}>
            <AccordionSummary>
              <AccordionDetails className='text-xl'>
                <span>
                  { jsonStores[idStore] === undefined ? "Tienda no especificada" : 
                    capitalizeFirstLetterOfEachWord(jsonStores[idStore].store_name)
                  }                  
                </span>
                <span className='mx-2'>-</span>
                <span className='italic mr-2'>Registros: </span><span className='italic'>{routeTransactionsOfStore.length}</span>
              </AccordionDetails>
            </AccordionSummary>
            <AccordionDetails>
              { routeTransactionsOfStore.map((routeTransacion) => {
                const operationDescriptionByOperation:Map<string, IRouteTransactionOperationDescription[]> = new Map();
        
                const { id_route_transaction } = routeTransacion;
                // Getting all the operations of the current transaction
                const arrRouteTransactionOperations:IRouteTransactionOperation[] = routeTransactionOperationsOfTheDay
                  .filter((operation:IRouteTransactionOperation) => {
                    return operation.id_route_transaction === id_route_transaction;
                  });
                
                // Getting all the description of the operations of the current trasnaction
                arrRouteTransactionOperations.forEach((operation:IRouteTransactionOperation) => {
                  const { id_route_transaction_operation } = operation;
                  operationDescriptionByOperation.set(
                    id_route_transaction_operation,
                    routeTransactionOperationDescriptionsOfTheDay.filter((operationDescription) => {
                      return operationDescription.id_route_transaction_operation === id_route_transaction_operation;
                  }));
                })
        
                return (
                  <RouteTransactionFormat
                    key={id_route_transaction}
                    routeTransaction={routeTransacion}
                    routeTransactionOperations={arrRouteTransactionOperations}
                    routeTransactionOperationDescriptions={operationDescriptionByOperation}
                    productsInventory={productsInventory}
                  />
                )
              })}
            </AccordionDetails>
          </Accordion>
        )})}

    </div>
  );
};

export default SummarizeRouteTransacionsOfTheDay;
