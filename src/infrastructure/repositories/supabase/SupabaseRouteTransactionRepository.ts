// Libraries
import { injectable, inject } from 'tsyringe';

// Infrastructure
import { SupabaseDataSource } from '@/infrastructure/datasources/SupabaseDataSource'; 

// Interfaces
import { RouteTransactionRepository } from '@/core/interfaces/RouteTransactionRepository';

// Entities
import { RouteTransaction } from '@/core/entities/RouteTransaction';

// Object values
import { RouteTransactionDescription } from '@/core/object-values/RouteTransactionDescription';

// Utils
import { TOKENS } from '@/infrastructure/di/tokens';
import { SERVER_DATABASE_ENUM } from '@/infrastructure/persistence/enums/serverTablesEnum';
import { ROUTE_TRANSACTION_STATE } from '@/core/enums/RouteTransactionState';
import { PAYMENT_METHODS } from '@/core/enums/PaymentMethod';
import DAY_OPERATIONS from '@/core/enums/DayOperations';

// Database record types
interface RouteTransactionRecord {
    id_route_transaction: string;
    date: string;
    state: number;
    cash_received: number;
    id_work_day: string;
    id_store: string;
    id_payment_method: string;
}

interface RouteTransactionDescriptionRecord {
    id_route_transaction_description: string;
    price_at_moment: number;
    amount: number;
    created_at: string;
    id_route_transaction: string;
    id_route_transaction_operation_type: string;
    id_product: string;
    comission_at_moment?: number;
}


@injectable()
export class SupabaseRouteTransactionRepository implements RouteTransactionRepository {
    constructor(@inject(TOKENS.SupabaseDataSource) private readonly dataSource: SupabaseDataSource) { }

    private get supabase() {
        return this.dataSource.getClient();
    }

    async insertRouteTransaction(route_transaction: RouteTransaction): Promise<void> {
        try {
            // Insert the main route transaction record
            const transactionRecord = {
                id_route_transaction: route_transaction.id_route_transaction,
                date: route_transaction.date,
                state: route_transaction.state,
                cash_received: route_transaction.cash_received,
                id_work_day: route_transaction.id_work_day,
                id_store: route_transaction.id_store,
                id_payment_method: route_transaction.payment_method,
            };

            const { error: transactionError } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .insert(transactionRecord);

            if (transactionError) throw new Error(`Error inserting route transaction: ${transactionError.message}`);

            // Insert transaction descriptions if any
            if (route_transaction.transaction_description.length > 0) {
                const descriptionRecords = route_transaction.transaction_description.map(desc => ({
                    id_route_transaction_description: desc.id_route_transaction_description,
                    price_at_moment: desc.price_at_moment,
                    amount: desc.amount,
                    created_at: desc.created_at,
                    id_route_transaction: desc.id_route_transaction,
                    id_route_transaction_operation_type: desc.id_transaction_operation_type,
                    id_product: desc.id_product,
                }));

                const { error: descError } = await this.supabase
                    .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTION_DESCRIPTIONS)
                    .insert(descriptionRecords);

                if (descError) throw new Error(`Error inserting route transaction descriptions: ${descError.message}`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to insert route transaction: ${message}`);
        }
    }

    async updateRouteTransaction(route_transaction: RouteTransaction): Promise<void> {
        try {
            const transactionRecord = {
                date: route_transaction.date,
                state: route_transaction.state,
                cash_received: route_transaction.cash_received,
                id_work_day: route_transaction.id_work_day,
                id_store: route_transaction.id_store,
                id_payment_method: route_transaction.payment_method,
            };

            const { error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .update(transactionRecord)
                .eq('id_route_transaction', route_transaction.id_route_transaction);

            if (error) throw new Error(`Error updating route transaction: ${error.message}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update route transaction: ${message}`);
        }
    }

    async deleteRouteTransactions(route_transactions: RouteTransaction[]): Promise<void> {
        try {
            const transactionIds = route_transactions.map(t => t.id_route_transaction);

            // Delete descriptions first (due to foreign key constraint)
            const { error: descError } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTION_DESCRIPTIONS)
                .delete()
                .in('id_route_transaction', transactionIds);

            if (descError) throw new Error(`Error deleting route transaction descriptions: ${descError.message}`);

            // Delete main transactions
            const { error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .delete()
                .in('id_route_transaction', transactionIds);

            if (error) throw new Error(`Error deleting route transactions: ${error.message}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to delete route transactions: ${message}`);
        }
    }

    async listRouteTransactionByIdStore(id_store: string[], startDate: Date, endDate: Date): Promise<RouteTransaction[]> {
        try {
            const { data, error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .select('*')
                .in('id_store', id_store)
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString());

            if (error) throw new Error(`Error listing route transactions by store: ${error.message}`);

            return await this.mapTransactionsWithDescriptions(data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to list route transactions by store: ${message}`);
        }
    }

