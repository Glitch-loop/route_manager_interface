import { inject, injectable } from "tsyringe";

import { RouteRepository } from "@/core/interfaces/RouteRepository";
import RouteDayStoreDTO from "../dto/RouteDayStoreDTO";
import { TOKENS } from "@/infrastructure/di/tokens";
import { MapperDTO } from "../mappers/MapperDTO";
import RouteDayDTO from "../dto/RouteDayDTO";
import { RouteDay } from "@/core/object-values/RouteDay";
import { RouteDayStore } from "@/core/object-values/RouteDayStore";

@injectable()
export default class OrganizeRouteDayCommand {
    constructor(
        @inject(TOKENS.SupabaseRouteRepository) private readonly routeRepository: RouteRepository,
        private readonly MapperDTO: MapperDTO
    ) {}
    private async executeUseCase(id_route_day: string, routeDayStoresDTO: RouteDayStore[]): Promise<void> {
        // TODO: Verify route day only contains active stores.
        // TODO: Verify the order of the stores is ascendent and there is not missing positions.
        
        const routeDayStore = [...routeDayStoresDTO]

        routeDayStore.sort((a, b) => a.position_in_route - b.position_in_route);

        const routeDayStoreToUpdate = routeDayStore.map((store, index) => ({ 
            ...store,
            position_in_route: index + 1,
        }))

        await this.routeRepository.deleteRouteDayStores(id_route_day);
        await this.routeRepository.insertRouteDayStores(routeDayStoreToUpdate);
    } 

    async execute(id_route_day: string, routeDayStoresDTO: RouteDayStoreDTO[]): Promise<void> {
        
        await this.executeUseCase(
            id_route_day,
            routeDayStoresDTO.map(storeDTO => this.MapperDTO.toEntity(storeDTO))
        );
    }
}