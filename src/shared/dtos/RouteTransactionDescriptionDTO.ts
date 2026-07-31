import DAY_OPERATIONS from "@/core/enums/DayOperations";

export interface RouteTransactionDescriptionDTO {
    id_route_transaction_description: string,
    price_at_moment: number,
    cost_at_moment: number;
    quantity: number;
    created_at: Date;
    id_transaction_operation_type: DAY_OPERATIONS,
    id_route_transaction: string,
    id_product: string,
}