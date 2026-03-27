import { RouteDay } from "../object-values/RouteDay";
import { RouteDayStore } from "../object-values/RouteDayStore";

export default class RouteDayAggregate {
    private routeDay: RouteDay|null = null;
    private routeDayStores: RouteDayStore[]|null = null;

    constructor(private readonly routeDayParam?: RouteDay,) { 
        if (routeDayParam){
            const { stores } = routeDayParam;
                this.routeDay = { ...routeDayParam };
                this.routeDayStores = [...stores];
            }
    }

    public createRouteDay(idRouteDay: string, idRoute: string, idDay: string): void {
        this.routeDay = new RouteDay(idRouteDay, idRoute, idDay, []);
    }

    public removeStoreFromRouteDay(idRouteDayStore: string): void {
        if (this.routeDayStores === null) throw new Error("Route day stores not initialized");
        const orderedStores = this.routeDayStores.sort((a, b) => a.position_in_route - b.position_in_route);        
        const filteredStores = orderedStores.filter(store => store.id_route_day_store === idRouteDayStore);
        this.routeDayStores = filteredStores.map((store, index) => {
            const { id_route_day_store, id_route_day, id_store } = store;
            return new RouteDayStore(
                id_route_day_store,
                index + 1,
                id_route_day,
                id_store,
            )
        });
    }

    public addStoreToRouteDay(idRouteDayStore: string, idStore: string): void { // Always adds the store to the end of the route day stores list.
        let position_in_route: number = -1;
        if (!this.routeDay) throw new Error("Route day not initialized");
        
        const { id_route_day } = this.routeDay;

        if (!this.routeDayStores) {
            position_in_route = 1;
            this.routeDayStores = [];
        } else {
            position_in_route = this.routeDayStores.length + 1;
        }

        const newStore = new RouteDayStore(idRouteDayStore, position_in_route, id_route_day, idStore);
        
        this.routeDayStores.push(newStore);
    }
    
    public clearRouteDayStores(): void {
        if (this.routeDay === null) throw new Error("Route day not initialized");
        this.routeDayStores = [];
    }

    public getRouteDay(): RouteDay {
        if (this.routeDay === null) throw new Error("Route day not initialized");
        return { ...this.routeDay, stores: this.routeDayStores ? [...this.routeDayStores] : [] };
    }

    public getRouteDayStores(): RouteDayStore[] {
        if (this.routeDayStores === null) throw new Error("Route day stores not initialized");
        return [...this.routeDayStores ];
    }




}
