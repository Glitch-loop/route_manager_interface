import { DayOperationDTO } from '@/shared/dtos/DayOperationDTO';
import { InventoryOperationDescriptionDTO } from '@/shared/dtos/InventoryOperationDescriptionDTO';
import { InventoryOperationDTO } from '@/shared/dtos/InventoryOperationDTO';
import { LocationDTO } from '@/shared/dtos/LocationDTO';
import { LocationNoteDTO } from '@/shared/dtos/LocationNoteDTO';
import { LocationTypeDTO } from '@/shared/dtos/LocationTypeDTO';
import { PaymentMethodDTO } from '@/shared/dtos/PaymentMethodDTO';
import { PaymentSchemaDTO } from '@/shared/dtos/PaymentSchemaDTO';
import { ProductDTO } from '@/shared/dtos/ProductDTO';
import { ProductPriceDTO } from '@/shared/dtos/ProductPriceDTO';
import { RouteDayDTO } from '@/shared/dtos/RouteDayDTO';
import { RouteDayLocationDTO } from '@/shared/dtos/RouteDayLocationDTO';
import { RouteDTO } from '@/shared/dtos/RouteDTO';
import { RouteTransactionDescriptionDTO } from '@/shared/dtos/RouteTransactionDescriptionDTO';
import { RouteTransactionDTO } from '@/shared/dtos/RouteTransactionDTO';
import { WorkDayInformationDTO } from '@/shared/dtos/WorkdayInformationDTO';
import { WorkDayNoteDTO } from '@/shared/dtos/WorkDayNoteDTO';
import {
	isDayOperationDTO,
	isInventoryOperationDescriptionDTO,
	isInventoryOperationDTO,
	isLocationNoteDTO,
	isLocationTypeDTO,
	isPaymentMethodDTO,
	isPaymentSchemaDTO,
	isProductDTO,
	isProductPriceDTO,
	isRouteDayDTO,
	isRouteDayStoreDTO,
	isRouteDTO,
	isRouteTransactionDescriptionDTO,
	isRouteTransactionDTO,
	isStoreDTO,
	isWorkDayDTO,
	isWorkDayNoteDTO,
} from '@/shared/guards/dtoGuards';
import {
	isRawInventoryOperationApiResponse,
	isRawInventoryOperationDescriptionApiResponse,
	isRawLocationApiResponse,
	isRawLocationNoteApiResponse,
	isRawLocationTypeApiResponse,
	isRawPaymentMethodApiResponse,
	isRawPaymentSchemaApiResponse,
	isRawProductApiResponse,
	isRawProductPriceApiResponse,
	isRawRouteApiResponse,
	isRawRouteDayApiResponse,
	isRawRouteDayLocationApiResponse,
	isRawTransactionApiResponse,
	isRawTransactionDescriptionApiResponse,
	isRawWorkDayApiResponse,
	isRawWorkDayNoteApiResponse,
	isRawWorkDayOperationHistoricApiResponse,
} from '@/shared/guards/rawApiResponseGuards';
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

export class RawApiResponseToDTOMapper {
	constructor() {}

