import NumericValueCard from "@/shared/components/Cards/NumericValueCard/NumericValueCard";
import ColorPicker from "@/shared/components/ColorPicker/ColorPicker";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { formatNumberAsAccountingCurrency } from "@/shared/utils/strings/utils";
import { calculateStoresGreatTotalSales, calculateStoreTotalSales, calculateTotalStoreOfTransactionDescriptionConcept } from "@/shared/utils/transactions/utils";
import DAYS from "@/utils/days";
import { capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";
import { ContentCopy, Visibility, VisibilityOff, PictureAsPdf, Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

// Types
import { RouteDayEffect, RouteDayFilters } from "@/app/analytics/types/types";
import DAY_OPERATIONS from "@/core/enums/DayOperations";

  // Auxiliar function
const getRouteDayEffect = (idRouteDay: string, routeDayEffectsMap: Map<string, RouteDayEffect>): RouteDayEffect => {
  const effects = routeDayEffectsMap.get(idRouteDay)
  if (effects === undefined) {
    throw new Error("ChAange of the color is not possible. The effect for the route day doesn't exist.")
  } 
  return effects;
}

type RouteDayContainerProps = {
  routeDayToDisplay: RouteDayDTO;
  locationsMap: Map<string, LocationDTO>; // id_store -> LocationDTO
  routeDayEffectsMap: Map<string, RouteDayEffect>; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
  routeDayFilters: RouteDayFilters;
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // id_store -> LocationDTO
  routesMap: Map<string, RouteDTO>; // id_store -> LocationDTO
  onCloseRouteDay: (idRouteDay: string) => void; // Callback when user wants to close a route day (remove it from the view)
  onApplyRouteEffects: (idRouteDay: string, effects: RouteDayEffect) => void;
};

export default function RouteDayContainer({
  routeDayToDisplay,
  locationsMap,
  routeDayEffectsMap,
  routeDayFilters,
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
  const [locationSelected, setLocationSelected] = useState<string|null>(null);
  const locationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Use effects
  useEffect(() => {
    if (routeDayEffectsMap.has(id_route_day)) {
      const routeDayEffects  = routeDayEffectsMap.get(id_route_day)!;
      const { selectedLocation } = routeDayEffects;
      if (selectedLocation === undefined) {
        setLocationSelected(null);
      } else {
        setLocationSelected(selectedLocation);
      }
    }
  }, [routeDayEffectsMap, id_route_day]);

  useEffect(() => {
    if (locationSelected === null) {
      return;
    }

    const selectedLocationElement = locationRefs.current.get(locationSelected);
    selectedLocationElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [locationSelected]);

  // Handlers
  const handleShowInformation = (idRouteDay: string, state: boolean) => {
    // onShowInformation(idRouteDay, state);
    const effects = getRouteDayEffect(idRouteDay, routeDayEffectsMap);
    setShowInformation(state);
    onApplyRouteEffects(idRouteDay, {...effects, showStores: state});
  };

  const handleSelectRouteDayColor = (idRouteDay: string, color: string) => {
    const effects = getRouteDayEffect(idRouteDay, routeDayEffectsMap);
    onApplyRouteEffects(idRouteDay, {...effects, assignedColor: color});
    setColorSelected(color);
  };

  const handleSelectRouteDayLocation = (idRouteDay: string, idRouteDayLocation: string) => {
    const effects = getRouteDayEffect(idRouteDay, routeDayEffectsMap);
    
    if (idRouteDayLocation === locationSelected) { 
      setLocationSelected(null)
      onApplyRouteEffects(idRouteDay, {...effects, selectedLocation: undefined });
    } else { 
      setLocationSelected(idRouteDayLocation);
      onApplyRouteEffects(idRouteDay, {...effects, selectedLocation: idRouteDayLocation });
    }
  }

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
                  backgroundColor: "#E53935",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#E53935",
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
                  backgroundColor: "#B71C1C",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#B71C1C",
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
      {routeDayFilters.sellingGoal !== null &&
        <div className="flex flex-col justify-center items-end px-4 py-2">
          <div className="flex flex-row justify-end font-bold text-lg text-black italic">
            <span className="text-lg mr-2">
              Objetivo de venta:
            </span>
            <span className="text-lg text-black">
              {
                formatNumberAsAccountingCurrency(
                  routeDayFilters.sellingGoal.target!
                )
              }
            </span>
          </div>
          <div className="flex flex-row justify-end text-lg text-black">
            <span className="text-lg mr-2">
              Tiendas que cumplen objetivo de venta:
            </span>
            <span className="text-lg text-black">
              {
                locations.reduce((acc, currnetValue) => {
                  if (routeDayFilters.sellingGoal!.target === null) return acc;
                  const total = calculateTotalStoreOfTransactionDescriptionConcept(
                    currnetValue.id_location,
                    DAY_OPERATIONS.sales,
                    routeTransactionsMap,
                    false
                  );

                  if (total >= routeDayFilters.sellingGoal!.target) {
                    return acc + 1;
                  } else {
                    return acc;
                  }
                }, 0)
              }
            </span>
          </div>
          <span className="flex flex-row justify-end text-lg text-black">
            <span className="text-lg mr-2 text-end">
              Tiendas que NO cumplen objetivo de venta:
            </span>
            <span className="flex flex-row items-center text-lg text-black">
              {
                locations.reduce((acc, currnetValue) => {
                  if (routeDayFilters.sellingGoal!.target === null) return acc;

                  const total = calculateTotalStoreOfTransactionDescriptionConcept(
                    currnetValue.id_location,
                    DAY_OPERATIONS.sales,
                    routeTransactionsMap,
                    false
                  );

                  if (total < routeDayFilters.sellingGoal!.target) {
                    return acc + 1;
                  } else {
                    return acc;
                  }
                }, 0)
              }
            </span>
          </span>
        </div>
      }
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
                  ref={(element) => {
                    if (element) {
                      locationRefs.current.set(id_route_day_store, element);
                    } else {
                      locationRefs.current.delete(id_route_day_store);
                    }
                  }}
                  onClick={() => handleSelectRouteDayLocation(id_route_day, id_route_day_store)}
                  className={"relative p-2 cursor-pointer"} >
                  <NumericValueCard
                    cardName={capitalizeFirstLetterOfEachWord(storeName)}
                    cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                    numericValue={formatNumberAsAccountingCurrency(calculateStoreTotalSales(id_location, routeTransactionsMap))}
                    isSelected={locationSelected===id_route_day_store}
                  />
                </div>
              );
            })
          }
      </div>
    </div>
  );
}
