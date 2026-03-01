// Libraries
import { inject } from "tsyringe";

// Interfaces
import { RouteRepository } from "@/core/interfaces/RouteRepository";

// Entities
import { Route } from "@/core/entities/Route";

// Object values
import { RouteDay } from "@/core/object-values/RouteDay";
import { RouteDayStore } from "@/core/object-values/RouteDayStore";

// Mapper DTO
import RouteDTO from "@/application/dto/RouteDTO";
import { MapperDTO } from "@/application/mappers/MapperDTO";

// Utils
import { TOKENS } from "@/infrastructure/di/tokens";

export default class RetrieveRouteInformationQuery {
    constructor(
        @inject(TOKENS.SupabaseRouteRepository) private repo: RouteRepository,
        private mapper: MapperDTO
    ) { }

    async execute(routeIds: string[]): Promise<RouteDTO[]> {
        const routesToReturn: Route[] = [];

        const routes: Route[] = await this.repo.retrieveRouteByIds(routeIds);
        
        for (const route of routes) {
            const routeDayOfRoute:RouteDay[] = [];
            const { id_route, route_name, description, route_status, id_vendor } = route;
            const routeDays:RouteDay[] = await this.repo.listRouteDaysByRoute(id_route);
            
            for (const routeDay of routeDays) {
                const routeDayStores: RouteDayStore[] = await this.repo.listRouteDayStoresByRoute(routeDay.id_route_day);
                routeDayOfRoute.push(new RouteDay(
                    routeDay.id_route_day,
                    routeDay.id_route,
                    routeDay.id_day,
                    routeDayStores
                ))
            }

            routesToReturn.push(new Route(
                id_route,
                route_name,
                description,
                route_status,
                id_vendor,
                routeDayOfRoute
            ));

        }

        return routesToReturn.map(route => this.mapper.toDTO(route));
    }
}