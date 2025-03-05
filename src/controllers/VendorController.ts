
import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IRouteDayStores,
    IStore,
    IDayGeneralInformation,
    IDay,
    IRouteDay,
    IRoute,
    IStoreStatusDay,
    IResponse,
    IUser,
} from '@/interfaces/interfaces';

// Utils
//import { determineRouteDayState } from '@/utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '@/interfaces/enumStoreStates';
import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '@/utils/apiResponse';

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function getAllVendors():Promise<IUser[]> {
    const allVendors:IResponse<IUser[]> = await repository.getAllUsers();

    return allVendors.data;
}

export async function getVendorById(id_vendor:string):Promise<IUser> {
    const vendorResponse:IResponse<IUser> = await repository.getUserDataById(id_vendor);

    return vendorResponse.data;
}


export async function getAllUsers() {};

export async function insertUser() {};

export async function updateUser() {}; 

export async function deleteUser() {};

