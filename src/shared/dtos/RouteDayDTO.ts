import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";

export interface RouteDayDTO {
    id_route_day: string;
    id_route: string;
    id_day: string;
    locations: RouteDayLocationDTO[];
}