	// ==================== OVERLOADED FUNCTIONS FOR MAPPING ====================
	toDTO(rawApiResponse: RawInventoryOperationApiResponse): InventoryOperationDTO;
	toDTO(rawApiResponse: RawInventoryOperationDescriptionApiResponse): InventoryOperationDescriptionDTO;
	toDTO(rawApiResponse: RawLocationApiResponse, rawLocationType: RawLocationTypeApiResponse): LocationDTO;
	toDTO(rawApiResponse: RawLocationNoteApiResponse): LocationNoteDTO;
	toDTO(rawApiResponse: RawLocationTypeApiResponse): LocationTypeDTO;
	toDTO(rawApiResponse: RawPaymentMethodApiResponse): PaymentMethodDTO;
	toDTO(rawApiResponse: RawPaymentSchemaApiResponse): PaymentSchemaDTO;
	toDTO(rawApiResponse: RawProductApiResponse): ProductDTO;
	toDTO(rawApiResponse: RawProductPriceApiResponse): ProductPriceDTO;
	toDTO(rawApiResponse: RawRouteApiResponse): RouteDTO;
	toDTO(rawApiResponse: RawRouteDayApiResponse): RouteDayDTO;
	toDTO(rawApiResponse: RawRouteDayLocationApiResponse): RouteDayLocationDTO;
	toDTO(rawApiResponse: RawTransactionApiResponse): RouteTransactionDTO;
	toDTO(rawApiResponse: RawTransactionDescriptionApiResponse): RouteTransactionDescriptionDTO;
	toDTO(rawApiResponse: RawWorkDayApiResponse): WorkDayInformationDTO;
	toDTO(rawApiResponse: RawWorkDayNoteApiResponse): WorkDayNoteDTO;
	toDTO(rawApiResponse: RawWorkDayOperationHistoricApiResponse): DayOperationDTO;
	toDTO(
		rawApiResponse:
			| RawInventoryOperationApiResponse
			| RawInventoryOperationDescriptionApiResponse
			| RawLocationApiResponse
			| RawLocationNoteApiResponse
			| RawLocationTypeApiResponse
			| RawPaymentMethodApiResponse
			| RawPaymentSchemaApiResponse
			| RawProductApiResponse
			| RawProductPriceApiResponse
			| RawRouteApiResponse
			| RawRouteDayApiResponse
			| RawRouteDayLocationApiResponse
			| RawTransactionApiResponse
			| RawTransactionDescriptionApiResponse
			| RawWorkDayApiResponse
			| RawWorkDayNoteApiResponse
			| RawWorkDayOperationHistoricApiResponse,
		rawLocationType?: RawLocationTypeApiResponse
	):
		| InventoryOperationDTO
		| InventoryOperationDescriptionDTO
		| LocationDTO
		| LocationNoteDTO
		| LocationTypeDTO
		| PaymentMethodDTO
		| PaymentSchemaDTO
		| ProductDTO
		| ProductPriceDTO
		| RouteDTO
		| RouteDayDTO
		| RouteDayLocationDTO
		| RouteTransactionDTO
		| RouteTransactionDescriptionDTO
		| WorkDayInformationDTO
		| WorkDayNoteDTO
		| DayOperationDTO {
		if (isRawInventoryOperationApiResponse(rawApiResponse)) {
			return this.rawInventoryOperationApiResponseToInventoryOperationDTO(rawApiResponse);
		}
		if (isRawInventoryOperationDescriptionApiResponse(rawApiResponse)) {
			return this.rawInventoryOperationDescriptionApiResponseToInventoryOperationDescriptionDTO(rawApiResponse);
		}
		if (isRawLocationApiResponse(rawApiResponse)) {
			if (!rawLocationType) throw new Error('rawLocationType is required to map a RawLocationApiResponse');
			return this.rawLocationApiResponseToLocationDTO(rawApiResponse, rawLocationType);
		}
		if (isRawLocationNoteApiResponse(rawApiResponse)) {
			return this.rawLocationNoteApiResponseToLocationNoteDTO(rawApiResponse);
		}
		if (isRawLocationTypeApiResponse(rawApiResponse)) {
			return this.rawLocationTypeApiResponseToLocationTypeDTO(rawApiResponse);
		}
		if (isRawPaymentMethodApiResponse(rawApiResponse)) {
			return this.rawPaymentMethodApiResponseToPaymentMethodDTO(rawApiResponse);
		}
		if (isRawPaymentSchemaApiResponse(rawApiResponse)) {
			return this.rawPaymentSchemaApiResponseToPaymentSchemaDTO(rawApiResponse);
		}
		if (isRawProductApiResponse(rawApiResponse)) {
			return this.rawProductApiResponseToProductDTO(rawApiResponse);
		}
		if (isRawProductPriceApiResponse(rawApiResponse)) {
			return this.rawProductPriceApiResponseToProductPriceDTO(rawApiResponse);
		}
		if (isRawRouteApiResponse(rawApiResponse)) {
			return this.rawRouteApiResponseToRouteDTO(rawApiResponse);
		}
		if (isRawRouteDayApiResponse(rawApiResponse)) {
			return this.rawRouteDayApiResponseToRouteDayDTO(rawApiResponse);
		}
		if (isRawRouteDayLocationApiResponse(rawApiResponse)) {
			return this.rawRouteDayLocationApiResponseToRouteDayLocationDTO(rawApiResponse);
		}
		if (isRawTransactionApiResponse(rawApiResponse)) {
			return this.rawTransactionApiResponseToRouteTransactionDTO(rawApiResponse);
		}
		if (isRawTransactionDescriptionApiResponse(rawApiResponse)) {
			return this.rawTransactionDescriptionApiResponseToRouteTransactionDescriptionDTO(rawApiResponse);
		}
		if (isRawWorkDayApiResponse(rawApiResponse)) {
			return this.rawWorkDayApiResponseToWorkDayInformationDTO(rawApiResponse);
		}
		if (isRawWorkDayNoteApiResponse(rawApiResponse)) {
			return this.rawWorkDayNoteApiResponseToWorkDayNoteDTO(rawApiResponse);
		}
		if (isRawWorkDayOperationHistoricApiResponse(rawApiResponse)) {
			return this.rawWorkDayOperationHistoricApiResponseToDayOperationDTO(rawApiResponse);
		}

		throw new Error('Invalid input for mapping to dto');
	}

