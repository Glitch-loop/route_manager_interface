// Libraries
import { Dayjs } from "dayjs";
import { move } from "@dnd-kit/helpers";
import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";

// DTOs
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// UI components
import { Button } from "@mui/material";
import RouteDayStoreContainer from "./RouteDayStoreContainer";
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";

// Utils
import { generateUUIDv4 } from "@/utils/generalUtils";
import { getRouteDayFromRoutesList } from "@/shared/utils/routes/utils";

// Types
import { RouteDayEffect, DraggableRouteDayStore } from "../../types/types";

type RouteDayContainerProps = {
  routeDaysInModification: Record<string, DraggableRouteDayStore[]>; // id_route_day -> array of DraggableRouteDayStore (stores in modification for each route day)
  storeMap: Map<string, LocationDTO>; // id_store -> LocationDTO
  routeDayEffectsMap: Map<string, RouteDayEffect>; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
  routes: RouteDTO[]; // List of routes to find where each route day belongs (also used for reset)
  routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // Map of store ID to list of route transactions
  onModifyRouteDays: (
    modifiedRouteDays: Record<string, DraggableRouteDayStore[]>,
  ) => void; // Callback when a route day is modified (stores added/removed/reordered)
  onRequireRouteTransactions: (
    startDate: Date,
    endDate: Date,
    idStores: string[],
  ) => void; // Callback when user clicks "Aplicar fechas"
  onSaveRouteModification: (
    idRouteDayColumn: string,
    storesInRouteDay: RouteDayLocationDTO[],
  ) => void; // Callback when user saves route modifications
  onCloseRouteDay: (idRouteDay: string) => void; // Callback when user wants to close a route day (remove it from the view)
  onShowInformation: (idRouteDay: string, state: boolean) => void;
  onSelectRouteDayColor: (idRouteDay: string, color: string) => void;
  onHoverAutocompleteOption: (store: LocationDTO | null) => void; // Callback to detect hover over autocomplete options, receives the hovered store or null if not hovering any option
  onSelectRouteDayStore: (idRouteDayStore: string) => void; // Callback when a store is selected (clicked) in the route day, receives id_route_day_store
};

