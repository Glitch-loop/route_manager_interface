import AccountabilityTypeSummarizeProcess from "../general/AccountabilityTypeSummarizeProcess";
import DAYS_OPERATIONS from "@/utils/dayOperations";
import {
    IAccountabilityItem,
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
    IProductInventory,
    IRoute,
    IRouteDay,
    IRouteTransaction,
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription
} from "@/interfaces/interfaces";
import { 
    formatToCurrency,
    isOperationDescriptionEqualToMovement,
    isRouteOperationDescriptionValid,
 } from "@/utils/saleFunctionUtils";
import { convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";
import { determineProblemWithInventory } from "@/controllers/InventoryController";


function SummarizeDayComission({
    workday,
    inventory,
    routeTransactions,
    routeTransactionOperations,
    routeTransactionOperationDescriptions,
    inventoryOperations,
    inventoryOperationDescriptions
}:{
    workday:IRoute&IDayGeneralInformation&IDay&IRouteDay,
    inventory:IProductInventory[],
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

    // Operation related to inventory operations
    const problemWithInventory:number = determineProblemWithInventory(inventory, 
        inventoryOperations,
        inventoryOperationDescriptions,
        routeTransactions,
        routeTransactionOperations,
        routeTransactionOperationDescriptions,
    )

    // Operations related to route transaction
    const totalConceptProductDevolution:number = (routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isRouteOperationDescriptionValid(item, jsonRouteTransactionOperations, product_devolution, jsonRouteTransactions) ? item.amount * item.price_at_moment : 0)  + acc}, 0)) * -1;

    const totalConceptProductReposition:number = routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isRouteOperationDescriptionValid(item, jsonRouteTransactionOperations, product_reposition, jsonRouteTransactions) ? item.amount * item.price_at_moment : 0)  + acc}, 0);
        
    const productDevolutionBalance:number = totalConceptProductReposition + totalConceptProductDevolution 
        
    const totalConceptSales:number = routeTransactionOperationDescriptions
        .reduce((acc, item) => 
            { return (isRouteOperationDescriptionValid(item, jsonRouteTransactionOperations, sales, jsonRouteTransactions) ? item.amount * item.price_at_moment : 0)  + acc}, 0);

    const greatTotal:number = totalConceptSales + productDevolutionBalance;

    const sellingInCash:number = greatTotal;

    const pittyCash:number = workday.start_petty_cash;

    const cashToDeliver:number = sellingInCash + pittyCash;

    const deliveredCash:number = workday.final_petty_cash;

    const problemWithDeliveredCash:number =  deliveredCash - cashToDeliver;

    const totalOfSaleToDiscount:number = problemWithDeliveredCash + problemWithInventory + productDevolutionBalance 

    const totalToPayComission:number = totalConceptSales + totalOfSaleToDiscount;

    // Operations related to inventory operations


    // Making the page to display
    const contentOftheOperation:IAccountabilityItem[] = [
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
            isUnderline: true,
            isBold: true,
            isItalic: true,
            isSeparateLine: false,
        },
        {
            message: "Problemas con el inventario: ",
            value: formatToCurrency(problemWithInventory),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Merma: ",
            value: formatToCurrency(productDevolutionBalance),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total problemas del día: ",
            value: formatToCurrency(totalOfSaleToDiscount),
            isUnderline: false,
            isBold: true,
            isItalic: false,
            isSeparateLine: true,
        },
        {
            message: "Venta de hoy: ",
            value: formatToCurrency(totalConceptSales),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },
        {
            message: "Total problemas del día: ",
            value: formatToCurrency(totalOfSaleToDiscount),
            isUnderline: false,
            isBold: false,
            isItalic: false,
            isSeparateLine: false,
        },        
        {
            message: "Total para pagar la comisión: ",
            value: formatToCurrency(totalToPayComission),
            isUnderline: true,
            isBold: true,
            isItalic: true,
            isSeparateLine: false,
        },
        {
            message: "Comisión: ",
            value: formatToCurrency(totalToPayComission * 0.06),
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