	toRawApiResponse(dto: InventoryOperationDTO): RawInventoryOperationApiResponse;
	toRawApiResponse(dto: InventoryOperationDescriptionDTO): RawInventoryOperationDescriptionApiResponse;
	toRawApiResponse(dto: LocationDTO): RawLocationApiResponse;
	toRawApiResponse(dto: LocationNoteDTO): RawLocationNoteApiResponse;
	toRawApiResponse(dto: LocationTypeDTO): RawLocationTypeApiResponse;
	toRawApiResponse(dto: PaymentMethodDTO): RawPaymentMethodApiResponse;
	toRawApiResponse(dto: PaymentSchemaDTO): RawPaymentSchemaApiResponse;
	toRawApiResponse(dto: ProductDTO): RawProductApiResponse;
	toRawApiResponse(dto: ProductPriceDTO): RawProductPriceApiResponse;
	toRawApiResponse(dto: RouteDTO): RawRouteApiResponse;
	toRawApiResponse(dto: RouteDayDTO): RawRouteDayApiResponse;
	toRawApiResponse(dto: RouteDayLocationDTO): RawRouteDayLocationApiResponse;
	toRawApiResponse(dto: RouteTransactionDTO): RawTransactionApiResponse;
	toRawApiResponse(dto: RouteTransactionDescriptionDTO): RawTransactionDescriptionApiResponse;
	toRawApiResponse(dto: WorkDayInformationDTO): RawWorkDayApiResponse;
	toRawApiResponse(dto: WorkDayNoteDTO): RawWorkDayNoteApiResponse;
	toRawApiResponse(dto: DayOperationDTO): RawWorkDayOperationHistoricApiResponse;
	toRawApiResponse(
		dto:
			| InventoryOperationDTO
			| InventoryOperationDescriptionDTO
			| LocationDTO
			| LocationNoteDTO
			| LocationTypeDTO
			| PaymentMethodDTO
			| PaymentSchemaDTO
			| ProductDTO
			| ProductPriceDTO
			| RouteDTO
			| RouteDayDTO
			| RouteDayLocationDTO
			| RouteTransactionDTO
			| RouteTransactionDescriptionDTO
			| WorkDayInformationDTO
			| WorkDayNoteDTO
			| DayOperationDTO
	):
		| RawInventoryOperationApiResponse
		| RawInventoryOperationDescriptionApiResponse
		| RawLocationApiResponse
		| RawLocationNoteApiResponse
		| RawLocationTypeApiResponse
		| RawPaymentMethodApiResponse
		| RawPaymentSchemaApiResponse
		| RawProductApiResponse
		| RawProductPriceApiResponse
		| RawRouteApiResponse
		| RawRouteDayApiResponse
		| RawRouteDayLocationApiResponse
		| RawTransactionApiResponse
		| RawTransactionDescriptionApiResponse
		| RawWorkDayApiResponse
		| RawWorkDayNoteApiResponse
		| RawWorkDayOperationHistoricApiResponse {
		if (isInventoryOperationDTO(dto)) {
			return this.inventoryOperationDTOToRawInventoryOperationApiResponse(dto);
		}
		if (isInventoryOperationDescriptionDTO(dto)) {
			return this.inventoryOperationDescriptionDTOToRawInventoryOperationDescriptionApiResponse(dto);
		}
		if (isStoreDTO(dto)) {
			return this.locationDTOToRawLocationApiResponse(dto);
		}
		if (isLocationNoteDTO(dto)) {
			return this.locationNoteDTOToRawLocationNoteApiResponse(dto);
		}
		if (isLocationTypeDTO(dto)) {
			return this.locationTypeDTOToRawLocationTypeApiResponse(dto);
		}
		if (isPaymentMethodDTO(dto)) {
			return this.paymentMethodDTOToRawPaymentMethodApiResponse(dto);
		}
		if (isPaymentSchemaDTO(dto)) {
			return this.paymentSchemaDTOToRawPaymentSchemaApiResponse(dto);
		}
		if (isProductDTO(dto)) {
			return this.productDTOToRawProductApiResponse(dto);
		}
		if (isProductPriceDTO(dto)) {
			return this.productPriceDTOToRawProductPriceApiResponse(dto);
		}
		if (isRouteDTO(dto)) {
			return this.routeDTOToRawRouteApiResponse(dto);
		}
		if (isRouteDayDTO(dto)) {
			return this.routeDayDTOToRawRouteDayApiResponse(dto);
		}
		if (isRouteDayStoreDTO(dto)) {
			return this.routeDayLocationDTOToRawRouteDayLocationApiResponse(dto);
		}
		if (isRouteTransactionDTO(dto)) {
			return this.routeTransactionDTOToRawTransactionApiResponse(dto);
		}
		if (isRouteTransactionDescriptionDTO(dto)) {
			return this.routeTransactionDescriptionDTOToRawTransactionDescriptionApiResponse(dto);
		}
		if (isWorkDayDTO(dto)) {
			return this.workDayInformationDTOToRawWorkDayApiResponse(dto);
		}
		if (isWorkDayNoteDTO(dto)) {
			return this.workDayNoteDTOToRawWorkDayNoteApiResponse(dto);
		}
		if (isDayOperationDTO(dto)) {
			return this.dayOperationDTOToRawWorkDayOperationHistoricApiResponse(dto);
		}

		throw new Error('Invalid input for mapping to raw api response');
	}

