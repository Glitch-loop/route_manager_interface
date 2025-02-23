import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IDay,
    IDayGeneralInformation,
    IInventoryOperation,
    IInventoryOperationDescription,
    IProduct,
    IProductInventory,
    IResponse,
    IRoute,
} from '@/interfaces/interfaces';

// Utils
import {
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

export async function getAllConceptOfProducts():Promise<IProduct[]> {
    const allConceptOfProductsResponse:IResponse<IProduct[]> = await repository.getAllProducts();

    const allConceptOfProducts:IProduct[] = getDataFromApiResponse(allConceptOfProductsResponse);

    return allConceptOfProducts
}
