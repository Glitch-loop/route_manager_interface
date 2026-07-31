import { DAY_OPERATIONS_ENUM } from "@/shared/enums/dayOperationsEnum";

export interface DayOperationDTO {
    id_day_operation: string;
    id_work_day: string;
    id_route_day: string;
    id_operation_type: DAY_OPERATIONS_ENUM;
    created_at: string;
    id_location: string | null;
    id_route_transaction: string | null;
    id_inventory_operation: string | null;
    latitude: string | null;
    longitude: string | null;
    id_day_operation_dependent: string | null;
}