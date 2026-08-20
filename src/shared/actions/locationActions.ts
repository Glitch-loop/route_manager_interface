'use server'

import { LocationDTO } from "@/shared/dtos/LocationDTO";

import { RawLocationApiResponse } from "@/shared/raw-api-responses/rawLocationApiResponse";

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

import { rawApiResponseToDTOMapper } from "@/shared/mappers/rawApiResponseToDTOMapper";
import { RawLocationTypeApiResponse } from "@/shared/raw-api-responses/rawLocationTypeApiResponse";
import { LocationTypeDTO } from "@/shared/dtos/LocationTypeDTO";
import { LocationDeactivationType } from "@/shared/enums/locationDeactivationTypeEnum";

interface RetrieveLocationsByIdsRequestInterface {
  id_locations: string[];
}

interface CreateLocationRequestInterface {
  id_location?: string;
  street: string;
  ext_number: string;
  colony: string;
  postal_code: string;
  location_name: string;
  latitude: string;
  longitude: string;
  id_creator: string;
  id_client?: string;
  id_location_type: string;
  created_at: Date;
  updated_at: Date;
  address_reference?: string;
}

interface UpdateLocationRequestInterface extends CreateLocationRequestInterface {
  status_location: number;
}

async function fetchRawLocationTypesById(): Promise<Map<string, RawLocationTypeApiResponse>> {
  const locationTypesResponse = await apiClient.get<RawLocationTypeApiResponse[]>('/clients/locations/types');
  const rawLocationTypesById = new Map<string, RawLocationTypeApiResponse>();
  locationTypesResponse.data.forEach((locationType) => rawLocationTypesById.set(locationType.id_location_type, locationType));
  return rawLocationTypesById;
}

export async function insertStores(stores: LocationDTO[]): Promise<void> {
  try {
    for (const store of stores) {
      
      const body: CreateLocationRequestInterface = {
        id_location: undefined,
        street: store.street,
        ext_number: store.ext_number,
        colony: store.colony,
        postal_code: store.postal_code,
        location_name: store.location_name,
        latitude: store.latitude,
        longitude: store.longitude,
        id_creator: '58eb6f1c-29fc-46dd-bf19-caece0950257', // TODO: Change to the user in the current session.
        id_client: store.id_client === '' ? undefined : store.id_client,
        id_location_type: store.location_type.id_location_type,
        created_at: store.created_at,
        updated_at: store.updated_at,
        address_reference: store.address_reference ?? undefined,
      };
      console.log(store)
      await apiClient.post<void, CreateLocationRequestInterface>('/clients/locations', body);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to insert stores: ${message}`);
  }
}

export async function updateStore(store: LocationDTO): Promise<void> {
  try {
    const body: UpdateLocationRequestInterface = {
      id_location: store.id_location,
      street: store.street,
      ext_number: store.ext_number,
      colony: store.colony,
      postal_code: store.postal_code,
      location_name: store.location_name,
      latitude: store.latitude,
      longitude: store.longitude,
      status_location: store.status_location,
      id_creator: store.id_creator,
      id_client: store.id_client || undefined,
      id_location_type: store.location_type.id_location_type,
      created_at: store.created_at,
      updated_at: store.updated_at,
      address_reference: store.address_reference ?? undefined,
    };

    await apiClient.patch<void, UpdateLocationRequestInterface>(`/clients/locations/${store.id_location}`, body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update store: ${message}`);
  }
}

export async function deactivateStores(id_locations: string[], deactivation_type: LocationDeactivationType): Promise<void> {
  try {
    for (const id_location of id_locations) {
      await apiClient.patch<void>(`/clients/locations/${id_location}/deactivate/${deactivation_type}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to deactivate stores: ${message}`);
  }
}

export async function retrieveLocationTypes(): Promise<LocationTypeDTO[]> {
    try {
    const locationTypesResponse = await apiClient.get<RawLocationTypeApiResponse[]>(
      '/clients/locations/types'
    );

    return locationTypesResponse.data.map((locationType) => rawApiResponseToDTOMapper.toDTO(locationType));

  } catch (error: any) {
    throw new Error(`Failed to retrieve stores: ${error.message}`);
  }
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

    const rawLocationTypesById = await fetchRawLocationTypesById();

    return locationsResponse.map((location) => {
      const rawLocationType = rawLocationTypesById.get(location.id_location_type);
      if (!rawLocationType) throw new Error(`Location type ${location.id_location_type} not found`);
      return rawApiResponseToDTOMapper.toDTO(location, rawLocationType);
    });

  } catch (error: any) {
    throw new Error(`Failed to retrieve stores: ${error.message}`);
  }
}

export async function listStores(): Promise<LocationDTO[]> {
  try {
    console.log("List all stores")
    const locationsResponse:RawLocationApiResponse[] = await recursiveListStore(undefined);
    console.log(locationsResponse)

    const rawLocationTypesById = await fetchRawLocationTypesById();

    return locationsResponse.map((location) => {
      const rawLocationType = rawLocationTypesById.get(location.id_location_type);
      if (!rawLocationType) throw new Error(`Location type ${location.id_location_type} not found`);
      return rawApiResponseToDTOMapper.toDTO(location, rawLocationType);
    });
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

export async function recursiveListStore(initialNextItem?: string): Promise<RawLocationApiResponse[]> {
  const allStores: RawLocationApiResponse[] = [];
  let nextItem: string | undefined = initialNextItem;

  try {
    do {
      const query = nextItem ? `&next_item=${nextItem}` : '';
      const urlToRequest = `/clients/locations?status_location=1,-1&limit=200${query}`;
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