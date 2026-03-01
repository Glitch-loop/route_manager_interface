import { inject, injectable } from 'tsyringe';

// Interfaces
import { RouteRepository } from '@/core/interfaces/RouteRepository';
import { MapperDTO } from '@/application/mappers/MapperDTO';

// Utils
import { TOKENS } from '@/infrastructure/di/tokens';
import RouteDTO from '@/application/dto/RouteDTO';


@injectable()
export default class ListRoutesQuery {
    constructor(
        @inject(TOKENS.SupabaseRouteRepository) private readonly routeRepository: RouteRepository,
        private readonly mapperDTO: MapperDTO
    ) {}

    async execute(): Promise<RouteDTO[]> {
        try {
            const routes = await this.routeRepository.listRoutes();
            console.log(routes)
            return routes.map(route => this.mapperDTO.toDTO(route));
        } catch (error) {
            throw new Error('Error listing routes: ' + error);
        }
    }
}