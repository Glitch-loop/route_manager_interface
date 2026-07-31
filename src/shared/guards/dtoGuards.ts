import { RouteDTO } from '@/shared/dtos/RouteDTO';
import { RouteDayDTO } from '@/shared/dtos/RouteDayDTO';
import { RouteDayLocationDTO } from '@/shared/dtos/RouteDayLocationDTO';
import { ProductDTO } from '@/shared/dtos/ProductDTO';
import { ProductPriceDTO } from '@/shared/dtos/ProductPriceDTO';
import { LocationDTO } from '@/shared/dtos/LocationDTO';
import { LocationNoteDTO } from '@/shared/dtos/LocationNoteDTO';
import { InventoryOperationDTO } from '@/shared/dtos/InventoryOperationDTO';
import { InventoryOperationDescriptionDTO } from '@/shared/dtos/InventoryOperationDescriptionDTO';
import { WorkDayInformationDTO }  from '@/shared/dtos/WorkdayInformationDTO';
import { WorkDayNoteDTO }  from '@/shared/dtos/WorkDayNoteDTO';
import { RouteTransactionDTO } from '@/shared/dtos/RouteTransactionDTO';
import { RouteTransactionDescriptionDTO } from '@/shared/dtos/RouteTransactionDescriptionDTO';
import { PaymentMethodDTO } from '@/shared/dtos/PaymentMethodDTO';
import { PaymentSchemaDTO } from '@/shared/dtos/PaymentSchemaDTO';
import { ProductInventoryDTO } from '@/shared/dtos/ProductInventoryDTO';
import { DayOperationDTO } from '@/shared/dtos/DayOperationDTO';
import { UserDTO } from '@/shared/dtos/UserDTO';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && value !== undefined && typeof value === 'object';
}

export function isProductDTO(dto: unknown): dto is ProductDTO {
  return (
    isObjectRecord(dto) &&
    'id_product' in dto &&
    'product_name' in dto &&
    'cost' in dto &&
    'product_status' in dto &&
    'quantity_presentation' in dto &&
    'order_to_show' in dto &&
    'id_measurement_unit' in dto &&
    'product_price' in dto &&
    Array.isArray(dto.product_price) &&
    dto.product_price.every((item) => isProductPriceDTO(item)) &&
    (!('barcode' in dto) || dto.barcode === undefined || typeof dto.barcode === 'string')
  );
}

export function isProductPriceDTO(dto: unknown): dto is ProductPriceDTO {
  return (
    isObjectRecord(dto) &&
    'id_product_price' in dto &&
    'price' in dto &&
    'created_at' in dto &&
    (!('id_client' in dto) || dto.id_client === undefined || typeof dto.id_client === 'string') &&
    (!('id_location' in dto) || dto.id_location === undefined || typeof dto.id_location === 'string') &&
    (!('id_route_day' in dto) || dto.id_route_day === undefined || typeof dto.id_route_day === 'string')
  );
}

export function isInventoryOperationDTO(dto: unknown): dto is InventoryOperationDTO {
  return (
    isObjectRecord(dto) &&
    'id_inventory_operation' in dto &&
    'movement_type' in dto &&
    'created_at' in dto &&
    'created_by' in dto &&
    'id_inventory_origin' in dto &&
    'id_inventory_target' in dto &&
    'inventory_operation_descriptions' in dto &&
    Array.isArray(dto.inventory_operation_descriptions) &&
    dto.inventory_operation_descriptions.every((item) => isInventoryOperationDescriptionDTO(item)) &&
    (!('latitude' in dto) || dto.latitude === undefined || dto.latitude === null || typeof dto.latitude === 'string') &&
    (!('longitude' in dto) || dto.longitude === undefined || dto.longitude === null || typeof dto.longitude === 'string') &&
    (!('inventory_operation_reference' in dto) || dto.inventory_operation_reference === undefined || dto.inventory_operation_reference === null || typeof dto.inventory_operation_reference === 'string') &&
    (!('document_reference' in dto) || dto.document_reference === undefined || dto.document_reference === null || typeof dto.document_reference === 'string')
  );
}

export function isWorkDayDTO(dto: unknown): dto is WorkDayInformationDTO {
  return (
    isObjectRecord(dto) &&
    'id_work_day' in dto &&
    'start_date' in dto &&
    'start_petty_cash' in dto &&
    'id_route_day' in dto &&
    'id_user' in dto &&
    'notes' in dto &&
    Array.isArray(dto.notes) &&
    dto.notes.every((item) => isWorkDayNoteDTO(item)) &&
    'finish_date' in dto &&
    'final_petty_cash' in dto &&
    'id_payment_stub' in dto
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
    'route_day' in dto &&
    Array.isArray(dto.route_day) &&
    dto.route_day.every((item) => isRouteDayDTO(item))
  );
}

