import NumericValueCard from "@/shared/components/Cards/NumericValueCard/NumericValueCard";
import ColorPicker from "@/shared/components/ColorPicker/ColorPicker";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { formatNumberAsAccountingCurrency } from "@/shared/utils/strings/utils";
import { calculateStoresGreatTotalSales, calculateStoreTotalSales } from "@/shared/utils/transactions/utils";
import DAYS from "@/utils/days";
import { capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";
import { ContentCopy, Visibility, VisibilityOff, PictureAsPdf, Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

// Types
import { RouteDayEffect } from "@/app/route_administration/types/types";


type RouteDayContainerProps = {
  routeDayToDisplay: RouteDayDTO;
  locationsMap: Map<string, LocationDTO>; // id_store -> LocationDTO
  routeDayEffectsMap: Map<string, RouteDayEffect>; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // id_store -> LocationDTO
  routesMap: Map<string, RouteDTO>; // id_store -> LocationDTO
  onCloseRouteDay: (idRouteDay: string) => void; // Callback when user wants to close a route day (remove it from the view)
  onApplyRouteEffects: (idRouteDay: string, effects: RouteDayEffect) => void;
};

export default function RouteDayContainer({
  routeDayToDisplay,
  locationsMap,
  routeDayEffectsMap,
  routeTransactionsMap,
  routesMap,
  onCloseRouteDay,
  onApplyRouteEffects
}: RouteDayContainerProps) {
  // Definitions
  let routeTitle: string = 'Ruta disponible.'; 
  const { id_route, locations, id_day, id_route_day } = routeDayToDisplay;
  
  routeTitle = routesMap.get(id_route) === undefined ? 'Ruta no disponible' : routesMap.get(id_route)!.route_name;
  
  const dayInfo = DAYS[id_day];

  if (dayInfo) {
    routeTitle += ` - ${dayInfo.day_name}`;
  }

  // States
  const [showInformation, setShowInformation] = useState<boolean>(true);
  const [colorSelected, setColorSelected] = useState<string>(
    routeDayEffectsMap.get(id_route_day)?.assignedColor ?? "#000000",
  );


  // Handlers
  const handleShowInformation = (idRouteDay: string, state: boolean) => {
    // onShowInformation(idRouteDay, state);
    setShowInformation(state);
  };

  const handleSelectRouteDayColor = (idRouteDay: string, color: string) => {
    const effects = routeDayEffectsMap.get(idRouteDay)

    if (effects === undefined) {
      console.log("Change of the color is not possible. The effect for the route day doesn't exist.");
      return;
    }

    onApplyRouteEffects(idRouteDay, {...effects, assignedColor: color});
    setColorSelected(color);
  };

  return (
    <div className="w-96 h-full flex flex-col shrink-0 overflow-auto bg-system-primary-background rounded-lg">
      <div className="p-2 flex flex-col">
        {/* Title and main actions */}
        <div className="flex flex-row justify-start items-center my-2">
          <div className="flex basis-1/2 gap-2 items-center">
            <h3 className="text-center align-middle font-bold text-lg">
              {capitalizeFirstLetterOfEachWord(routeTitle)}
            </h3>
            <Tooltip
              title={
                showInformation ? "Ocultar información" : "Mostrar información"
              }
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#f58220",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#e0741a",
                  },
                  width: 40,
                  height: 40,
                }}
                onClick={() =>
                  handleShowInformation(id_route_day, !showInformation)
                }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                {showInformation ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={"Cambiar color del día de ruta"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <ColorPicker
                initialColor={colorSelected}
                onChange={(color) =>
                  handleSelectRouteDayColor(id_route_day, color)
                }
              />
            </Tooltip>
            <Tooltip
              title={"Copiar CSV"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#107C41",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#107C41",
                  },
                  width: 40,
                  height: 40,
                }}
                // onClick={() =>
                //   handleCopyInformation(id_route_day)
                // }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={"Imprimir reporte PDF"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#EC1C24",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#EC1C24",
                  },
                  width: 40,
                  height: 40,
                }}
                // onClick={() =>
                //   handleCopyInformation(id_route_day)
                // }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                <PictureAsPdf />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={"Cerrar dia"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#EC1C24",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#EC1C24",
                  },
                  width: 40,
                  height: 40,
                }}
                onClick={() =>
                  onCloseRouteDay(id_route_day)
                }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      {/* Estimated total section */}
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total vendido entre el rango de fechas seleccionado:{" "}
        </span>
        <span className="font-bold text-lg text-black">
          {
            formatNumberAsAccountingCurrency(calculateStoresGreatTotalSales(
              locations,
              routeTransactionsMap
            ))
          }
        </span>
      </div>
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total clientes en día de ruta:{" "}
        </span>
        <span className="font-bold text-lg text-black">
          {locations.length}
        </span>
      </div>
      <div
        className="flex flex-col min-h-[500px] overflow-y-auto bg-system-secondary-background"
        style={{ scrollBehavior: "smooth" }}>
          {
            locations.map((location, index) => {
              const { id_route_day_store, id_location } = location;
              let storeName: string = "Not found";
              let storeAddress: string = "Not found";
              const storeDetails = locationsMap.get(id_location);
              if (storeDetails) {
                const { location_name } = storeDetails;
                storeName =
                  location_name === null
                    ? "No disponible"
                    : `${index + 1} - ` + location_name;
                storeAddress = getAddressOfStore(storeDetails);
              }

              return (
                <div
                  key={id_route_day_store}
                  onClick={() => { }}
                  className={"relative p-2 cursor-pointer"} >
                  <NumericValueCard
                    cardName={capitalizeFirstLetterOfEachWord(storeName)}
                    cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                    numericValue={
                      formatNumberAsAccountingCurrency(calculateStoreTotalSales(id_location, routeTransactionsMap),)
                    }
                  />
                </div>
              );
            })
          }
      </div>
    </div>
  );
}
