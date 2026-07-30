import { RawRouteDayLocationApiResponse } from "@/shared/raw-api-response/rawRouteDayLocationApiResponse";

export interface RawRouteDayApiResponse {
  id_route_day: string;
  id_route: string;
  id_day: string;
  locations: RawRouteDayLocationApiResponse[];
}
