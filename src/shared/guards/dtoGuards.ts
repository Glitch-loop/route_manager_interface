import RouteDTO from '@/shared/dto/RouteDTO';
import RouteDayDTO from '@/shared/dto/RouteDayDTO';
import RouteDayStoreDTO from '@/shared/dto/RouteDayStoreDTO';
import ProductDTO from '@/shared/dto/ProductDTO';
import StoreDTO from '@/shared/dto/StoreDTO';
import InventoryOperationDTO from '@/shared/dto/InventoryOperationDTO';
import InventoryOperationDescriptionDTO from '@/shared/dto/InventoryOperationDescriptionDTO';
import WorkDayInformationDTO  from '@/shared/dto/WorkdayInformationDTO';
import RouteTransactionDTO from '@/shared/dto/RouteTransactionDTO';
import RouteTransactionDescriptionDTO from '@/shared/dto/RouteTransactionDescriptionDTO';
import ProductInventoryDTO from '@/shared/dto/ProductInventoryDTO';
import DayOperationDTO from '@/shared/dto/DayOperationDTO';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && value !== undefined && typeof value === 'object';
}

export function isProductDTO(dto: unknown): dto is ProductDTO {
    return (
        isObjectRecord(dto) &&
        'id_product' in dto &&
        'product_name' in dto &&
        'barcode' in dto &&
        'weight' in dto &&
        'unit' in dto &&
        'comission' in dto &&
        'price' in dto &&
        'product_status' in dto &&
        'order_to_show' in dto
    );
}

export function isInventoryOperationDTO(dto: unknown): dto is InventoryOperationDTO {
    return (
        isObjectRecord(dto) &&
        'id_inventory_operation' in dto &&
        'sign_confirmation' in dto &&
        'date' in dto &&
        'state' in dto &&
        'audit' in dto &&
        'id_inventory_operation_type' in dto &&
        'id_work_day' in dto &&
        'inventory_operation_descriptions' in dto
    );
}

export function isWorkDayDTO(dto: unknown): dto is WorkDayInformationDTO {
    return (
        isObjectRecord(dto) &&
        'id_work_day' in dto &&
        'start_date' in dto &&
        'finish_date' in dto &&
        'start_petty_cash' in dto &&
        'final_petty_cash' in dto &&
        'id_route' in dto &&
        'route_name' in dto &&
        'description' in dto &&
        'route_status' in dto &&
        'id_day' in dto &&
        'id_route_day' in dto
    );
}

export function isRouteDTO(dto: unknown): dto is RouteDTO {
    return (
        isObjectRecord(dto) &&
        'id_route' in dto &&
        'route_name' in dto &&
        'description' in dto &&
        'route_status' in dto &&
        'id_vendor' in dto &&
        'route_day_by_day' in dto
    );
}

export function isRouteDayDTO(dto: unknown): dto is RouteDayDTO {
    return (
        isObjectRecord(dto) &&
        'id_route_day' in dto &&
        'id_route' in dto &&
        'id_day' in dto &&
        'stores' in dto
    )
}

export function isRouteDayStoreDTO(dto: unknown): dto is RouteDayStoreDTO {
    return (
        isObjectRecord(dto) &&
        'id_route_day_store' in dto &&
        'position_in_route' in dto &&
        'id_route_day' in dto &&
        'id_store' in dto
    );
}

export function isRouteTransactionDescriptionDTO(dto: unknown): dto is RouteTransactionDescriptionDTO {
    return (
        isObjectRecord(dto) &&
        'id_route_transaction_description' in dto &&
        'price_at_moment' in dto &&
        'amount' in dto &&
        'created_at' in dto &&
        'id_transaction_operation_type' in dto &&
        'id_product' in dto &&
        'id_route_transaction' in dto &&
        'id_product_inventory' in dto
    );
}

export function isRouteTransactionDTO(dto: unknown): dto is RouteTransactionDTO {
    return (
        isObjectRecord(dto) &&
        'id_route_transaction' in dto &&
        'date' in dto &&
        'state' in dto &&
        'cash_received' in dto &&
        'id_work_day' in dto &&
        'id_store' in dto &&
        'payment_method' in dto &&
        'transaction_description' in dto
    );
}

export function isInventoryOperationDescriptionDTO(dto: unknown): dto is InventoryOperationDescriptionDTO {
    return (
        isObjectRecord(dto) &&
        'id_product_operation_description' in dto &&
        'price_at_moment' in dto &&
        'amount' in dto &&
        'id_inventory_operation' in dto &&
        'id_product' in dto
    );
}

export function isProductInventoryDTO(dto: unknown): dto is ProductInventoryDTO {
    return (
        isObjectRecord(dto) &&
        'id_product_inventory' in dto &&
        'price_at_moment' in dto &&
        'stock' in dto &&
        'id_product' in dto
    );
}

export function isDayOperationDTO(dto: unknown): dto is DayOperationDTO {
    return (
        isObjectRecord(dto) &&
        'id_day_operation' in dto &&
        'id_item' in dto &&
        'operation_type' in dto &&
        'created_at' in dto
    );
}

export function isStoreDTO(dto: unknown): dto is StoreDTO {
    return (
        isObjectRecord(dto) &&
        'id_store' in dto &&
        'street' in dto &&
        'ext_number' in dto &&
        'colony' in dto &&
        'postal_code' in dto &&
        'address_reference' in dto &&
        'store_name' in dto &&
        'latitude' in dto &&
        'longitude' in dto &&
        'creation_date' in dto &&
        'status_store' in dto
    );
}