	// ==================== MAPPER METHODS RAW API RESPONSE to DTO ====================
	private rawInventoryOperationApiResponseToInventoryOperationDTO(rawApiResponse: RawInventoryOperationApiResponse): InventoryOperationDTO {
		return {
			id_inventory_operation: rawApiResponse.id_inventory_operation,
			movement_type: rawApiResponse.movement_type,
			created_at: rawApiResponse.created_at,
			created_by: rawApiResponse.created_by,
			id_inventory_origin: rawApiResponse.id_inventory_origin,
			id_inventory_target: rawApiResponse.id_inventory_target,
			inventory_operation_descriptions: rawApiResponse.inventory_operation_descriptions.map((item) =>
				this.rawInventoryOperationDescriptionApiResponseToInventoryOperationDescriptionDTO(item)
			),
			latitude: rawApiResponse.latitude,
			longitude: rawApiResponse.longitude,
			inventory_operation_reference: rawApiResponse.inventory_operation_reference,
			document_reference: rawApiResponse.document_reference,
		};
	}

	private rawInventoryOperationDescriptionApiResponseToInventoryOperationDescriptionDTO(rawApiResponse: RawInventoryOperationDescriptionApiResponse): InventoryOperationDescriptionDTO {
		return {
			id_product_operation_description: rawApiResponse.id_inventory_operation_description,
			price_at_moment: rawApiResponse.price_at_moment,
			amount: rawApiResponse.quantity,
			cost_at_moment: rawApiResponse.cost_at_moment,
			quantity: rawApiResponse.quantity,
			created_at: rawApiResponse.created_at,
			id_inventory_operation: rawApiResponse.id_inventory_operation,
			id_product: rawApiResponse.id_product,
		};
	}

