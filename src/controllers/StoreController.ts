// Database
import { IResponse, IStore } from "@/interfaces/interfaces";
import { RepositoryFactory } from "@/repositories/RepositoryFactory";
import { getDataFromApiResponse } from "@/utils/responseUtils";

// Interfaces



//Initializing database repository
const repository = RepositoryFactory.createRepository('supabase');

export async function getInformationOfStores(arrIdStores:string[]):Promise<IStore[]> {
    const informationOfTheStoresResponse:IResponse<IStore[]> = await repository.getStoresByArrID(arrIdStores);

    return getDataFromApiResponse(informationOfTheStoresResponse);

}

