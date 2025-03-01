import { IRouteDayStores, IStore } from "@/interfaces/interfaces";


export function getAddressOfStore(store:IStore):string {
    const { street, ext_number, colony, } = store;
    return street + ' #' + ext_number + ', ' + colony;
}