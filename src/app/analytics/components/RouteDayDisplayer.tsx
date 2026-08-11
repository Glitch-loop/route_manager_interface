// Libraries
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

// DTOs
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// UI components
import { Badge, Button, ButtonGroup } from "@mui/material";
import { SellingGoal } from "@/shared/components/SellingGoal/SellingGoal";
import { ItemsPicker } from "@/shared/components/ItemsPicker/ItemsPicker";
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";

// Utils
import RouteDayContainer from "@/app/analytics/components/RouteDayContainer";

// Types
import { RouteDayEffect } from "@/app/analytics/types/types";
import { SellingGoalType } from "@/shared/components/SellingGoal/types/types";
import { RouteDayFilters, routeDayFiltersType } from "@/app/analytics/types/types";
import { ItemsPickerType, PickerItemType } from "@/shared/components/ItemsPicker/types/types";

type FilterTab = "fechas" | "venta_objetivo" | "producto";

const FILTER_TAB_LABELS: Record<FilterTab, string> = {
  fechas: "Fechas",
  venta_objetivo: "Venta objetivo",
  producto: "Producto",
};

type RouteDayContainerProps = {
  routeDayToDisplay: RouteDayDTO[];
  locationsMap: Map<string, LocationDTO>; // id_store -> LocationDTO
  routesMap: Map<string, RouteDTO>; // id_store -> LocationDTO
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // Map of store ID to list of route transactions
  routeDayEffectsMap: Map<string, RouteDayEffect>; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
  routeDayFilters: RouteDayFilters; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
  pickerItems: PickerItemType[]; // Product items available for the product filter
  onRequireRouteTransactions: (
    startDate: Date,
    endDate: Date,
    idStores: string[],
  ) => void; // Callback when user clicks "Aplicar fechas"
  onCloseRouteDay: (idRouteDay: string) => void; // Callback when user wants to close a route day (remove it from the view)
  onApplyRouteEffects: (idRouteDay: string, state: RouteDayEffect) => void;
  onApplyFilter: (routeDayFilters: RouteDayFilters) => void;
//   onHoverAutocompleteOption: (store: LocationDTO | null) => void; // Callback to detect hover over autocomplete options, receives the hovered store or null if not hovering any option
//   onSelectRouteDayStore: (idRouteDayStore: string) => void; // Callback when a store is selected (clicked) in the route day, receives id_route_day_store
};

