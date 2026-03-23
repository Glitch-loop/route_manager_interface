import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import { Button, Switch } from "@mui/material";
import RouteDayStoreContainer from "./RouteDayStoreContainer";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import StoreDTO from "@/application/dto/StoreDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import { useEffect, useState } from "react";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import RouteTransactionDTO from "@/application/dto/RouteTransactionDTO";
import { generateUUIDv4 } from "@/utils/generalUtils";
import { Dayjs } from "dayjs";
import { RouteDayEffect } from "../../types/types";

// Extended type that adds 'id' property for dnd-kit compatibility
type DraggableRouteDayStore = RouteDayStoreDTO & { id: string };


type RouteDayContainerProps = {
    routesDay: RouteDayDTO[];
    storeMap: Map<string, StoreDTO>; // id_store -> StoreDTO
    routeDayEffectsMap: Map<string, RouteDayEffect>; // id_route_day -> RouteDayEffect (for UI state like showStores and assignedColor)
    routes: RouteDTO[]; // List of routes to find where each route day belongs
    routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // Map of store ID to list of route transactions
    onRequireRouteTransactions: (startDate: Date, endDate: Date, idStores: string[]) => void; // Callback when user clicks "Aplicar fechas"
    onSaveRouteModification: (idRouteDayColumn: string, storesInRouteDay: RouteDayStoreDTO[]) => void; // Callback when user saves route modifications
    oncloseRouteDay: (idRouteDay: string) => void; // Callback when user wants to close a route day (remove it from the view)
    onShowInformation: (idRouteDay: string, state: boolean) => void;
    onSelectRouteDayColor: (idRouteDay: string, color: string) => void;
}


