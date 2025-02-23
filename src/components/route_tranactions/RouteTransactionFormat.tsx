// Libraries
import React, { useState } from 'react';

// Interfaces
import {
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
} from '../../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '@/utils/dayOperations';


// Components
import SectionTitle from './route_transaction_format_elements/SectionTitle';
import TotalsSummarize from '@/components/route_tranactions/route_transaction_format_elements/TotalsSummarize';
import ProductTableRouteTransaction from '@/components/route_tranactions/route_transaction_format_elements/ProductTableRouteTransaction';

// Controllers
import { 
    convertRouteTransactionOperationDescriptionToProductInventoryInterface,
    convertOperationDescriptionToProductInventoryInterface
 } from '@/utils/inventoryUtils';
import { cast_string_to_date_hour_format } from '@/utils/dateUtils';


function getConceptTransactionOperation(idTransactionOperationType:string,
  routeTransactionOperations:IRouteTransactionOperation[]):string {
    let idTransactionOperation = '';

    /*
      Find the operation been all the operations of the transaction according with the
      operation type.

      Remember that at the moment (10-13-24), there are only 3 types of operation that a
      transaction can have:
        - Devolution
        - Reposition
        - Sale
    */
    const foundTransactionOperation = routeTransactionOperations
      .find(transactionOperation => {
          return transactionOperation.id_route_transaction_operation_type ===
          idTransactionOperationType; });

    if (foundTransactionOperation === undefined) {
      /* Do nothing */
    } else {
      idTransactionOperation = foundTransactionOperation.id_route_transaction_operation;
    }

    return idTransactionOperation;
  }



const RouteTransactionFormat = ({
  routeTransaction,
  routeTransactionOperations,
  routeTransactionOperationDescriptions,
  productsInventory
}:{
  routeTransaction:IRouteTransaction,
  routeTransactionOperations:IRouteTransactionOperation[],
  routeTransactionOperationDescriptions: Map<string,IRouteTransactionOperationDescription[]>,
  productsInventory:IProductInventory[]
}) => {

  /*
    Declaring states to store the movements for each operations.
    At the moment there are only 3 type of operations that a transaction can contain.

    In the declaration of each state, first it is gotten the specific id of the operation according to the type of the state;
    In the first state it is asked for the ID of the operation of the type operation devolution.

    Once the ID is gotten, it is used to get the "description" (or movements) of the operation, this consulting to the map that contains
    all the movements of all the operation of the trasnaction.

    Once it was retrieved the movements for the specific operation, it is converted to the interface that it comes to the IproductIvnetory
    interface.

  */
  const [currentTransaction, setCurrentTransaction] = useState<IRouteTransaction>(routeTransaction);

  // Variables for displaying information
  const productsDevolution:IProductInventory[] =
    convertOperationDescriptionToProductInventoryInterface(
      routeTransactionOperationDescriptions
      .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_devolution, routeTransactionOperations)), 
      productsInventory);

  const productsReposition:IProductInventory[] =
    convertOperationDescriptionToProductInventoryInterface(
      routeTransactionOperationDescriptions
      .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_reposition, routeTransactionOperations)), 
      productsInventory);

  const productsSale:IProductInventory[] =
    convertOperationDescriptionToProductInventoryInterface(
      routeTransactionOperationDescriptions
      .get(getConceptTransactionOperation(DAYS_OPERATIONS.sales, routeTransactionOperations)),
      productsInventory);

  return (
    <div className={`flex flex-row justify-center pt-7`}>
      <div className={`${currentTransaction.state ? 'bg-slate-300' : 'bg-slate-200'} 
        border p-2 flex flex-col justify-center items-center rounded-md`}>
        <div className={`w-full flex flex-col`}>
          <SectionTitle
            title={`Transacción - ${cast_string_to_date_hour_format(routeTransaction.date)}`}
            caption={currentTransaction.state ? '' : '(Cancelada)'}
            titlePositionStyle={'text-center w-full items-center justify-center'}/>
          {/* Product devolution section */}
          <SectionTitle
            title={'Devolución de producto'}
            caption={''}
            titlePositionStyle={'text-center w-full flex flex-row items-center justify-center'}
          />
          <ProductTableRouteTransaction
            arrayProducts={productsDevolution}
            totalSectionCaptionMessage={'Valor total de devolución: '}/>
          <div className="w-full flex flex-row justify-center items-center">
              <div className="w-11/12 bg-black py-px my-1"/>
          </div>
          {/* Product reposition section */}
          <SectionTitle
            title={'Reposición de producto'}
            caption={''}
            titlePositionStyle={'text-center w-full flex flex-row items-center justify-center'}
            />
          <ProductTableRouteTransaction
            arrayProducts={productsReposition}
            totalSectionCaptionMessage={'Valor total de reposición: '}/>
          <div className="w-full flex flex-row justify-center items-center">
              <div className="w-11/12 bg-black py-px my-1"/>
          </div>
          {/* Product sale section */}
          <SectionTitle
            title={'Venta'}
            caption={''}
            titlePositionStyle={'text-center w-full flex flex-row items-center justify-center'}
            />
          <ProductTableRouteTransaction
            arrayProducts={productsSale}
                totalSectionCaptionMessage={'Total venta: '}/>
          <div className="w-full flex flex-row justify-center items-center">
              <div className="w-11/12 bg-black py-px my-1"/>
          </div>
          {/* Totals sections */}
          <TotalsSummarize
              routeTransaction={currentTransaction}
              productsDevolution={productsDevolution}
              productsReposition={productsReposition}
              productsSale={productsSale}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteTransactionFormat;
