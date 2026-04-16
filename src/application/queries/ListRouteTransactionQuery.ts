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
export default class ListRouteTransactionsQuery {
    constructor(
        @inject(TOKENS.SupabaseRouteTransactionRepository) private routeTransactionRepo: RouteTransactionRepository,
        private mapper: MapperDTO
    ) { }

    /**
     * Retrieves route transactions for multiple stores within a date range.
     * @param startDate - Start date of the range (inclusive)
     * @param endDate - End date of the range (inclusive)
     * @returns Array of RouteTransactionDTOs
     */
    async execute(startDate: Date, endDate: Date): Promise<RouteTransactionDTO[]> {
        // 1. Retrieve route transactions for the given store IDs within the date range
        const transactions = await this.routeTransactionRepo.listRouteTransactions(
            startDate,
            endDate
        );

        console.log(transactions)
        return transactions.map(transaction => this.mapper.toDTO(transaction));
    }
}