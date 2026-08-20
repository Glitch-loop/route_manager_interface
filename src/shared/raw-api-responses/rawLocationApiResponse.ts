import { RawLocationNoteApiResponse } from "@/shared/raw-api-responses/rawLocationNoteApiResponse";
import { RawLocationTypeApiResponse } from "@/shared/raw-api-responses/rawLocationTypeApiResponse";

export interface RawLocationApiResponse {
  id_location: string;
  street: string;
  ext_number: string;
  colony: string;
  postal_code: string;
  location_name: string;
  latitude: string;
  longitude: string;
  status_location: number;
  id_creator: string;
  id_client: string;
  location_type: RawLocationTypeApiResponse;
  created_at: Date;
  updated_at: Date;
  notes: RawLocationNoteApiResponse[];
  address_reference?: string | null;
}