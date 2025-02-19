import { 
    isTypeIRouteTransaction, 
    isTypeIRouteTransactionOperation, 
    isTypeIRouteTransactionOperationDescription 
} from "./guards";


export function convertArrayInJsonUsingInterfaces(arrayToConvert:unknown[]):Record<string, unknown> {
    const convertedArray:Record<string, unknown> = {};
    
    
    arrayToConvert.forEach((item:unknown) => {
        if (isTypeIRouteTransaction(item)) {
            convertedArray[item.id_route_transaction] = item;
        } else if (isTypeIRouteTransactionOperation(item)) {
            convertedArray[item.id_route_transaction_operation] = item;
        } else if (isTypeIRouteTransactionOperationDescription(item)) {
            convertedArray[item.id_route_transaction_operation_description] = item;
        }
    })

    return convertedArray;
}