	private rawLocationApiResponseToLocationDTO(rawApiResponse: RawLocationApiResponse, rawLocationType: RawLocationTypeApiResponse): LocationDTO {
		return {
			id_location: rawApiResponse.id_location,
			street: rawApiResponse.street,
			ext_number: rawApiResponse.ext_number,
			colony: rawApiResponse.colony,
			postal_code: rawApiResponse.postal_code,
			location_name: rawApiResponse.location_name,
			latitude: rawApiResponse.latitude,
			longitude: rawApiResponse.longitude,
			status_location: rawApiResponse.status_location,
			id_creator: rawApiResponse.id_creator,
			id_client: rawApiResponse.id_client,
			location_type: this.rawLocationTypeApiResponseToLocationTypeDTO(rawLocationType),
			created_at: rawApiResponse.created_at,
			updated_at: rawApiResponse.updated_at,
			notes: rawApiResponse.notes.map((item) => this.rawLocationNoteApiResponseToLocationNoteDTO(item)),
			address_reference: rawApiResponse.address_reference,
		};
	}

	private rawLocationNoteApiResponseToLocationNoteDTO(rawApiResponse: RawLocationNoteApiResponse): LocationNoteDTO {
		return {
			id_location_note: rawApiResponse.id_location_note,
			note: rawApiResponse.note,
			id_location: rawApiResponse.id_location,
			created_at: rawApiResponse.created_at,
		};
	}

	private rawLocationTypeApiResponseToLocationTypeDTO(rawApiResponse: RawLocationTypeApiResponse): LocationTypeDTO {
		return {
			id_location_type: rawApiResponse.id_location_type,
			location_type_name: rawApiResponse.location_type_name,
			created_at: rawApiResponse.created_at,
		};
	}

	private rawPaymentMethodApiResponseToPaymentMethodDTO(rawApiResponse: RawPaymentMethodApiResponse): PaymentMethodDTO {
		return {
			id_payment_method: rawApiResponse.id_payment_method,
			payment_method_name: rawApiResponse.payment_method_name,
		};
	}

	private rawPaymentSchemaApiResponseToPaymentSchemaDTO(rawApiResponse: RawPaymentSchemaApiResponse): PaymentSchemaDTO {
		return {
			id_payment_schema: rawApiResponse.id_payment_schema,
			payment_schema_type: rawApiResponse.payment_schema_type,
		};
	}

	private rawProductApiResponseToProductDTO(rawApiResponse: RawProductApiResponse): ProductDTO {
		return {
			id_product: rawApiResponse.id_product,
			product_name: rawApiResponse.product_name,
			cost: rawApiResponse.cost,
			product_status: rawApiResponse.product_status,
			quantity_presentation: rawApiResponse.quantity_presentation,
			order_to_show: rawApiResponse.order_to_show,
			id_measurement_unit: rawApiResponse.id_measurement_unit,
			product_price: rawApiResponse.product_price.map((item) => this.rawProductPriceApiResponseToProductPriceDTO(item)),
			barcode: rawApiResponse.barcode,
		};
	}

	private rawProductPriceApiResponseToProductPriceDTO(rawApiResponse: RawProductPriceApiResponse): ProductPriceDTO {
		return {
			id_product_price: rawApiResponse.id_product_price,
			price: rawApiResponse.price,
			created_at: rawApiResponse.created_at,
			id_client: rawApiResponse.id_client,
			id_location: rawApiResponse.id_location,
			id_route_day: rawApiResponse.id_route_day,
		};
	}

	private rawRouteApiResponseToRouteDTO(rawApiResponse: RawRouteApiResponse): RouteDTO {
		return {
			id_route: rawApiResponse.id_route,
			route_name: rawApiResponse.route_name,
			description: rawApiResponse.description || '',
			route_status: true,
			id_vendor: '',
			route_day: [],
		};
	}

	private rawRouteDayApiResponseToRouteDayDTO(rawApiResponse: RawRouteDayApiResponse): RouteDayDTO {
		return {
			id_route_day: rawApiResponse.id_route_day,
			id_route: rawApiResponse.id_route,
			id_day: rawApiResponse.id_day,
			locations: rawApiResponse.locations.map((item) => this.rawRouteDayLocationApiResponseToRouteDayLocationDTO(item)),
		};
	}

