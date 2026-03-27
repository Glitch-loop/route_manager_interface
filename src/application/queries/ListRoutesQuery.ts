import { inject, injectable } from 'tsyringe';

// Interfaces
import { RouteRepository } from '@/core/interfaces/RouteRepository';
import { MapperDTO } from '@/application/mappers/MapperDTO';

// DTOs
import RouteDTO from '@/application/dto/RouteDTO';

// Utils
import { TOKENS } from '@/infrastructure/di/tokens';


@injectable()
export default class ListRoutesQuery {
    constructor(
        @inject(TOKENS.SupabaseRouteRepository) private readonly routeRepository: RouteRepository,
        private readonly mapperDTO: MapperDTO
    ) {}

    async execute(): Promise<RouteDTO[]> {
        try {
            const routes = await this.routeRepository.listRoutes();
            return routes.map(route => this.mapperDTO.toDTO(route));
        } catch (error) {
            throw new Error('Error listing routes: ' + error);
        }
    }
}