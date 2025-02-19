import AccountabilityTypeSummarizeProcess from "../general/AccountabilityTypeSummarizeProcess";
import DAYS_OPERATIONS from "@/utils/dayOperations";
import {
    IAccountabilityItem,
    IDay,
    IDayGeneralInformation,
    IRoute,
    IRouteDay,
    IRouteTransaction,
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription
} from "@/interfaces/interfaces";
import { formatToCurrency } from "@/utils/saleFunctionUtils";
import { useEffect } from "react";
import { convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";

function isOperationDescriptionEqualToMovement(
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

//function isCashOperation()

function SummarizeOfTheDay({
    workday,
    routeTransactions,
    routeTransactionOperations,
    routeTransactionOperationDescriptions
}:{
    workday:IRoute&IDayGeneralInformation&IDay&IRouteDay,
    routeTransactions:IRouteTransaction[],
    routeTransactionOperations:IRouteTransactionOperation[],
    routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[]
}) {
    const { product_devolution, product_reposition, sales } = DAYS_OPERATIONS;
    const jsonRouteTransactions:Record<string, IRouteTransaction> = convertArrayInJsonUsingInterfaces(routeTransactions)
    const jsonRouteTransactionOperations:Record<string, IRouteTransactionOperation> = convertArrayInJsonUsingInterfaces(routeTransactionOperations)
    const jsonRouteTransactionOperationDescriptions:Record<string, IRouteTransactionOperationDescription> = convertArrayInJsonUsingInterfaces(routeTransactionOperationDescriptions)

    const totalConceptProductDevolution:number = (routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isOperationDescriptionEqualToMovement(item, jsonRouteTransactionOperations, product_devolution) ? item.amount * item.price_at_moment : 0)  + acc}, 0)) * -1;

    const totalConceptProductReposition:number = routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isOperationDescriptionEqualToMovement(item, jsonRouteTransactionOperations, product_reposition) ? item.amount * item.price_at_moment : 0)  + acc}, 0);
        
    const productDevolutionBalance:number = totalConceptProductReposition + totalConceptProductDevolution 
        
    const totalConceptSales:number = routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isOperationDescriptionEqualToMovement(item, jsonRouteTransactionOperations, sales) ? item.amount * item.price_at_moment : 0)  + acc}, 0);

    const greatTotal:number = totalConceptSales + productDevolutionBalance;

    const sellingInCash:number = greatTotal;

    const pittyCash:number = workday.start_petty_cash;

    const cashToDeliver:number = sellingInCash - pittyCash;

    const deliveredCash:number = workday.final_petty_cash;

    const problemWithDeliveredCash:number = cashToDeliver - deliveredCash;


    const contentOftheOperation:IAccountabilityItem[] = [
        {
            message: "Total de devolución de producto:",
            value: formatToCurrency(totalConceptProductDevolution),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total de reposición de producto:",
            value: formatToCurrency(totalConceptProductReposition),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total de balance devolución de producto:",
            value: formatToCurrency(productDevolutionBalance),
            isUnderline: false,
            isBold: false,
            isItalic: true,
            isSeparateLine: true,
        },
        {
            message: "Total de balance devolución de producto:",
            value: formatToCurrency(productDevolutionBalance),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total de ventas:",
            value: formatToCurrency(totalConceptSales),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Gran total de hoy: ",
            value: formatToCurrency(greatTotal),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },
        {
            message: "Gran total de hoy: ",
            value: formatToCurrency(greatTotal),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total venta realizada en efectivo: ",
            value: formatToCurrency(greatTotal),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },
        {
            message: "Caja chica: ",
            value: formatToCurrency(pittyCash),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total dinero a recibir: ",
            value: formatToCurrency(cashToDeliver),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },
        {
            message: "Total dinero a recibir: ",
            value: formatToCurrency(cashToDeliver),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total dinero entregado: ",
            value: formatToCurrency(deliveredCash),
            isUnderline: true,
            isBold: true,
            isItalic: true,
            isSeparateLine: false,
        },
        {
            message: "Diferencia entre dinero recibido y dinero entregado: ",
            value: formatToCurrency(problemWithDeliveredCash),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: false,
        },

    ]

    return (
        <AccountabilityTypeSummarizeProcess 
            titleOfSummarize="Resumen del dia"
            contentOfSummariaze={contentOftheOperation}
        />
    )
}


export default SummarizeOfTheDay;