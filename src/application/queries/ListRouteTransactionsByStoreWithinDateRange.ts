// Libraries
import { inject, injectable } from "tsyringe";

// Interfaces
import { RouteTransactionRepository } from "@/core/interfaces/RouteTransactionRepository";
import { StoreRepository } from "@/core/interfaces/StoreRepository";

// Mapper DTO
import RouteTransactionDTO from "@/application/dto/RouteTransactionDTO";
import { MapperDTO } from "@/application/mappers/MapperDTO";

// Utils
import { TOKENS } from "@/infrastructure/di/tokens";

@injectable()
export default class ListRouteTransactionsByStoreWithinDateRange {
    constructor(
        @inject(TOKENS.SupabaseRouteTransactionRepository) private routeTransactionRepo: RouteTransactionRepository,
        @inject(TOKENS.SupabaseStoreRepository) private storeRepo: StoreRepository,
        private mapper: MapperDTO
    ) { }

    /**
     * Retrieves route transactions for multiple stores within a date range.
     * @param storesId - Array of store IDs to query
     * @param startDate - Start date of the range (inclusive)
     * @param endDate - End date of the range (inclusive)
     * @returns Map where key is store ID and value is array of RouteTransactionDTOs
     */
    async execute(storesId: string[], startDate: Date, endDate: Date): Promise<Map<string, RouteTransactionDTO[]>> {
        // 1. Create result map
        const resultMap = new Map<string, RouteTransactionDTO[]>();
        console.log(storesId)
        // 2. Retrieve route transactions for the given store IDs within the date range
        const transactions = await this.routeTransactionRepo.listRouteTransactionByIdStore(
            storesId,
            startDate,
            endDate
        );

        // 3. Group transactions by store ID
        transactions.forEach(transaction => {
            const storeId = transaction.id_store;
            if (!resultMap.has(storeId)) {
                resultMap.set(storeId, []);
            }
            resultMap.get(storeId)!.push(this.mapper.toDTO(transaction) as RouteTransactionDTO);
        });

        return resultMap;
    }
}