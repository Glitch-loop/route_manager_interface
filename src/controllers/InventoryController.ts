import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
    IResponse,
    IRoute,
    IRouteTransaction,
} from '@/interfaces/interfaces';

// Utils

import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '@/utils/responseUtils';

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');


export async function getInventoryOperationsOfWorkDay(workday:IRoute&IDayGeneralInformation&IDay):Promise<IInventoryOperation[]> {
    const allInventoryOperationResponse:IResponse<IInventoryOperation[]> = await repository.getAllInventoryOperationsOfWorkDay(workday);

    const allInventoryOperation = getDataFromApiResponse(allInventoryOperationResponse);

    return allInventoryOperation;
}

export async function getInventoryOperationDescriptionsOfWorkDay(inventoryOperations:IInventoryOperation[]):Promise<IInventoryOperationDescription[]> {
    const allInventoryOperationDescriptionsResponse:IResponse<IInventoryOperationDescription[]> = await repository.getAllInventoryOperationDescriptionsOfWorkDay(inventoryOperations);

    const allInventoryOperationDescriptions = getDataFromApiResponse(allInventoryOperationDescriptionsResponse);

    return allInventoryOperationDescriptions;
}