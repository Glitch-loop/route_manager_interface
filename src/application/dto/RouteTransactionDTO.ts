import { PaymentMethod } from "@/core/object-values/PaymentMethod";
import { ROUTE_TRANSACTION_STATE } from "@/core/enums/RouteTransactionState";
import RouteTransactionDescriptionDTO from "@/application/dto/RouteTransactionDescriptionDTO";
import PAYMENT_METHODS from "@/core/enums/PaymentMethod";

export default interface RouteTransactionDTO {
    id_route_transaction: string,
    date: string,
    state: ROUTE_TRANSACTION_STATE,
    cash_received: number,
    id_work_day: string,
    id_store: string,
    payment_method: PAYMENT_METHODS,
    transaction_description: RouteTransactionDescriptionDTO[]
}