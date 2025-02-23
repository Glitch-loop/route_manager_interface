import { 
  IPaymentMethod,
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription
 } from "../interfaces/interfaces";


export function isOperationDescriptionEqualToMovement(
  operationDescription:IRouteTransactionOperationDescription, 
  jsonOperationDescription:Record<string, IRouteTransactionOperation>, 
  movement:string
):boolean {
      console.log(operationDescription)
      let result:boolean = false;
      if (jsonOperationDescription[operationDescription.id_route_transaction_operation] === undefined) {
          result = false;
      } else {
          const routeOperation:IRouteTransactionOperation = jsonOperationDescription[operationDescription.id_route_transaction_operation]
          if (routeOperation.id_route_transaction_operation_type === movement) {
              result = true;
          } else {
              result = false;
          }
      }
      return result;
}


// Related to selling calculations
export function getProductDevolutionBalance(productDevolution:IProductInventory[], productReposition:IProductInventory[]):number {
  const totalProductDevolution = productDevolution.reduce((acc,item) =>
    {return acc + item.price * item.amount;}, 0);

  const totalProductReposition = productReposition.reduce((acc, item) =>
    {return acc + item.price * item.amount;}, 0);

  return totalProductDevolution - totalProductReposition;
}
  
export function getProductDevolutionBalanceWithoutNegativeNumber(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  const total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return total * -1;
  } else {
    return total;
  }
}

export function formatToCurrency(numberToConvert:number, currencySymbol:string = "$"):string {
  let convertedNumber:string = ""
  if (numberToConvert < 0) {
    convertedNumber = '-' + currencySymbol + (numberToConvert * -1).toString();
  } else {
    convertedNumber = currencySymbol + (numberToConvert).toString();
  }

  return convertedNumber;
}

export function calculateChange(total:number, received:number){
  let difference:number = 0;
  if (total < 0) {
    /*
      It means that the vendor has to give money to the client, this probably
      becuase of a product devolution.
    */
    if (total + received < 0) {
      difference = 0;
    } else {
      difference = (total + received);
    }
  } else {
    /* Do nothing; It is a normal selling (vendor has to receive money)*/
    if (total - received < 0) {
      difference = (total - received) * -1;
    } else {
      difference = 0;
    }
  }
  return difference;
}


// Related to payment method
export function getPaymentMethod(routeTransaction: IRouteTransaction, paymentMethods: any[]) {
  const foundPaymentMethod:IPaymentMethod = {
    id_payment_method: '',
    payment_method_name: '',
  };

  const searchResult:IPaymentMethod|undefined = paymentMethods.find((paymentMethod:IPaymentMethod) => {
    return paymentMethod.id_payment_method === routeTransaction.id_payment_method;
  });

  if (searchResult === undefined) {
    /* No hay instrucciones */
  } else {
    foundPaymentMethod.id_payment_method = searchResult.id_payment_method;
    foundPaymentMethod.payment_method_name = searchResult.payment_method_name;
  }

  return foundPaymentMethod;
}
