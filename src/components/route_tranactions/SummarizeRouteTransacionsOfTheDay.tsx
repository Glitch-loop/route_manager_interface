// Libraries
import React, { useEffect, useState } from 'react';

// Interfaces and utils
import { IProductInventory, IRouteTransaction, IRouteTransactionOperation, IRouteTransactionOperationDescription } from '../../interfaces/interfaces';
import { getProductDevolutionBalanceWithoutNegativeNumber } from '@/utils/saleFunctionUtils';

// Components
import RouteTransactionFormat from './RouteTransactionFormat';
import { convertArrayInJsonUsingInterfaces } from '@/utils/generalUtils';
import { Accordion, AccordionDetails } from '@mui/material';



const SummarizeRouteTransacionsOfTheDay = ({
    routeTransactionOfTheDay,
    routeTransactionOperationsOfTheDay,
    routeTransactionOperationDescriptionsOfTheDay,
    productsInventory,
  }:{
    routeTransactionOfTheDay:IRouteTransaction[],
    routeTransactionOperationsOfTheDay:IRouteTransactionOperation[],
    routeTransactionOperationDescriptionsOfTheDay:IRouteTransactionOperationDescription[],
    productsInventory:IProductInventory[],
  }) => {
    let jsonRouteTransactionOperations:Record<string, IRouteTransactionOperation> = convertArrayInJsonUsingInterfaces(routeTransactionOperationsOfTheDay);
    let jsonRouteTransactionOperationsDescription:Record<string, IRouteTransactionOperationDescription> = convertArrayInJsonUsingInterfaces(routeTransactionOperationDescriptionsOfTheDay);

    

  return (
    <div className='flex flex-col'>
      { routeTransactionOfTheDay.map((routeTransacion) => {
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

    </div>
  );
};

export default SummarizeRouteTransacionsOfTheDay;
