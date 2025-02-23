// Librarires
import React from 'react';

// Interfaces
import { IAccountabilityItem, IProductInventory, IRouteTransaction } from '../../../interfaces/interfaces';

// Utils
import { getProductDevolutionBalance, getPaymentMethod, calculateChange, formatToCurrency } from '@/utils/saleFunctionUtils';
import PAYMENT_METHODS from '../../../utils/paymentMethod';
import AccountabilityTypeSummarizeProcess from '@/components/general/AccountabilityTypeSummarizeProcess';

const TotalsSummarize = ({
  routeTransaction,
  productsDevolution,
  productsReposition,
  productsSale,
  }:{
  routeTransaction?:IRouteTransaction
  productsDevolution:IProductInventory[],
  productsReposition:IProductInventory[],
  productsSale:IProductInventory[]
  }) => {
  const subtotalProductDevolution:number = getProductDevolutionBalance(productsDevolution,[]);
  const subtotalProductReposition:number = getProductDevolutionBalance(productsReposition,[]);
  const subtotalSaleProduct:number = getProductDevolutionBalance(productsSale,[]);
  let productDevolutionBalance:number = 0;
  let greatTotal:number = 0;
  let cashReceived:number = 0;

  const greatTotalNumber = (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution);

  // Getting product devolution balance
  productDevolutionBalance = subtotalProductReposition - subtotalProductDevolution;

  // Getting great total of the operation
  greatTotal = subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution

  if (routeTransaction === undefined) {
    /* Do nothing */
  } else {
    cashReceived = routeTransaction.cash_received;
  }

  const cambioRecibido:number = calculateChange(greatTotalNumber, routeTransaction!.cash_received)

  // Related to payment method
  const paymentMethodlabel:string = "Metodo de pago " + (
    routeTransaction ? `(${getPaymentMethod(routeTransaction,PAYMENT_METHODS).payment_method_name}):` : ":") 

  // Making the page to display
  const contentOftheOperation:IAccountabilityItem[] = [
      {
          message: "Valor total de devolución de producto:",
          value: formatToCurrency(subtotalProductDevolution * -1),
          isUnderline: false,
          isBold: false,
          isItalic: false,
          isSeparateLine: false,
      },
      {
          message: "Valor total de reposición de producto:",
          value: formatToCurrency(subtotalProductReposition),
          isUnderline: false,
          isBold: false,
          isItalic: false,
          isSeparateLine: false,
      },
      {
          message: "Balance de devolución de producto:",
          value: formatToCurrency(productDevolutionBalance),
          isUnderline: false,
          isBold: true,
          isItalic: false,
          isSeparateLine: true,
      },
      {
          message: "Balance de devolución de producto:",
          value: formatToCurrency(productDevolutionBalance),
          isUnderline: false,
          isBold: false,
          isItalic: false,
          isSeparateLine: false,
      },
      {
          message: "Total de venta:",
          value: formatToCurrency(subtotalSaleProduct),
          isUnderline: false,
          isBold: false,
          isItalic: false,
          isSeparateLine: false,
      },
      {
          message: "Gran total:",
          value: formatToCurrency(greatTotal),
          isUnderline: false,
          isBold: true,
          isItalic: false,
          isSeparateLine: false,
      },
  ]

    const contentOfTheChangeOfTheOperation:IAccountabilityItem[] = [
      {
        message: paymentMethodlabel,
        value: formatToCurrency(cashReceived),
        isUnderline: false,
        isBold: true,
        isItalic: false,
        isSeparateLine: false,
      },
      {
        message: "Cambio: ",
        value: formatToCurrency(cambioRecibido),
        isUnderline: false,
        isBold: true,
        isItalic: false,
        isSeparateLine: false,
      }
    ]


  return (
    <div className={`w-full my-5 flex flex-col justify-center items-center`}>
      {/* Totals of the transaction */}
      <AccountabilityTypeSummarizeProcess 
        titleOfSummarize=''
        contentOfSummariaze={contentOftheOperation}
      />
      {/* Payment method */}
      { routeTransaction !== undefined &&
          <AccountabilityTypeSummarizeProcess 
          titleOfSummarize=''
          contentOfSummariaze={contentOfTheChangeOfTheOperation}/>
      }
    </div>
  );
};

export default TotalsSummarize;
