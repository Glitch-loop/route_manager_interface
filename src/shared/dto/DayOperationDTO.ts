import { DAY_OPERATIONS } from '@/core/enums/DayOperations';

export default interface DayOperationDTO {
    id_day_operation: string;
    id_item: string;
    operation_type: DAY_OPERATIONS;
    created_at: string;
    id_dependency: string | null;
}