export function isRouteDayDTO(dto: unknown): dto is RouteDayDTO {
  return (
    isObjectRecord(dto) &&
    'id_route_day' in dto &&
    'id_route' in dto &&
    'id_day' in dto &&
    'locations' in dto
  )
}

export function isRouteDayStoreDTO(dto: unknown): dto is RouteDayLocationDTO {
  return (
    isObjectRecord(dto) &&
    'id_route_day_store' in dto &&
    'position_in_route' in dto &&
    'id_route_day' in dto &&
    'id_location' in dto
  );
}

export function isRouteTransactionDescriptionDTO(dto: unknown): dto is RouteTransactionDescriptionDTO {
  return (
    isObjectRecord(dto) &&
    'id_route_transaction_description' in dto &&
    'price_at_moment' in dto &&
    'cost_at_moment' in dto &&
    'quantity' in dto &&
    'created_at' in dto &&
    'id_transaction_operation_type' in dto &&
    'id_route_transaction' in dto &&
    'id_product' in dto
  );
}

export function isRouteTransactionDTO(dto: unknown): dto is RouteTransactionDTO {
  return (
    isObjectRecord(dto) &&
    'id_route_transaction' in dto &&
    'cfdi' in dto &&
    'state' in dto &&
    'created_by' in dto &&
    'cash_received' in dto &&
    'id_invoice_concept' in dto &&
    'created_at' in dto &&
    'latitude' in dto &&
    'longitude' in dto &&
    'id_work_day' in dto &&
    'id_location' in dto &&
    'id_client' in dto &&
    'payment_method' in dto &&
    isPaymentMethodDTO(dto.payment_method) &&
    'payment_schema' in dto &&
    isPaymentSchemaDTO(dto.payment_schema) &&
    'transaction_description' in dto &&
    Array.isArray(dto.transaction_description) &&
    dto.transaction_description.every((item) => isRouteTransactionDescriptionDTO(item))
  );
}

export function isInventoryOperationDescriptionDTO(dto: unknown): dto is InventoryOperationDescriptionDTO {
  return (
    isObjectRecord(dto) &&
    'id_product_operation_description' in dto &&
    'price_at_moment' in dto &&
    'cost_at_moment' in dto &&
    'quantity' in dto &&
    'created_at' in dto &&
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
    'id_work_day' in dto &&
    'id_route_day' in dto &&
    'id_operation_type' in dto &&
    'created_at' in dto &&
    'id_location' in dto &&
    'id_route_transaction' in dto &&
    'id_inventory_operation' in dto &&
    'latitude' in dto &&
    'longitude' in dto &&
    'id_day_operation_dependent' in dto
  );
}

export function isStoreDTO(dto: unknown): dto is LocationDTO {
  return (
    isObjectRecord(dto) &&
    'id_location' in dto &&
    'street' in dto &&
    'ext_number' in dto &&
    'colony' in dto &&
    'postal_code' in dto &&
    'location_name' in dto &&
    'latitude' in dto &&
    'longitude' in dto &&
    'status_location' in dto &&
    'id_creator' in dto &&
    'id_client' in dto &&
    'id_location_type' in dto &&
    'created_at' in dto &&
    'updated_at' in dto &&
    'notes' in dto &&
    Array.isArray(dto.notes) &&
    dto.notes.every((item) => isLocationNoteDTO(item)) &&
    (!('address_reference' in dto) || dto.address_reference === undefined || dto.address_reference === null || typeof dto.address_reference === 'string')
  );
}

export function isLocationNoteDTO(dto: unknown): dto is LocationNoteDTO {
  return (
    isObjectRecord(dto) &&
    'id_location_note' in dto &&
    'note' in dto &&
    'id_location' in dto &&
    'created_at' in dto
  );
}

export function isPaymentMethodDTO(dto: unknown): dto is PaymentMethodDTO {
  return (
    isObjectRecord(dto) &&
    'id_payment_method' in dto &&
    'payment_method_name' in dto
  );
}

export function isPaymentSchemaDTO(dto: unknown): dto is PaymentSchemaDTO {
  return (
    isObjectRecord(dto) &&
    'id_payment_schema' in dto &&
    'payment_schema_type' in dto
  );
}

export function isWorkDayNoteDTO(dto: unknown): dto is WorkDayNoteDTO {
  return (
    isObjectRecord(dto) &&
    'id_note' in dto &&
    'note' in dto &&
    'id_owner' in dto &&
    'created_at' in dto
  );
}

export function isUserDTO(dto: unknown): dto is UserDTO {
  return (
    isObjectRecord(dto) &&
    'id_vendor' in dto &&
    'cellphone' in dto &&
    'name' in dto &&
    'password' in dto &&
    'status' in dto
  );
}