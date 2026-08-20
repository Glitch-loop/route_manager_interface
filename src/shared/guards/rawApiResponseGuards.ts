import { RawClientApiResponse } from '@/shared/raw-api-responses/rawClientApiResponse';
import { RawInventoryOperationApiResponse } from '@/shared/raw-api-responses/rawInventoryOperationApiResponse';
import { RawInventoryOperationDescriptionApiResponse } from '@/shared/raw-api-responses/rawInventoryOperationDescriptionApiResponse';
import { RawLocationApiResponse } from '@/shared/raw-api-responses/rawLocationApiResponse';
import { RawLocationNoteApiResponse } from '@/shared/raw-api-responses/rawLocationNoteApiResponse';
import { RawLocationTypeApiResponse } from '@/shared/raw-api-responses/rawLocationTypeApiResponse';
import { RawPaymentMethodApiResponse } from '@/shared/raw-api-responses/rawPaymentMethodApiResponse';
import { RawPaymentSchemaApiResponse } from '@/shared/raw-api-responses/rawPaymentSchemaApiResponse';
import { RawProductApiResponse } from '@/shared/raw-api-responses/rawProductApiResponse';
import { RawProductPriceApiResponse } from '@/shared/raw-api-responses/rawProductPriceApiResponse';
import { RawRouteApiResponse } from '@/shared/raw-api-responses/rawRouteApiResponse';
import { RawRouteDayApiResponse } from '@/shared/raw-api-responses/rawRouteDayApiResponse';
import { RawRouteDayLocationApiResponse } from '@/shared/raw-api-responses/rawRouteDayLocationApiResponse';
import { RawTransactionApiResponse } from '@/shared/raw-api-responses/rawTransactionApiResponse';
import { RawTransactionDescriptionApiResponse } from '@/shared/raw-api-responses/rawTransactionDescriptionApiResponse';
import { RawWorkDayApiResponse } from '@/shared/raw-api-responses/rawWorkDayApiResponse';
import { RawWorkDayNoteApiResponse } from '@/shared/raw-api-responses/rawWorkDayNoteApiResponse';
import { RawWorkDayOperationHistoricApiResponse } from '@/shared/raw-api-responses/rawWorkDayOperationHistoricApiResponse';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && value !== undefined && typeof value === 'object';
}

export function isRawClientApiResponse(dto: unknown): dto is RawClientApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_client' in dto &&
		'legal_name' in dto &&
		'postal_code' in dto &&
		'fiscal_regime' in dto &&
		'name' in dto &&
		'cellphone' in dto &&
		'email' in dto &&
		'created_at' in dto &&
		'updated_at' in dto
	);
}

export function isRawInventoryOperationDescriptionApiResponse(dto: unknown): dto is RawInventoryOperationDescriptionApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_inventory_operation_description' in dto &&
		'price_at_moment' in dto &&
		'cost_at_moment' in dto &&
		'quantity' in dto &&
		'created_at' in dto &&
		'id_inventory_operation' in dto &&
		'id_product' in dto
	);
}

export function isRawInventoryOperationApiResponse(dto: unknown): dto is RawInventoryOperationApiResponse {
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
		dto.inventory_operation_descriptions.every((item) => isRawInventoryOperationDescriptionApiResponse(item)) &&
		(!('latitude' in dto) || dto.latitude === undefined || dto.latitude === null || typeof dto.latitude === 'string') &&
		(!('longitude' in dto) || dto.longitude === undefined || dto.longitude === null || typeof dto.longitude === 'string') &&
		(!('inventory_operation_reference' in dto) || dto.inventory_operation_reference === undefined || dto.inventory_operation_reference === null || typeof dto.inventory_operation_reference === 'string') &&
		(!('document_reference' in dto) || dto.document_reference === undefined || dto.document_reference === null || typeof dto.document_reference === 'string')
	);
}

export function isRawLocationNoteApiResponse(dto: unknown): dto is RawLocationNoteApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_location_note' in dto &&
		'note' in dto &&
		'id_location' in dto &&
		'created_at' in dto
	);
}

export function isRawLocationTypeApiResponse(dto: unknown): dto is RawLocationTypeApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_location_type' in dto &&
		'location_type_name' in dto &&
		'created_at' in dto
	);
}