	private rawRouteDayLocationApiResponseToRouteDayLocationDTO(rawApiResponse: RawRouteDayLocationApiResponse): RouteDayLocationDTO {
		return {
			id_route_day_store: rawApiResponse.id_route_day_location,
			position_in_route: rawApiResponse.position_in_route,
			id_route_day: rawApiResponse.id_route_day,
			id_location: rawApiResponse.id_location,
		};
	}

	private rawTransactionApiResponseToRouteTransactionDTO(rawApiResponse: RawTransactionApiResponse): RouteTransactionDTO {
		return {
			id_route_transaction: rawApiResponse.id_transaction,
			cfdi: rawApiResponse.cfdi,
			state: rawApiResponse.state as RouteTransactionDTO['state'],
			created_by: rawApiResponse.created_by,
			cash_received: rawApiResponse.received_amount,
			id_invoice_concept: rawApiResponse.id_invoice_concept,
			created_at: rawApiResponse.created_at,
			latitude: rawApiResponse.latitude,
			longitude: rawApiResponse.longitude,
			id_work_day: rawApiResponse.id_work_day,
			id_location: rawApiResponse.id_location || '',
			id_client: rawApiResponse.id_client,
			payment_method: this.rawPaymentMethodApiResponseToPaymentMethodDTO(rawApiResponse.payment_method),
			payment_schema: this.rawPaymentSchemaApiResponseToPaymentSchemaDTO(rawApiResponse.payment_schema),
			transaction_description: rawApiResponse.transaction_descriptions.map((item) =>
				this.rawTransactionDescriptionApiResponseToRouteTransactionDescriptionDTO(item)
			),
		};
	}

	private rawTransactionDescriptionApiResponseToRouteTransactionDescriptionDTO(rawApiResponse: RawTransactionDescriptionApiResponse): RouteTransactionDescriptionDTO {
		return {
			id_route_transaction_description: rawApiResponse.id_transaction_description,
			price_at_moment: rawApiResponse.price_at_moment,
			cost_at_moment: rawApiResponse.cost_at_moment,
			quantity: rawApiResponse.quantity,
			created_at: rawApiResponse.created_at,
			id_transaction_operation_type: rawApiResponse.id_transaction_operation_type as RouteTransactionDescriptionDTO['id_transaction_operation_type'],
			id_route_transaction: rawApiResponse.id_transaction,
			id_product: rawApiResponse.id_product,
		};
	}

	private rawWorkDayApiResponseToWorkDayInformationDTO(rawApiResponse: RawWorkDayApiResponse): WorkDayInformationDTO {
		return {
			id_work_day: rawApiResponse.id_work_day,
			start_date: rawApiResponse.start_date,
			start_petty_cash: rawApiResponse.start_petty_cash,
			id_route_day: rawApiResponse.id_route_day,
			id_user: rawApiResponse.id_user,
			notes: rawApiResponse.notes.map((item) => this.rawWorkDayNoteApiResponseToWorkDayNoteDTO(item)),
			finish_date: rawApiResponse.finish_date,
			final_petty_cash: rawApiResponse.final_petty_cash,
			id_payment_stub: rawApiResponse.id_payment_stub,
		};
	}

	private rawWorkDayNoteApiResponseToWorkDayNoteDTO(rawApiResponse: RawWorkDayNoteApiResponse): WorkDayNoteDTO {
		return {
			id_note: rawApiResponse.id_note,
			note: rawApiResponse.note,
			id_owner: rawApiResponse.id_owner,
			created_at: rawApiResponse.created_at,
		};
	}

	private rawWorkDayOperationHistoricApiResponseToDayOperationDTO(rawApiResponse: RawWorkDayOperationHistoricApiResponse): DayOperationDTO {
		return {
			id_day_operation: rawApiResponse.id_work_day_operation,
			id_work_day: rawApiResponse.id_work_day,
			id_route_day: rawApiResponse.id_route_day,
			id_operation_type: rawApiResponse.id_operation_type as DayOperationDTO['id_operation_type'],
			created_at: rawApiResponse.created_at,
			id_location: rawApiResponse.id_location,
			id_route_transaction: rawApiResponse.id_route_transaction,
			id_inventory_operation: rawApiResponse.id_inventory_operation,
			latitude: rawApiResponse.latitude,
			longitude: rawApiResponse.longitude,
			id_day_operation_dependent: rawApiResponse.id_day_operation_dependent,
		};
	}

