// Library
import { inject, injectable } from 'tsyringe';

// Interfaces
import { StoreRepository } from '@/core/interfaces/StoreRepository';

// Entities
import { Store } from '@/core/entities/Store';

// DI Tokens
import { TOKENS } from '@/infrastructure/di/tokens';
import StoreAggregate from '@/core/aggregates/StoreAggregate';

@injectable()
export default class ActivateStoreCommand {
	constructor(@inject(TOKENS.SupabaseStoreRepository) private readonly storeRepository: StoreRepository) {}

	async execute(idStore: string): Promise<void> {
		// Retrieve the store to verify it exists and to update its status.
        const store: Store[]= await this.storeRepository.retrieveStore([idStore]); // Retrieving the store to verify it exists and to update its status.
        if (store.length === 0) throw new Error(`Store with id ${idStore} not found.`);
		const storeAggregate: StoreAggregate = new StoreAggregate(store.pop());
		storeAggregate.activateStore();
		const storeToUpdate: Store = storeAggregate.getStore();
		await this.storeRepository.updateStore(storeToUpdate);
	}
}

