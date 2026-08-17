'use server'

import { DayOperationDTO } from "@/shared/dtos/DayOperationDTO";

import { RawWorkDayOperationHistoricApiResponse } from "@/shared/raw-api-responses/rawWorkDayOperationHistoricApiResponse";

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

import { rawApiResponseToDTOMapper } from "@/shared/mappers/rawApiResponseToDTOMapper";

interface ListDayOperationsOptions {
  limit?: number;
  nextItem?: string;
  start_date_created_at?: Date | string;
  end_date_created_at?: Date | string;
  id_location?: string[];
  id_route_transaction?: string[];
  id_route_day?: string[];
  operation_type?: string[];
  id_work_day?: string[];
}

export async function listDayOpertions(options?: ListDayOperationsOptions): Promise<DayOperationDTO[]> {
  try {
    const dayOperationsResponse: RawWorkDayOperationHistoricApiResponse[] = await recursiveListDayOperations(options);

    return dayOperationsResponse.map((dayOperation) => rawApiResponseToDTOMapper.toDTO(dayOperation));

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve day operations: ${message}`);
  }
}

function appendListDayOperationsFilters(searchParams: URLSearchParams, options?: ListDayOperationsOptions): void {
  if (!options) {
    return;
  }

  if (options.start_date_created_at) {
    searchParams.set(
      'start_date_created_at',
      options.start_date_created_at instanceof Date ? options.start_date_created_at.toISOString() : options.start_date_created_at,
    );
  }

  if (options.end_date_created_at) {
    searchParams.set(
      'end_date_created_at',
      options.end_date_created_at instanceof Date ? options.end_date_created_at.toISOString() : options.end_date_created_at,
    );
  }

  if (options.id_location && options.id_location.length > 0) {
    searchParams.set('id_location', options.id_location.join(','));
  }

  if (options.id_route_transaction && options.id_route_transaction.length > 0) {
    searchParams.set('id_route_transaction', options.id_route_transaction.join(','));
  }

  if (options.id_route_day && options.id_route_day.length > 0) {
    searchParams.set('id_route_day', options.id_route_day.join(','));
  }

  if (options.operation_type && options.operation_type.length > 0) {
    searchParams.set('operation_type', options.operation_type.join(','));
  }

  if (options.id_work_day && options.id_work_day.length > 0) {
    searchParams.set('id_work_day', options.id_work_day.join(','));
  }
}

export async function recursiveListDayOperations(options?: ListDayOperationsOptions): Promise<RawWorkDayOperationHistoricApiResponse[]> {
  const allDayOperations: RawWorkDayOperationHistoricApiResponse[] = [];
  let nextItem: string | undefined = options?.nextItem;

  try {
    do {
      const searchParams = new URLSearchParams();

      searchParams.set('limit', String(options?.limit ?? 200));
      appendListDayOperationsFilters(searchParams, options);

      if (nextItem) {
        searchParams.set('next_item', nextItem);
      }

      const urlToRequest = `/business-operation-route/work-days/operations?${searchParams.toString()}`;

      const response = await apiClient.get<RawWorkDayOperationHistoricApiResponse[]>(urlToRequest);

      if (response.data && response.data.length > 0) {
        allDayOperations.push(...response.data);
      }

      nextItem = response.meta?.has_next_page ? response.meta.next_item : undefined;

    } while (nextItem);

    return allDayOperations;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list day operations: ${message}`);
  }
}