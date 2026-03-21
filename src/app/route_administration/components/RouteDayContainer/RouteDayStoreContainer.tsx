import DroppableColumn from "@/shared/components/DragAndDropContainer/components/DroppableColumn"
import DraggableItem from "@/shared/components/DragAndDropContainer/components/DraggableItem";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import SimpleCard from "@/shared/components/Cards/SimpleCard/SimpleCard";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord } from "@/shared/utils/strings/utils";
import RouteDTO from "@/application/dto/RouteDTO";
import { getRouteDayFromRoutesList, getRouteWhereRouteDayBelongs } from "@/shared/utils/routes/utils";

// Core - constants
import { DAYS } from "@/core/constants/Days";
import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";


type RouteDayStoreContainerProps = {
    idRouteDayColumn: string;
    storesToAttend: RouteDayStoreDTO[];
    storesMap: Map<string, StoreDTO>;
    routes: RouteDTO[]; // List of routes to find where each route day belongs
}

export default function RouteDayStoreContainer({ idRouteDayColumn, storesToAttend, storesMap, routes }: RouteDayStoreContainerProps) {
    // State 
    const [inputValue, setInputValue] = useState<string>('');
    
    
    // Find the route where this route day belongs
    const routeWhereDayBelongs: RouteDTO | null = getRouteWhereRouteDayBelongs(routes, idRouteDayColumn);
    const routeDayBeingModified = getRouteDayFromRoutesList(routes, idRouteDayColumn);

    // Build the column title: "Ruta X - Día"
    let columnTitle: string = "Día no encontrado";

    if (routeWhereDayBelongs !== null) {
        const routeName = routeWhereDayBelongs.route_name ?? "Ruta sin nombre";
        columnTitle = routeName;

        // Add the day name if we found the route day
        if (routeDayBeingModified !== null) {
            const { id_day } = routeDayBeingModified;
            const dayInfo = DAYS[id_day];

            if (dayInfo) {
                columnTitle += ` - ${dayInfo.day_name}`;
            }
        }
    }

    return (
        <div className="min-w-[280px] flex flex-col">
            <div className="p-2 bg-system-primary-background rounded-t-lg flex flex-col">
                <span className="text-center font-bold text-lg">{capitalizeFirstLetterOfEachWord(columnTitle)}</span>
                <div>
                    <Autocomplete
                    options={Array.from(storesMap.values()).map((item) => { return { id: item.id_store, ...item }})}
                    getOptionKey={(option) => option.id_store}
                    getOptionLabel={(option) => option.store_name ?? "Nombre no disponible"}
                    inputValue={inputValue}
                    onChange={(event, newValue) => { 
                        setInputValue("");
                        // onAddItem(newValue);
                    }}
                    renderOption={(props, option) => (
                        <li
                        {...props}
                        key={option.id_store}
                        // onMouseEnter={() => onHoverOption(option)} // Detect hover
                        // onMouseLeave={() => onHoverOption(null)} // Detect hover
                        >
                            <div className="flex flex-col">
                                <span>{option.store_name ?? "Nombre no disponible"}</span>
                                <span className="text-sm">{getAddressOfStore(option)}</span>
                            </div>
                        </li>
                    )}
            
                    renderInput={(params) => <TextField 
                        onChange={(event) => { setInputValue(event.target.value); }}
                        {...params} label="Add Item" />}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-system-secondary-background rounded-b-lg min-h-[200px]">
                <DroppableColumn id={idRouteDayColumn}>
                    {storesToAttend.map((store, index) => {
                        let storeName: string = "Not found";
                        let storeAddress: string = "Not found";
                        
                        const { id_route_day_store, id_store } = store;
                        const storeDetails = storesMap.get(id_store);
                        if (storeDetails) {
                            const { store_name } = storeDetails;
                            storeName = store_name === null ? "No disponible" : store_name;
                            storeAddress = getAddressOfStore(storeDetails);
                        }

                        return (
                            <DraggableItem key={id_route_day_store} id={id_route_day_store} index={index} column={idRouteDayColumn}>
                                <SimpleCard 
                                    cardName={capitalizeFirstLetterOfEachWord(storeName)}
                                    cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                                />
                            </DraggableItem>
                        );
                    })}
                </DroppableColumn>
            </div>
        </div>
    );
}