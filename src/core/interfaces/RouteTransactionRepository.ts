// Entities
import { RouteTransaction } from '@/core/entities/RouteTransaction';

// Object values
import { RouteTransactionDescription } from '@/core/object-values/RouteTransactionDescription';

export abstract class RouteTransactionRepository {
  abstract insertRouteTransaction(route_transaction: RouteTransaction): Promise<void>;
  abstract updateRouteTransaction(route_transaction: RouteTransaction): Promise<void>;
  abstract deleteRouteTransactions(route_transactions: RouteTransaction[]): Promise<void>;
  abstract listRouteTransactionByIdStore(id_store: string[], startDate: Date, endDate: Date): Promise<RouteTransaction[]>;
  abstract listRouteTransactions(startDate: Date, endDate: Date): Promise<RouteTransaction[]>;
  abstract retrieveRouteTransactionById(id_route_transactions: string[]): Promise<RouteTransaction[]>;
  abstract listRouteTransactionDescriptions(): Promise<RouteTransactionDescription[]>;
}