export function isRawLocationApiResponse(dto: unknown): dto is RawLocationApiResponse {
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
		dto.notes.every((item) => isRawLocationNoteApiResponse(item)) &&
		(!('address_reference' in dto) || dto.address_reference === undefined || dto.address_reference === null || typeof dto.address_reference === 'string')
	);
}

export function isRawPaymentMethodApiResponse(dto: unknown): dto is RawPaymentMethodApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_payment_method' in dto &&
		'payment_method_name' in dto
	);
}

export function isRawPaymentSchemaApiResponse(dto: unknown): dto is RawPaymentSchemaApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_payment_schema' in dto &&
		'payment_schema_type' in dto
	);
}

export function isRawProductApiResponse(dto: unknown): dto is RawProductApiResponse {
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
		dto.product_price.every((item) => isRawProductPriceApiResponse(item)) &&
		(!('barcode' in dto) || dto.barcode === undefined || typeof dto.barcode === 'string')
	);
}

export function isRawProductPriceApiResponse(dto: unknown): dto is RawProductPriceApiResponse {
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

export function isRawRouteApiResponse(dto: unknown): dto is RawRouteApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_route' in dto &&
		'route_name' in dto &&
		(!('description' in dto) || dto.description === undefined || typeof dto.description === 'string')
	);
}

export function isRawRouteDayLocationApiResponse(dto: unknown): dto is RawRouteDayLocationApiResponse {
	return (
		isObjectRecord(dto) &&
		'position_in_route' in dto &&
		'id_location' in dto &&
		'id_route_day' in dto &&
		'id_route_day_location' in dto
	);
}

export function isRawRouteDayApiResponse(dto: unknown): dto is RawRouteDayApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_route_day' in dto &&
		'id_route' in dto &&
		'id_day' in dto &&
		'locations' in dto &&
		Array.isArray(dto.locations) &&
		dto.locations.every((item) => isRawRouteDayLocationApiResponse(item))
	);
}

export function isRawTransactionDescriptionApiResponse(dto: unknown): dto is RawTransactionDescriptionApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_transaction_description' in dto &&
		'price_at_moment' in dto &&
		'cost_at_moment' in dto &&
		'quantity' in dto &&
		'created_at' in dto &&
		'id_transaction' in dto &&
		'id_transaction_operation_type' in dto &&
		'id_product' in dto
	);
}

export function isRawTransactionApiResponse(dto: unknown): dto is RawTransactionApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_transaction' in dto &&
		'cfdi' in dto &&
		'state' in dto &&
		'created_by' in dto &&
		'received_amount' in dto &&
		'id_invoice_concept' in dto &&
		'created_at' in dto &&
		'latitude' in dto &&
		'longitude' in dto &&
		'id_location' in dto &&
		'id_client' in dto &&
		'id_work_day' in dto &&
		'payment_method' in dto &&
		isRawPaymentMethodApiResponse(dto.payment_method) &&
		'payment_schema' in dto &&
		isRawPaymentSchemaApiResponse(dto.payment_schema) &&
		'transaction_descriptions' in dto &&
		Array.isArray(dto.transaction_descriptions) &&
		dto.transaction_descriptions.every((item) => isRawTransactionDescriptionApiResponse(item))
	);
}

export function isRawWorkDayNoteApiResponse(dto: unknown): dto is RawWorkDayNoteApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_note' in dto &&
		'note' in dto &&
		'id_owner' in dto &&
		'created_at' in dto
	);
}

export function isRawWorkDayOperationHistoricApiResponse(dto: unknown): dto is RawWorkDayOperationHistoricApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_work_day_operation' in dto &&
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

export function isRawWorkDayApiResponse(dto: unknown): dto is RawWorkDayApiResponse {
	return (
		isObjectRecord(dto) &&
		'id_work_day' in dto &&
		'start_date' in dto &&
		'start_petty_cash' in dto &&
		'id_route_day' in dto &&
		'id_user' in dto &&
		'notes' in dto &&
		Array.isArray(dto.notes) &&
		dto.notes.every((item) => isRawWorkDayNoteApiResponse(item)) &&
		'finish_date' in dto &&
		'final_petty_cash' in dto &&
		'id_payment_stub' in dto
	);
}
