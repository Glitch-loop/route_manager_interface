import { LocationDTO } from "@/shared/dtos/LocationDTO";

import { RawLocationApiResponse } from "@/shared/raw-api-responses/rawLocationApiResponse";

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

import { rawApiResponseToDTOMapper } from "@/shared/mappers/rawApiResponseToDTOMapper";

interface RetrieveLocationsByIdsRequestInterface {
  id_locations: string[];
}

export async function insertStores(stores: LocationDTO[]): Promise<void> {
  // Note (06-20-26): Backend does not expose an update endpoint for locations in this repository.
  return;
}

export async function updateStore(store: LocationDTO): Promise<void> {
  // Note (06-20-26): Backend does not expose an update endpoint for locations in this repository.
  return;
}

export async function retrieveStore(id_stores: string[]): Promise<LocationDTO[]> {
  try {
    const request: RetrieveLocationsByIdsRequestInterface = {
      id_locations: id_stores,
    };

    const locationsResponse = await apiClient.post<RawLocationApiResponse[], RetrieveLocationsByIdsRequestInterface>(
      '/clients/locations/ids',
      request
    );

    return locationsResponse.map((location) => rawApiResponseToDTOMapper.toDTO(location));

  } catch (error: any) {
    throw new Error(`Failed to retrieve stores: ${error.message}`);
  }
}

export async function listStores(): Promise<LocationDTO[]> {
  try {
    console.log("List all stores")
    const locationsResponse:RawLocationApiResponse[] = await recursiveListStore(undefined);
    
      return locationsResponse.map((location) => rawApiResponseToDTOMapper.toDTO(location));
  } catch (error: any) {
    throw new Error(`Failed to list stores: ${error.message}`);
  }
}

export async function  deleteStores(stores: LocationDTO[]): Promise<void> {
  // Note (06-20-26): Backend does not expose a delete endpoint for locations in this repository.
  return;
}

// export async function  upsertStores(stores: StoreServerModel[]): Promise<void> {
//   if (!stores || stores.length === 0) return;

//   try {
//     // Upsert is handled as insert, per the current backend contract.
//     for (const store of stores) {

//       /*
//         Note for the correct request for this endpoint (14-07-26) (PATCH)

//         - To indicate there is not address reference, it has to be set as undefined.
//         - If not possible to indicate to which client a location belongs let the interfaces as null.
      
        
//       */
//       const body: LocationStoreRequestInterface = {
//           id_location: store.id_location,
//           street: store.street,
//           ext_number: store.ext_number === null ? '' : store.ext_number,
//           colony: store.colony,
//           postal_code: store.postal_code,
//           address_reference: store.address_reference === null ? undefined : store.address_reference,
//           location_name: store.location_name === null ? 'Nombre no disponible durnate sincronizacion' :  store.location_name,
//           latitude: store.latitude,
//           longitude: store.longitude,
//           id_creator: store.id_creator,
//           id_client: store.id_client === '' ? undefined : store.id_client,
//           id_location_type: store.id_location_type,
//           created_at: store.created_at,
//           updated_at: store.updated_at,
//         }

//       await this.dataSource.post<unknown, LocationStoreRequestInterface>(
//         '/clients/locations',
//         body
//       );
//     }

//   } catch (error: any) {
//     throw new Error(`Failed to upsert stores: ${error.message}`);
//   }
// }

export async function  recursiveListStore(initialNextItem?: string): Promise<RawLocationApiResponse[]> {
  const allStores: RawLocationApiResponse[] = [];
  let nextItem: string | undefined = initialNextItem;

  try {
    do {
      const query = nextItem ? `&next_item=${nextItem}` : '';
      const urlToRequest = `/clients/locations?status_location=1,-1&limit=200${query}`;

      console.log("urlToSend: ", urlToRequest);
      const response = await apiClient.get<RawLocationApiResponse[]>(urlToRequest);

      if (response.data && response.data.length > 0) {
        allStores.push(...response.data);
      }

      // Update nextItem to continue loop, or set undefined to stop
      nextItem = response.meta?.has_next_page ? response.meta.next_item : undefined;

    } while (nextItem);

    return allStores;
  } catch (error: any) {
    throw new Error(`Failed to list stores: ${error.message}`);
  }
}