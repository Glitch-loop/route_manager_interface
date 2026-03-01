// Libraries
import { inject, injectable } from "tsyringe";

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

@injectable()
export default class ListRoutesByUserQuery {
    constructor(
        @inject(TOKENS.SupabaseRouteRepository) private repo: RouteRepository,
        private mapper: MapperDTO
    ) { }

    async execute(userId: string): Promise<RouteDTO[]> {
        const vendorRoutes: Route[] = [];
        const routes: Route[] = await this.repo.listRoutesByUser(userId);

        // Get the routes of the vendor and group the clients to attend by route day.
        for (const route of routes) {
            const routeDayOfRoute:RouteDay[] = [];
            const routeDays:RouteDay[] = await this.repo.listRouteDaysByRoute(route.id_route);
            
            for (const routeDay of routeDays) {
                const routeDayStores: RouteDayStore[] = await this.repo.listRouteDayStoresByRoute(routeDay.id_route_day);
                routeDayOfRoute.push(new RouteDay(
                    routeDay.id_route_day,
                    routeDay.id_route,
                    routeDay.id_day,
                    routeDayStores
                ))
            }

            vendorRoutes.push(new Route(
                route.id_route,
                route.route_name,
                route.description,
                route.route_status,
                route.id_vendor,
                routeDayOfRoute
            ));
            
        }

        return vendorRoutes.map(route => this.mapper.toDTO(route));
    }
}