    async listRouteTransactions(startDate: Date, endDate: Date): Promise<RouteTransaction[]> {
        try {
            const { data, error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .select('*')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString());

            if (error) throw new Error(`Error listing route transactions: ${error.message}`);

            return await this.mapTransactionsWithDescriptions(data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to list route transactions: ${message}`);
        }
    }

    async retrieveRouteTransactionById(id_route_transactions: string[]): Promise<RouteTransaction[]> {
        try {
            const { data, error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTIONS)
                .select('*')
                .in('id_route_transaction', id_route_transactions);

            if (error) throw new Error(`Error retrieving route transactions: ${error.message}`);

            return await this.mapTransactionsWithDescriptions(data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to retrieve route transactions: ${message}`);
        }
    }

    async listRouteTransactionDescriptions(): Promise<RouteTransactionDescription[]> {
        try {
            const { data, error } = await this.supabase
                .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTION_DESCRIPTIONS)
                .select('*');

            if (error) throw new Error(`Error listing route transaction descriptions: ${error.message}`);

            const descriptions: RouteTransactionDescription[] = [];
            for (const desc of data || []) {
                descriptions.push(
                    new RouteTransactionDescription(
                        desc.id_route_transaction_description,
                        desc.price_at_moment,
                        desc.amount,
                        new Date(desc.created_at),
                        '', // id_product_inventory - not in DB schema
                        desc.id_route_transaction_operation_type as DAY_OPERATIONS,
                        desc.id_product,
                        desc.id_route_transaction
                    )
                );
            }
            return descriptions;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to list route transaction descriptions: ${message}`);
        }
    }

    /**
     * Helper method to fetch transactions and their descriptions, then map to entities
     */
    private async mapTransactionsWithDescriptions(transactionsData: RouteTransactionRecord[]): Promise<RouteTransaction[]> {
        if (transactionsData.length === 0) return [];

        const transactionIds = transactionsData.map(t => t.id_route_transaction);

        // Fetch all descriptions for these transactions
        const { data: descriptionsData, error: descError } = await this.supabase
            .from(SERVER_DATABASE_ENUM.ROUTE_TRANSACTION_DESCRIPTIONS)
            .select('*')
            .in('id_route_transaction', transactionIds);

        if (descError) throw new Error(`Error fetching transaction descriptions: ${descError.message}`);

        // Group descriptions by transaction ID
        const descriptionsByTransaction = new Map<string, RouteTransactionDescription[]>();
        for (const desc of (descriptionsData || []) as RouteTransactionDescriptionRecord[]) {
            const description = new RouteTransactionDescription(
                desc.id_route_transaction_description,
                desc.price_at_moment,
                desc.amount,
                new Date(desc.created_at),
                '', // id_product_inventory - not in DB schema
                desc.id_route_transaction_operation_type as DAY_OPERATIONS,
                desc.id_product,
                desc.id_route_transaction
            );

            const existing = descriptionsByTransaction.get(desc.id_route_transaction) || [];
            existing.push(description);
            descriptionsByTransaction.set(desc.id_route_transaction, existing);
        }

        // Map transactions to entities
        const transactions: RouteTransaction[] = [];
        for (const t of transactionsData) {
            const descriptions = descriptionsByTransaction.get(t.id_route_transaction) || [];
            transactions.push(
                new RouteTransaction(
                    t.id_route_transaction,
                    new Date(t.date),
                    t.state as unknown as ROUTE_TRANSACTION_STATE,
                    t.cash_received,
                    t.id_work_day,
                    t.id_store,
                    t.id_payment_method as PAYMENT_METHODS,
                    descriptions
                )
            );
        }

        return transactions;
    }
}