// Library
import { inject, injectable } from 'tsyringe';

// Interfaces
import { StoreRepository } from '@/core/interfaces/StoreRepository';
import { RouteRepository } from '@/core/interfaces/RouteRepository';

// Entities
import { Store } from '@/core/entities/Store';

// Aggregates
import RouteDayAggregate from '@/core/aggregates/RouteDayAggregate';
import StoreAggregate from '@/core/aggregates/StoreAggregate';

// Entities
import { Route } from '@/core/entities/Route';

// Object values
import { RouteDay } from '@/core/object-values/RouteDay';
import { RouteDayStore } from '@/core/object-values/RouteDayStore';

// DTOs & Mapper
import { MapperDTO } from '@/application/mappers/MapperDTO';

// DI Tokens
import { TOKENS } from '@/infrastructure/di/tokens';

@injectable()
export default class DesactivateStoreCommand {
	constructor(
		@inject(TOKENS.SupabaseStoreRepository) private readonly storeRepository: StoreRepository,
        @inject(TOKENS.SupabaseRouteRepository) private readonly routeRepository: RouteRepository,
		private readonly mapperDTO: MapperDTO
	) {}

	async execute(idStore: string): Promise<void> {
        const consultedRouteDays:RouteDay[] = [];
        const routeDaysToUpdate:RouteDay[] = [];
        
        // Retrieve the store to verify it exists and to update its status.
        const store: Store[]= await this.storeRepository.retrieveStore([idStore]); // Retrieving the store to verify it exists and to update its status.

        if (store.length === 0) throw new Error(`Store with id ${idStore} not found.`);

        // Verifying there is not a store in a route day.
        const routes: Route[] = await this.routeRepository.listRoutes();

        const arrIdRoutesToConsult:string[] = routes.map(route => route.id_route);

        arrIdRoutesToConsult.forEach(async (idRoute:string) => {
            const routeDays = await this.routeRepository.listRouteDaysByRoute(idRoute);
            consultedRouteDays.push(...routeDays);
        });

        consultedRouteDays.forEach(async (routeDay) => {
            const { id_route_day } = routeDay;
            const routeDayStores: RouteDayStore[] = await this.routeRepository.listRouteDayStoresByRoute(id_route_day);

            const storeInRouteDay: RouteDayStore | undefined = routeDayStores.find((routeDayStore) => routeDayStore.id_store === idStore);

            if(storeInRouteDay) { 
                routeDaysToUpdate.push({...routeDay, stores: [ ...routeDayStores ]});
            }            
        });

        // If there is a store in route day, it is necessary to remove it before desactivating the store.
        for (const routeDayToUpdate of routeDaysToUpdate) {
            const routeDayAggregate: RouteDayAggregate = new RouteDayAggregate(routeDayToUpdate);
            routeDayAggregate.removeStoreFromRouteDay(idStore);

            const updatedRouteDay: RouteDay = routeDayAggregate.getRouteDay();

            const { id_route_day, stores } = updatedRouteDay;
            await this.routeRepository.deleteRouteDayStores(id_route_day);
            await this.routeRepository.insertRouteDayStores(stores);
        }      

        // Desactivating the store.
        const storeAggregate: StoreAggregate = new StoreAggregate(store.pop());
        storeAggregate.desactivateStore(); // Deacivating the store.

        const storeToUpdate: Store = storeAggregate.getStore();
        await this.storeRepository.updateStore(storeToUpdate);
	}
}

