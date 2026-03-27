// Library
import { inject, injectable } from 'tsyringe';

// Interfaces
import { StoreRepository } from '@/core/interfaces/StoreRepository';

// Entities
import { Store } from '@/core/entities/Store';

// Aggregates
import StoreAggregate from '@/core/aggregates/StoreAggregate';

// DTOs & Mapper
import { MapperDTO } from '@/application/mappers/MapperDTO';
import StoreDTO from '../dto/StoreDTO';

// DI Tokens
import { TOKENS } from '@/infrastructure/di/tokens';

@injectable()
export default class UpdateStoreCommand {
	constructor(
		@inject(TOKENS.SupabaseStoreRepository) private readonly storeRepository: StoreRepository,
		private readonly mapperDTO: MapperDTO
	) {}


	private async executeUseCase(store: Store): Promise<void> {
		const aggregate = new StoreAggregate(store);

		// Update the aggregate with the new store data
		aggregate.updateStore({
			id_store: store.id_store,
			street: store.street,
			ext_number: store.ext_number,
			colony: store.colony,
			postal_code: store.postal_code,
			address_reference: store.address_reference,
			store_name: store.store_name,
			owner_name: store.owner_name,
			cellphone: store.cellphone,
			latitude: store.latitude,
			longitude: store.longitude,
			id_creator: store.id_creator,
			creation_date: store.creation_date,
			creation_context: store.creation_context,
			status_store: store.status_store,
		});

		await this.storeRepository.updateStore(aggregate.getStore());
	}

	async execute(storeDto: StoreDTO): Promise<void> {
		// Map DTO to entity
		const storeEntity: Store = this.mapperDTO.toEntity(storeDto);
		// Execute use case logic
		await this.executeUseCase(storeEntity);
	}
}

