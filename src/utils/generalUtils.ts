import { 
    isTypeIRouteTransaction, 
    isTypeIRouteTransactionOperation, 
    isTypeIRouteTransactionOperationDescription, 
    isTypeIStore
} from "./guards";


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
        }
    })

    return convertedArray;
}