	// ==================== MAPPER METHODS DTO to RAW API RESPONSE ====================
	private inventoryOperationDTOToRawInventoryOperationApiResponse(dto: InventoryOperationDTO): RawInventoryOperationApiResponse {
		return {
			id_inventory_operation: dto.id_inventory_operation,
			movement_type: dto.movement_type,
			created_at: dto.created_at,
			created_by: dto.created_by,
			id_inventory_origin: dto.id_inventory_origin,
			id_inventory_target: dto.id_inventory_target,
			inventory_operation_descriptions: dto.inventory_operation_descriptions.map((item) =>
				this.inventoryOperationDescriptionDTOToRawInventoryOperationDescriptionApiResponse(item)
			),
			latitude: dto.latitude,
			longitude: dto.longitude,
			inventory_operation_reference: dto.inventory_operation_reference,
			document_reference: dto.document_reference,
		};
	}

	private inventoryOperationDescriptionDTOToRawInventoryOperationDescriptionApiResponse(dto: InventoryOperationDescriptionDTO): RawInventoryOperationDescriptionApiResponse {
		return {
			id_inventory_operation_description: dto.id_product_operation_description,
			price_at_moment: dto.price_at_moment,
			cost_at_moment: dto.cost_at_moment,
			quantity: dto.quantity,
			created_at: dto.created_at,
			id_inventory_operation: dto.id_inventory_operation,
			id_product: dto.id_product,
		};
	}

	private locationDTOToRawLocationApiResponse(dto: LocationDTO): RawLocationApiResponse {
		return {
			id_location: dto.id_location,
			street: dto.street,
			ext_number: dto.ext_number,
			colony: dto.colony,
			postal_code: dto.postal_code,
			location_name: dto.location_name,
			latitude: dto.latitude,
			longitude: dto.longitude,
			status_location: dto.status_location,
			id_creator: dto.id_creator,
			id_client: dto.id_client,
			id_location_type: dto.location_type.id_location_type,
			created_at: dto.created_at,
			updated_at: dto.updated_at,
			notes: dto.notes.map((item) => this.locationNoteDTOToRawLocationNoteApiResponse(item)),
			address_reference: dto.address_reference,
		};
	}

	private locationNoteDTOToRawLocationNoteApiResponse(dto: LocationNoteDTO): RawLocationNoteApiResponse {
		return {
			id_location_note: dto.id_location_note,
			note: dto.note,
			id_location: dto.id_location,
			created_at: dto.created_at,
		};
	}

	private locationTypeDTOToRawLocationTypeApiResponse(dto: LocationTypeDTO): RawLocationTypeApiResponse {
		return {
			id_location_type: dto.id_location_type,
			location_type_name: dto.location_type_name,
			created_at: dto.created_at,
		};
	}

	private paymentMethodDTOToRawPaymentMethodApiResponse(dto: PaymentMethodDTO): RawPaymentMethodApiResponse {
		return {
			id_payment_method: dto.id_payment_method,
			payment_method_name: dto.payment_method_name,
		};
	}

	private paymentSchemaDTOToRawPaymentSchemaApiResponse(dto: PaymentSchemaDTO): RawPaymentSchemaApiResponse {
		return {
			id_payment_schema: dto.id_payment_schema,
			payment_schema_type: dto.payment_schema_type,
		};
	}

	private productDTOToRawProductApiResponse(dto: ProductDTO): RawProductApiResponse {
		return {
			id_product: dto.id_product,
			product_name: dto.product_name,
			cost: dto.cost,
			product_status: dto.product_status,
			quantity_presentation: dto.quantity_presentation,
			order_to_show: dto.order_to_show,
			id_measurement_unit: dto.id_measurement_unit,
			product_price: dto.product_price.map((item) => this.productPriceDTOToRawProductPriceApiResponse(item)),
			barcode: dto.barcode,
		};
	}

	private productPriceDTOToRawProductPriceApiResponse(dto: ProductPriceDTO): RawProductPriceApiResponse {
		return {
			id_product_price: dto.id_product_price,
			price: dto.price,
			created_at: dto.created_at,
			id_client: dto.id_client,
			id_location: dto.id_location,
			id_route_day: dto.id_route_day,
		};
	}

