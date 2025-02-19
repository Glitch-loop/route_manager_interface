import { IProductInventory } from "../interfaces/interfaces";


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