import ProductDTO from '@/shared/dtos/ProductDTO';
import { isProductDTO } from '@/shared/guards/dtoGuards';
import { isRawProductApiResponse } from '@/shared/guards/rawApiResponseGuards';
import { RawProductApiResponse } from '@/shared/raw-api-responses/rawProductApiResponse';

export class RawApiResponseToDTOMapper {
	constructor() {}

	// ==================== OVERLOADED FUNCTIONS FOR MAPPING ====================
	toDTO(rawApiResponse: RawProductApiResponse): ProductDTO;
	toDTO(rawApiResponse: RawProductApiResponse): ProductDTO {
		if (isRawProductApiResponse(rawApiResponse)) {
			return this.rawProductApiResponseToProductDTO(rawApiResponse);
		}

		throw new Error('Invalid input for mapping to dto');
	}

	toRawApiResponse(dto: ProductDTO): RawProductApiResponse;
	toRawApiResponse(dto: ProductDTO): RawProductApiResponse {
		if (isProductDTO(dto)) {
			return this.productDTOToRawProductApiResponse(dto);
		}

		throw new Error('Invalid input for mapping to raw api response');
	}

	// ==================== MAPPER METHODS RAW API RESPONSE to DTO ====================
	private rawProductApiResponseToProductDTO(rawApiResponse: RawProductApiResponse): ProductDTO {
		return {
			id_product: rawApiResponse.id_product,
			product_name: rawApiResponse.product_name,
			barcode: rawApiResponse.barcode,
			weight: rawApiResponse.weight,
			unit: rawApiResponse.unit,
			comission: rawApiResponse.comission,
			price: rawApiResponse.price,
			product_status: rawApiResponse.product_status,
			order_to_show: rawApiResponse.order_to_show,
		};
	}

	// ==================== MAPPER METHODS DTO to RAW API RESPONSE ====================
	private productDTOToRawProductApiResponse(dto: ProductDTO): RawProductApiResponse {
		return {
			id_product: dto.id_product,
			product_name: dto.product_name,
			barcode: dto.barcode,
			weight: dto.weight,
			unit: dto.unit,
			comission: dto.comission,
			price: dto.price,
			product_status: dto.product_status,
			order_to_show: dto.order_to_show,
		};
	}
}
