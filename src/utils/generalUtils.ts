import { v4 as uuidv4 } from "uuid";

import { 
  isTypeIInventoryOperation,
  isTypeIInventoryOperationDescription,
  isTypeIProductInventory,
    isTypeIRoute,
    isTypeIRouteDay,
    isTypeIRouteDayStore,
    isTypeIRouteTransaction, 
    isTypeIRouteTransactionOperation, 
    isTypeIRouteTransactionOperationDescription, 
    isTypeIStore
} from "./guards";



export const generateUUIDv4 = (): string => uuidv4();


export function capitalizeFirstLetter(input: string|undefined|null): string {
    if (!input || input === undefined || input === null) {
      return '';
    } else {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  }
  
  export function capitalizeFirstLetterOfEachWord(input: string|undefined|null): string {
    if(!input || input === undefined || input === null) {
      return '';
    } else {
      const arrWords:string[] = input.split(' ');
      let sentence:string = '';
  
      arrWords.forEach((word:string) => {
        sentence = sentence + word.charAt(0).toUpperCase() + word.slice(1) + ' ';
      });
  
      sentence = sentence.trimEnd()
      
      return sentence;
    }
  }

export function convertArrayInJsonUsingInterfaces(arrayToConvert:unknown[]):Record<string, unknown> {
    const convertedArray:Record<string, unknown> = {};
    arrayToConvert.forEach((item:unknown) => {
        if (isTypeIRouteTransaction(item)) {
          convertedArray[item.id_route_transaction] = item;
        } else if (isTypeIRouteTransactionOperation(item)) {
          convertedArray[item.id_route_transaction_operation] = item;
        } else if (isTypeIRouteTransactionOperationDescription(item)) {
          convertedArray[item.id_route_transaction_operation_description] = item;
        } else if (isTypeIStore(item)) {
          convertedArray[item.id_store] = item;
        } else if (isTypeIInventoryOperation(item)) {
          convertedArray[item.id_inventory_operation] = item;
        } else if (isTypeIInventoryOperationDescription(item)) {
          convertedArray[item.id_product_operation_description] = item;
        } else if (isTypeIProductInventory(item)) {
          convertedArray[item.id_product] = item;
        } else if (isTypeIRoute(item)) {
          convertedArray[item.id_route] = item;
        } else if (isTypeIRouteDay(item)) {
          convertedArray[item.id_route_day] = item;
        } else if (isTypeIRouteDayStore(item)) {
          convertedArray[item.id_route_day_store] = item;
        }
    })

    return convertedArray;
}


export function addingInformationParticularFieldOfObject(
  dictionary: any,
  idField: string,
  fieldToAddTheInformation: string,
  informationToAdd:any,
  newObject: any) {
  const updatedDictionary:any = { ...dictionary };

  if (!updatedDictionary[idField]) {
    updatedDictionary[idField] = { ...newObject };
  } else {
    if (fieldToAddTheInformation in updatedDictionary[idField]) {
      updatedDictionary[idField][fieldToAddTheInformation] += informationToAdd;
    } else {
      /* The field doesn't exist in the object/json */
      updatedDictionary[idField][fieldToAddTheInformation] = informationToAdd;
    }
  }

  return updatedDictionary;
}
