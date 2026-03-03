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
    private async executeUseCase(routeDayDTO: RouteDay, routeDayStoresDTO: RouteDayStore[]): Promise<void> {
        // TODO: Verify route day only contains active stores.
        // TODO: Verify the order of the stores is ascendent and there is not missing positions.
        

    } 

    async execute(routeDayDTO: RouteDayDTO, routeDayStoresDTO: RouteDayStoreDTO[]): Promise<void> {
        await this.executeUseCase(
            this.MapperDTO.toEntity(routeDayDTO),
            routeDayStoresDTO.map(storeDTO => this.MapperDTO.toEntity(storeDTO))
        );
    }
}