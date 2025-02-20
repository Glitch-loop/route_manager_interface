import AccountabilityTypeSummarizeProcess from "../general/AccountabilityTypeSummarizeProcess";
import DAYS_OPERATIONS from "@/utils/dayOperations";
import {
    IAccountabilityItem,
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
    IRoute,
    IRouteDay,
    IRouteTransaction,
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription
} from "@/interfaces/interfaces";
import { 
    formatToCurrency,
    isOperationDescriptionEqualToMovement,
 } from "@/utils/saleFunctionUtils";
import { convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";


function SummarizeDayComission({
    workday,
    routeTransactions,
    routeTransactionOperations,
    routeTransactionOperationDescriptions,
    inventoryOperations,
    inventoryOperationDescriptions
}:{
    workday:IRoute&IDayGeneralInformation&IDay&IRouteDay,
    routeTransactions:IRouteTransaction[],
    routeTransactionOperations:IRouteTransactionOperation[],
    routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[],
    inventoryOperations:IInventoryOperation[],
    inventoryOperationDescriptions:IInventoryOperationDescription[],
}) {

    const { product_devolution, product_reposition, sales } = DAYS_OPERATIONS;
    const jsonRouteTransactions:Record<string, IRouteTransaction> = convertArrayInJsonUsingInterfaces(routeTransactions)
    const jsonRouteTransactionOperations:Record<string, IRouteTransactionOperation> = convertArrayInJsonUsingInterfaces(routeTransactionOperations)
    const jsonRouteTransactionOperationDescriptions:Record<string, IRouteTransactionOperationDescription> = convertArrayInJsonUsingInterfaces(routeTransactionOperationDescriptions)


    // Operations related to route transaction
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

    // Operations related to inventory operations


    // Making the page to display
    const contentOftheOperation:IAccountabilityItem[] = [
        {
            message: "Gran total de hoy: ",
            value: formatToCurrency(greatTotal),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Balance de devolución de producto: ",
            value: formatToCurrency(productDevolutionBalance),
            isUnderline: false,
            isBold: false,
            isItalic: true,
            isSeparateLine: false,
        },
        {
            message: "Total dinero en concepto de ventas: ",
            value: formatToCurrency(totalConceptSales),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },
        {
            message: "Total dinero a entregar: ",
            value: formatToCurrency(cashToDeliver),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total dinero recibido: ",
            value: formatToCurrency(deliveredCash),
            isUnderline: true,
            isBold: false,
            isItalic: false,
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
        {
            message: "Problemas con el inventario: ",
            value: "$10",
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total a descontar: ",
            value: "-$120",
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
            message: "Total a descontar: ",
            value: "-$120",
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },        
        {
            message: "Total para pagar la comisión: ",
            value: "-$120",
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Comisión: ",
            value: "-$120",
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },

    ]



    return (
        <AccountabilityTypeSummarizeProcess 
            titleOfSummarize="Comisión pagada (pendiente)"
            contentOfSummariaze={contentOftheOperation}
        />
    )
}

export default SummarizeDayComission;