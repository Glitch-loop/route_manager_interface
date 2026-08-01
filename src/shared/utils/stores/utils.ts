import { LocationDTO } from "@/shared/dtos/LocationDTO";

export function getAddressOfStore(store: LocationDTO): string {
  const { street, ext_number, colony, postal_code } = store;
  return `${street} #${ext_number}, ${colony}. C.P: ${postal_code}`;
}
