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
export default class CreateStoreCommand {
    constructor(
        @inject(TOKENS.SupabaseStoreRepository) private readonly storeRepository: StoreRepository,
        private readonly mapperDTO: MapperDTO
    ) {}


    private async executeUseCase(store: Store): Promise<void> {
        const aggregate = new StoreAggregate();

        // Update the aggregate with the new store data
        aggregate.createStore(
            store.id_store,
            store.street,
            store.ext_number,
            store.colony,
            store.postal_code,
            store.address_reference,
            store.store_name,
            store.owner_name,
            store.cellphone,
            store.latitude,
            store.longitude,
        );

        await this.storeRepository.insertStores([aggregate.getStore()]);
    }

    async execute(storeDto: StoreDTO): Promise<void> {
        // Map DTO to entity
        const storeEntity: Store = this.mapperDTO.toEntity(storeDto);
        // Execute use case logic
        await this.executeUseCase(storeEntity);
    }
}