// Dtos
import { LocationDTO } from "@/shared/dtos/LocationDTO";

// Utils
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord } from "@/shared/utils/strings/utils";

export default function MarkerInfoWindowHoverComponent(store: LocationDTO): React.ReactNode {
  const storeName = store.location_name ?? "Nombre no disponible";
  const storeAddress = getAddressOfStore(store);

  return (
    <div className="p-2">
      <p className="text-lg font-semibold">
        {capitalizeFirstLetterOfEachWord(storeName)}
      </p>
      <p className="text-base text-gray-600">
        {capitalizeFirstLetterOfEachWord(storeAddress)}
      </p>
    </div>
  );
}