export default function RouteDayContainer({
  routeDaysInModification,
  storeMap,
  routeDayEffectsMap,
  routes,
  routeTransactionsMap,
  onModifyRouteDays,
  onRequireRouteTransactions,
  onSaveRouteModification,
  onCloseRouteDay,
  onShowInformation,
  onSelectRouteDayColor,
  onHoverAutocompleteOption,
  onSelectRouteDayStore,
}: RouteDayContainerProps) {
  useEffect(() => {
    if (startDateSelected !== null && endDateSelected !== null) {
      handleApplyDateRange(startDateSelected, endDateSelected);
    }
  }, [routeDaysInModification]);

  // Related to route transactions
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(
    null,
  );
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);

  // Handle drag over event - moves items between columns
  const handleDragOver = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragOver"]>
    >[0],
  ) => {
    const result = move(routeDaysInModification, event);
    onModifyRouteDays(result as Record<string, DraggableRouteDayStore[]>);
  };

  const handleAddNewStore = (idRouteDay: string, idStore: string) => {
    if (routeDaysInModification[idRouteDay]) {
      const existingStores = routeDaysInModification[idRouteDay];
      const idRouteDayStore = generateUUIDv4();
      const newStore: DraggableRouteDayStore = {
        id_route_day_store: idRouteDayStore,
        id_route_day: idRouteDay,
        id_location: idStore,
        position_in_route: existingStores.length,
        id: idRouteDayStore,
      };

      onModifyRouteDays({
        ...routeDaysInModification,
        [idRouteDay]: [...routeDaysInModification[idRouteDay], newStore],
      });
    }
  };

  /**
   * Remove stores from a route day by their id_route_day_store.
   */
  const handleRemoveStores = (idsRouteDayStore: string[]) => {
    const idsToRemove = new Set(idsRouteDayStore);
    const updated: Record<string, DraggableRouteDayStore[]> = {};

    for (const [routeDayId, stores] of Object.entries(
      routeDaysInModification,
    )) {
      updated[routeDayId] = stores.filter(
        (store) => !idsToRemove.has(store.id_route_day_store),
      );
    }

    onModifyRouteDays(updated);
  };

  /**
   * Reset modifications for a specific route day back to original state from routes.
   */
  const handleResetRouteModification = (idRouteDay: string) => {
    const originalRouteDay: RouteDayDTO | null = getRouteDayFromRoutesList(
      routes,
      idRouteDay,
    );

    if (originalRouteDay) {
      const originalStores: DraggableRouteDayStore[] = (
        originalRouteDay.locations || []
      ).map((location) => ({
        ...location,
        id: location.id_route_day_store,
      }));

      onModifyRouteDays({
        ...routeDaysInModification,
        [idRouteDay]: originalStores,
      });
    }
  };

  /**
   * Cancel and close a route day modification.
   */
  const handleCancelRouteModification = (idRouteDay: string) => {
    const updated: Record<string, DraggableRouteDayStore[]> = {};
    for (const [routeDayId, stores] of Object.entries(
      routeDaysInModification,
    )) {
      if (routeDayId !== idRouteDay) {
        updated[routeDayId] = stores;
      }
    }
    onModifyRouteDays(updated);
    onCloseRouteDay(idRouteDay);
  };

  /**
   * Save route modification for a specific route day.
   */
  const handleSaveRouteModification = async (idRouteDay: string) => {
    const storesInRouteDay = routeDaysInModification[idRouteDay];
    // return
    if (!storesInRouteDay) return;

    const updatedStoresInRouteDay = storesInRouteDay.map((store, index) => ({
      ...store,
      position_in_route: index,
    }));

    await onSaveRouteModification(idRouteDay, updatedStoresInRouteDay);

    // Update local state with new positions
    onModifyRouteDays({
      ...routeDaysInModification,
      [idRouteDay]: updatedStoresInRouteDay,
    });
  };

  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDateSelected(start);
    setEndDateSelected(end);
  };

  const handleApplyDateRange = (
    startDate: Dayjs | null,
    endDate: Dayjs | null,
  ) => {
    if (startDate && endDate) {
      const allStoreIds = Object.values(routeDaysInModification)
        .flat()
        .map((store) => store.id_location);
      onRequireRouteTransactions(
        startDate.toDate(),
        endDate.toDate(),
        allStoreIds,
      );
    }
  };

  return (
    <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
      <div className="flex basis-1/5 items-center flex-col shrink-0  bg-system-third-background p-1 rounded-lg gap-2">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Administración de días en ruta
        </h2>
        <RangeDateSelection
          initialDirection="before"
          initialSelectedRange="1month"
          onRangeChange={handleDateRangeChange}
        />
        <div className="flex flex-col justify-center items-center w-full gap-2">
          <span className="text-base font-bold">Fechas seleccionadas:</span>
          <div className="flex flex-row justify-center">
            <span>
              {startDateSelected
                ? startDateSelected.format("DD/MM/YYYY")
                : "N/A"}
            </span>
            <span className="mx-2">-</span>
            <span>
              {endDateSelected ? endDateSelected.format("DD/MM/YYYY") : "N/A"}
            </span>
          </div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              handleApplyDateRange(startDateSelected, endDateSelected)
            }
          >
            Aplicar fechas
          </Button>
        </div>
      </div>
      <DragDropProvider onDragOver={handleDragOver}>
        <div className="overflow-auto ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">
          {Object.entries(routeDaysInModification).map(
            ([idRouteDay, stores]) => (
              <RouteDayStoreContainer
                key={idRouteDay}
                idRouteDayColumn={idRouteDay}
                storesToAttend={stores}
                storesMap={storeMap}
                routes={routes}
                routeTransactionsMap={routeTransactionsMap}
                routeDayEffectsMap={routeDayEffectsMap}
                onAddStore={handleAddNewStore}
                onRemoveStores={handleRemoveStores}
                onCancelRouteModification={handleCancelRouteModification}
                onSaveRouteModification={handleSaveRouteModification}
                onResetRouteModification={handleResetRouteModification}
                onShowInformation={onShowInformation}
                onSelectRouteDayColor={onSelectRouteDayColor}
                onHoverAutocompleteOption={onHoverAutocompleteOption}
                onSelectRouteDayStore={onSelectRouteDayStore}
              />
            ),
          )}
        </div>
      </DragDropProvider>
    </div>
  );
}
