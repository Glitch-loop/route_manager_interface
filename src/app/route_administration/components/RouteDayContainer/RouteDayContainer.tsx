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
import { generateUUIDv4 } from "@/utils/generalUtils";
import { Dayjs } from "dayjs";

// Extended type that adds 'id' property for dnd-kit compatibility
type DraggableRouteDayStore = RouteDayStoreDTO & { id: string };


type RouteDayContainerProps = {
    routesDay: RouteDayDTO[];
    storeMap: Map<string, StoreDTO>; // id_store -> StoreDTO
    routes: RouteDTO[]; // List of routes to find where each route day belongs
}


export default function RouteDayContainer({ 
        routesDay,
        storeMap, 
        routes
    }: 
    RouteDayContainerProps) {
    
    // State to keep track of stores in each route day column
    // Key: id_route_day, Value: array with 'id' property for dnd-kit compatibility
    const [currentRoutesDay, setCurrentRoutesDay] = useState<Record<string, DraggableRouteDayStore[]>>({});

    // Days selected
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

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
        
        console.log("New initial state: ", initialState)

        setCurrentRoutesDay(initialState);
    }, [routesDay]);

    // Handle drag over event - moves items between columns
    const handleDragOver = (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragOver']>>[0]) => {
        setCurrentRoutesDay((items) => {
            console.log("Items: ", items)
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

    const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
        setStartDateSelected(start);
        setEndDateSelected(end);
    }

    const handleApplyDateRange = () => {
        console.log("Applying date range: ", startDateSelected, endDateSelected);
    }

    return (
        <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
            <div className="flex flex-col  bg-system-third-background p-1 rounded-lg gap-2">
                <h2 className="text-lg md:text-xl font-bold mb-4">Administración de días en ruta</h2>
                {/* <div className="flex flex-row items-center gap-2">
                    <span className="text-center align-middle">Abrir callout: </span><Switch />
                </div> */}
                <RangeDateSelection onRangeChange={handleDateRangeChange} />
                <div className="flex flex-row justify-center items-center w-full">
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleApplyDateRange}>
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
                            onAddStore={handleAddNewStore}
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}