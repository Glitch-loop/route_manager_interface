import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";

/**
 * @field `route_day_by_day` It is a map where the key is the id of the day and the value is the RouteDayDTO of that day. It can be null if the route does not have any day assigned.
 */
export interface RouteDTO {
    id_route: string;
    route_name: string;
    description: string;
    route_status: boolean;
    id_vendor: string;
    route_day: RouteDayDTO[];
}