export default function RouteDayContainer({ 
        routesDay,
        storeMap, 
        routeDayEffectsMap,
        routes,
        routeTransactionsMap,
        onRequireRouteTransactions,
        onSaveRouteModification,
        oncloseRouteDay, 
        onShowInformation,
        onSelectRouteDayColor,
    }: 
    RouteDayContainerProps) {
    
    // State to keep track of stores in each route day column
    // Key: id_route_day, Value: array with 'id' property for dnd-kit compatibility
    const [currentRoutesDay, setCurrentRoutesDay] = useState<Record<string, DraggableRouteDayStore[]>>({});

    // Related to route transactions
    const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
    const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);

    // Initialize state from routesDay prop - adds 'id' property for dnd-kit
    useEffect(() => {
        const initialState: Record<string, DraggableRouteDayStore[]> = {};
        
        routesDay.forEach((routeDay) => {
            const { id_route_day, stores } = routeDay;
            // Transform stores to include 'id' property (maps to id_route_day_store)
            const draggableStores: DraggableRouteDayStore[] = (stores || []).map(store => ({
                ...store,
                id: store.id_route_day_store, // Add id for dnd-kit compatibility
            }));
            initialState[id_route_day] = draggableStores;
        });
    
        if (startDateSelected !== null && endDateSelected !== null) {
            handleApplyDateRange(startDateSelected, endDateSelected, initialState);
        }

        setCurrentRoutesDay(initialState);
    }, [routesDay]);

    // Handle drag over event - moves items between columns
    const handleDragOver = (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragOver']>>[0]) => {
        setCurrentRoutesDay((items) => {
            const result = move(items, event);
            return result as Record<string, DraggableRouteDayStore[]>;
        });
    };

    const handleAddNewStore = (idRouteDay: string, idStore: string) => {
        if (currentRoutesDay[idRouteDay]) {
            const existingStores = currentRoutesDay[idRouteDay];
            const idRouteDayStore = generateUUIDv4();
            const newStore: DraggableRouteDayStore = {
                id_route_day_store: idRouteDayStore, // Temporary ID for new store
                id_route_day: idRouteDay,
                id_store: idStore,
                position_in_route: existingStores.length, // Add to the end of the list
                id: idRouteDayStore, // Add id for dnd-kit compatibility
            };

            setCurrentRoutesDay((prev) => ({
                ...prev,
                [idRouteDay]: [...prev[idRouteDay], newStore],
            }));
        }
    }

    /**
     * Remove stores from a route day by their id_route_day_store.
     * Filters out stores that match the provided IDs.
     */
    const handleRemoveStores = (idsRouteDayStore: string[]) => {
        const idsToRemove = new Set(idsRouteDayStore);
        
        setCurrentRoutesDay((prev) => {
            const updated: Record<string, DraggableRouteDayStore[]> = {};
            
            for (const [routeDayId, stores] of Object.entries(prev)) {
                updated[routeDayId] = stores.filter(
                    store => !idsToRemove.has(store.id_route_day_store)
                );
            }
            
            return updated;
        });
    };

    /**
     * Cancel modifications for a specific route day.
     * Resets the route day back to its original state from props.
     */
    const handleResetRouteModification = (idRouteDay: string) => {
        const originalRouteDay = routesDay.find(rd => rd.id_route_day === idRouteDay);
        
        if (originalRouteDay) {
            const originalStores: DraggableRouteDayStore[] = (originalRouteDay.stores || []).map(store => ({
                ...store,
                id: store.id_route_day_store,
            }));
            
            setCurrentRoutesDay((prev) => ({
                ...prev,
                [idRouteDay]: originalStores,
            }));
        }
    };

    const handleCancelRouteModification = (idRouteDay: string) => {
        const newCurrentRoutesDay:Record<string, DraggableRouteDayStore[]> = {};
        for (const [routeDayId, stores] of Object.entries(currentRoutesDay)) {
            if(routeDayId !== idRouteDay) {
                newCurrentRoutesDay[routeDayId] = stores;
            }
        }
        setCurrentRoutesDay(newCurrentRoutesDay);

        oncloseRouteDay(idRouteDay);
    }

    /**
     * Handle store modification save for a specific route day.
     * Updates positions based on current order.
     */
    const handleSaveRouteModification = async (idRouteDay: string) => {
        // Update positions based on current array order
        const storesInRouteDay = currentRoutesDay[idRouteDay];
        
        if (!storesInRouteDay) return;
        
        const updatedStoresInRouteDay = storesInRouteDay.map((store, index) => ({
            ...store,
            position_in_route: index,
        }));

        // TODO: Call parent save callback here if needed
        await onSaveRouteModification(idRouteDay, updatedStoresInRouteDay);
        
        setCurrentRoutesDay((prev) => ({
            ...prev,
            [idRouteDay]: updatedStoresInRouteDay,
        }));
        
    };

    const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
        setStartDateSelected(start);
        setEndDateSelected(end);
    }

    const handleApplyDateRange = (startDate: Dayjs | null, endDate: Dayjs | null, routeDaysToFindRouteTransactions: Record<string, DraggableRouteDayStore[]>) => {
        if (startDate && endDate) {
            // Convert Dayjs to Date and call the parent callback
            onRequireRouteTransactions(startDate.toDate(), endDate.toDate(), Object.values(routeDaysToFindRouteTransactions).flat().map(store => store.id_store));
        }
    }

    return (
        <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
            <div className="flex flex-col  bg-system-third-background p-1 rounded-lg gap-2">
                <h2 className="text-lg md:text-xl font-bold mb-4">Administración de días en ruta</h2>
                {/* <div className="flex flex-row items-center gap-2">
                    <span className="text-center align-middle">Abrir callout: </span><Switch />
                </div> */}
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
                        onClick={() => handleApplyDateRange(startDateSelected, endDateSelected, currentRoutesDay)}>
                            Aplicar fechas
                    </Button>
                </div>
            </div>
            <DragDropProvider 
                // onDragEnd={handleDragOver}
                onDragOver={handleDragOver}
                >
                <div className="ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2 overflow-x-auto">
                    {Object.entries(currentRoutesDay).map(([idRouteDay, stores]) => (
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
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}