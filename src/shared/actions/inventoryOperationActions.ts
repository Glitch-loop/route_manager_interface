'use server'

import { InventoryOperationDTO } from "@/shared/dtos/InventoryOperationDTO";
import { RawInventoryOperationApiResponse } from "@/shared/raw-api-responses/rawInventoryOperationApiResponse";

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

import { rawApiResponseToDTOMapper } from "@/shared/mappers/rawApiResponseToDTOMapper";

interface RetrieveInventoryOperationsByIdsRequestInterface {
	id_inventory_operation: string[];
}

export async function retrieveInventoryOperationsByIds(id_inventory_operation: string[]): Promise<InventoryOperationDTO[]> {
	try {
		const request: RetrieveInventoryOperationsByIdsRequestInterface = {
			id_inventory_operation,
		};

		const inventoryOperationsResponse = await apiClient.post<RawInventoryOperationApiResponse[], RetrieveInventoryOperationsByIdsRequestInterface>(
			'/inventories/operations/ids',
			request
		);

		return inventoryOperationsResponse.map((inventoryOperation) => rawApiResponseToDTOMapper.toDTO(inventoryOperation));
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to retrieve inventory operations: ${message}`);
	}
}