export default function RouteDayDisplayer({
  routeDayToDisplay,
  locationsMap,
  routesMap,
  routeTransactionsMap,
  routeDayEffectsMap,
  routeDayFilters,
  pickerItems,
  onRequireRouteTransactions,
  onCloseRouteDay,
  onApplyRouteEffects,
  onApplyFilter,
//   onHoverAutocompleteOption,
//   onSelectRouteDayStore,
}: RouteDayContainerProps) {

  useEffect(() => {
    if (startDateSelected !== null && endDateSelected !== null) {
      handleApplyDateRange(startDateSelected, endDateSelected);
    }
  }, [routeDayToDisplay]);

  // Related to route transactions
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);

  // Filter tab selection
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("fechas");

  // Active filter configs (null = not applied)
  const [sellingGoalConfig, setSellingGoalConfig] = useState<SellingGoalType | null>(null);
  const [itemsPickerConfig, setItemsPickerConfig] = useState<ItemsPickerType | null>(null);

  const isSellingGoalActive = sellingGoalConfig !== null && sellingGoalConfig.target !== null;
  const isProductFilterActive =
    itemsPickerConfig !== null &&
    (itemsPickerConfig.show !== "show_only_meet" ||
      itemsPickerConfig.selectedItems.length !== pickerItems.length);

  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDateSelected(start);
    setEndDateSelected(end);
  };

  const handleApplyDateRange = (startDate: Dayjs | null, endDate: Dayjs | null) => {
    if (startDate && endDate) {
      const allStoreIds = routeDayToDisplay.map((routeDay) =>
        routeDay.locations.map((location) => location.id_location)
      );
      onRequireRouteTransactions(startDate.toDate(), endDate.toDate(), allStoreIds.flat());
    }
  };


  const handleApplyEffect = (config: SellingGoalType | ItemsPickerType) => {
    if ('target' in config) {
      onApplyFilter({...routeDayFilters, sellingGoal: {...config}});
      setSellingGoalConfig({...config});
    } else {
      setItemsPickerConfig({...config});
      onApplyFilter({...routeDayFilters, pickerProduct: {...config}});
    }
  }

  const handleReset = (filterToReset: routeDayFiltersType) => {
    if (filterToReset === "sellingGoal") {
      setSellingGoalConfig(null);
      onApplyFilter({...routeDayFilters, sellingGoal: null});
    } else if (filterToReset === "pickItemsFilter") {
      setItemsPickerConfig(null);
      onApplyFilter({...routeDayFilters, pickerProduct: null});
    }
  }
 
  return (
    <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
      {/* Filters container */}
      <div className="flex basis-1/5 items-center flex-col shrink-0 bg-system-third-background p-1 rounded-lg gap-2">

        {/* Tab selector with active-filter badges */}
        <ButtonGroup variant="text" size="small" aria-label="Selector de filtro">
          {(["fechas", "venta_objetivo", "producto"] as FilterTab[]).map((tab) => {
            const hasBadge =
              (tab === "venta_objetivo" && isSellingGoalActive) ||
              (tab === "producto" && isProductFilterActive);
            return (
              <Badge key={tab} color="error" variant="dot" invisible={!hasBadge}>
                <Button
                  variant={activeFilterTab === tab ? "contained" : "text"}
                  size="small"
                  onClick={() => setActiveFilterTab(tab)}
                >
                  {FILTER_TAB_LABELS[tab]}
                </Button>
              </Badge>
            );
          })}
        </ButtonGroup>

        {/* Dynamic title reflecting the active tab */}
        <span className="text-sm font-semibold">{FILTER_TAB_LABELS[activeFilterTab]}</span>

        {/* Tab content */}
        {activeFilterTab === "fechas" && (
          <>
            <RangeDateSelection
              initialDirection="before"
              initialSelectedRange="1month"
              onRangeChange={handleDateRangeChange}
            />
            <div className="flex flex-col justify-center items-center w-full gap-2">
              <span className="text-base font-bold">Fechas seleccionadas:</span>
              <div className="flex flex-row justify-center">
                <span>{startDateSelected ? startDateSelected.format("DD/MM/YYYY") : "N/A"}</span>
                <span className="mx-2">-</span>
                <span>{endDateSelected ? endDateSelected.format("DD/MM/YYYY") : "N/A"}</span>
              </div>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleApplyDateRange(startDateSelected, endDateSelected)}
              >
                Aplicar fechas
              </Button>
            </div>
          </>
        )}

        {activeFilterTab === "venta_objetivo" && (
          <SellingGoal 
            onChangeSellingGoalConfiguration={handleApplyEffect} 
            onResetConfiguration={() => handleReset("sellingGoal")}
            />
        )}

        {activeFilterTab === "producto" && (
          <ItemsPicker
            pickerItems={pickerItems}
            onChangePickerConfiguration={handleApplyEffect}
            onResetConfiguration={() => handleReset("pickItemsFilter")}
          />
        )}
      </div>

      <div className="overflow-auto ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">
        {routeDayToDisplay.map((routeDay) => {
          return (
            <RouteDayContainer
              key={routeDay.id_route_day}
              routeDayToDisplay={routeDay}
              routeDayEffectsMap={routeDayEffectsMap}
              routeTransactionsMap={routeTransactionsMap}
              locationsMap={locationsMap}
              routesMap={routesMap}
              onCloseRouteDay={onCloseRouteDay}
              onApplyRouteEffects={onApplyRouteEffects}
            />
          );
        })}
      </div>
    </div>
  );
}