	private routeDTOToRawRouteApiResponse(dto: RouteDTO): RawRouteApiResponse {
		return {
			id_route: dto.id_route,
			route_name: dto.route_name,
			description: dto.description,
		};
	}

	private routeDayDTOToRawRouteDayApiResponse(dto: RouteDayDTO): RawRouteDayApiResponse {
		return {
			id_route_day: dto.id_route_day,
			id_route: dto.id_route,
			id_day: dto.id_day,
			locations: dto.locations.map((item) => this.routeDayLocationDTOToRawRouteDayLocationApiResponse(item)),
		};
	}

	private routeDayLocationDTOToRawRouteDayLocationApiResponse(dto: RouteDayLocationDTO): RawRouteDayLocationApiResponse {
		return {
			id_route_day_location: dto.id_route_day_store,
			position_in_route: dto.position_in_route,
			id_route_day: dto.id_route_day,
			id_location: dto.id_location,
		};
	}

	private routeTransactionDTOToRawTransactionApiResponse(dto: RouteTransactionDTO): RawTransactionApiResponse {
		return {
			id_transaction: dto.id_route_transaction,
			cfdi: dto.cfdi,
			state: dto.state,
			created_by: dto.created_by,
			received_amount: dto.cash_received,
			id_invoice_concept: dto.id_invoice_concept,
			created_at: dto.created_at,
			latitude: dto.latitude,
			longitude: dto.longitude,
			id_location: dto.id_location,
			id_client: dto.id_client,
			id_work_day: dto.id_work_day,
			payment_method: this.paymentMethodDTOToRawPaymentMethodApiResponse(dto.payment_method),
			payment_schema: this.paymentSchemaDTOToRawPaymentSchemaApiResponse(dto.payment_schema),
			transaction_descriptions: dto.transaction_description.map((item) =>
				this.routeTransactionDescriptionDTOToRawTransactionDescriptionApiResponse(item)
			),
		};
	}

	private routeTransactionDescriptionDTOToRawTransactionDescriptionApiResponse(dto: RouteTransactionDescriptionDTO): RawTransactionDescriptionApiResponse {
		return {
			id_transaction_description: dto.id_route_transaction_description,
			price_at_moment: dto.price_at_moment,
			cost_at_moment: dto.cost_at_moment,
			quantity: dto.quantity,
			created_at: dto.created_at,
			id_transaction: dto.id_route_transaction,
			id_transaction_operation_type: dto.id_transaction_operation_type,
			id_product: dto.id_product,
		};
	}

	private workDayInformationDTOToRawWorkDayApiResponse(dto: WorkDayInformationDTO): RawWorkDayApiResponse {
		return {
			id_work_day: dto.id_work_day,
			start_date: dto.start_date,
			start_petty_cash: dto.start_petty_cash,
			id_route_day: dto.id_route_day,
			id_user: dto.id_user,
			notes: dto.notes.map((item) => this.workDayNoteDTOToRawWorkDayNoteApiResponse(item)),
			finish_date: dto.finish_date,
			final_petty_cash: dto.final_petty_cash,
			id_payment_stub: dto.id_payment_stub,
		};
	}

	private workDayNoteDTOToRawWorkDayNoteApiResponse(dto: WorkDayNoteDTO): RawWorkDayNoteApiResponse {
		return {
			id_note: dto.id_note,
			note: dto.note,
			id_owner: dto.id_owner,
			created_at: dto.created_at,
		};
	}

	private dayOperationDTOToRawWorkDayOperationHistoricApiResponse(dto: DayOperationDTO): RawWorkDayOperationHistoricApiResponse {
		return {
			id_work_day_operation: dto.id_day_operation,
			id_work_day: dto.id_work_day,
			id_route_day: dto.id_route_day,
			id_operation_type: dto.id_operation_type,
			created_at: dto.created_at,
			id_location: dto.id_location,
			id_route_transaction: dto.id_route_transaction,
			id_inventory_operation: dto.id_inventory_operation,
			latitude: dto.latitude,
			longitude: dto.longitude,
			id_day_operation_dependent: dto.id_day_operation_dependent,
		};
	}
}

export const rawApiResponseToDTOMapper:RawApiResponseToDTOMapper = new RawApiResponseToDTOMapper();
