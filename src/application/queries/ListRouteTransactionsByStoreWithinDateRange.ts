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
        // 1. Retrieve stores by their IDs
        const stores = await this.storeRepo.retrieveStore(storesId);

        // 2. Create result map
        const resultMap = new Map<string, RouteTransactionDTO[]>();

        // 3. For each store, retrieve route transactions within date range
        for (const store of stores) {
            // Get transactions for this store within the date range
            // (descriptions are already consolidated in the repository method)
            const transactions = await this.routeTransactionRepo.listRouteTransactionByStore(
                store,
                startDate,
                endDate
            );

            // 4. Map route transactions to DTOs
            const transactionDTOs = transactions.map(transaction => 
                this.mapper.toDTO(transaction) as RouteTransactionDTO
            );

            // Add to result map
            resultMap.set(store.id_store, transactionDTOs);
        }

        return resultMap;
    }
}