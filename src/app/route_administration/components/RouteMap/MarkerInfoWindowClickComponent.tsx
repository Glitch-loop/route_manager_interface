
// Types
import { StorePositionInRouteType } from "@/shared/types/types";

// Dtos
import { LocationDTO } from "@/shared/dtos/LocationDTO";

// Components
import { IconButton, Tooltip } from "@mui/material";
import {
  CreateSharp,
} from "@mui/icons-material";

// Utils
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord 
} from "@/shared/utils/strings/utils";


export default function MarkerInfoWindowClickComponent(
  location: LocationDTO,
  locationPositions: StorePositionInRouteType[],
  onSelectStoreToUpdate?: (idStore: string) => void,
): React.ReactNode {
  const { id_location, location_name } = location;
  const storeName = location_name ?? "Nombre no disponible";
  const storeAddress = getAddressOfStore(location);

  return (
    <div className="p-3 min-w-[280px]">
      {onSelectStoreToUpdate && (
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-lg">
            {capitalizeFirstLetterOfEachWord(storeName)}
          </h4>
          <Tooltip
            title={"Actualizar información de la tienda"}
            placement="right"
            enterDelay={300}
            arrow
          >
            <IconButton
              onClick={() => onSelectStoreToUpdate(id_location)}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                width: 32,
                height: 32,
              }}
              size="small"
            >
              <CreateSharp className="text-white" fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* <p className="text-sm text-gray-600 mb-1">{id_location}</p> */}
      <p className="text-sm text-gray-600 mb-1">
        {capitalizeFirstLetterOfEachWord(storeAddress)}
      </p>
      {location.address_reference && (
        <p className="text-sm text-gray-500 mt-1">
          Referencias: {capitalizeFirstLetter(location.address_reference)}
        </p>
      )}

      {/* Route days table */}
      {locationPositions.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Días de ruta:
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 pr-2">Ruta</th>
                <th className="text-left py-1 pr-2">Día</th>
                <th className="text-center py-1">Pos.</th>
                <th className="w-6"></th>
              </tr>
            </thead>
            <tbody>
              {locationPositions.map((pos) => {
                return (
                  <tr
                    key={pos.idRouteDayStore}
                    className="border-b border-gray-100"
                  >
                    <td className="py-1 pr-2">
                      {capitalizeFirstLetter(pos.routeName)}
                    </td>
                    <td className="py-1 pr-2">
                      {capitalizeFirstLetter(pos.dayName)}
                    </td>
                    <td className="py-1 text-center">{pos.position}</td>
                    <td className="py-1 text-center">
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}