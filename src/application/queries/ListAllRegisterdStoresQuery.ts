// Library
import { inject, injectable } from 'tsyringe';

// Interfaces
import { StoreRepository } from '@/core/interfaces/StoreRepository';

// Entities
import { Store } from '@/core/entities/Store';

// DTOs & Mapper
import StoreDTO from '@/application/dto/StoreDTO';
import { MapperDTO } from '@/application/mappers/MapperDTO';

// DI Tokens
import { TOKENS } from '@/infrastructure/di/tokens';

@injectable()
export default class ListAllRegisterdStoresQuery {
	constructor(
		@inject(TOKENS.SupabaseStoreRepository) private readonly storeRepository: StoreRepository,
		private readonly mapperDTO: MapperDTO
	) {}

	async execute(): Promise<StoreDTO[]> {
		const stores: Store[] = await this.storeRepository.listStores();
		return stores.map((s) => this.mapperDTO.toDTO(s));
	}
}

