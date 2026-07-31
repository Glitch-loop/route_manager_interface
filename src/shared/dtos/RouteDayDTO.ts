import { RouteDayStoreDTO } from "@/shared/dtos/RouteDayStoreDTO";

export interface RouteDayDTO {
    id_route_day: string;
    id_route: string;
    id_day: string;
    stores: RouteDayStoreDTO[];
}