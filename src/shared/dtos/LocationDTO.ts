import { LocationNoteDTO } from "@/shared/dtos/LocationNoteDTO";
import { LocationTypeDTO } from "@/shared/dtos/LocationTypeDTO";

export interface LocationDTO {
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
  location_type: LocationTypeDTO;
  created_at: Date;
  updated_at: Date;
  notes: LocationNoteDTO[];
  address_reference?: string | null;
}