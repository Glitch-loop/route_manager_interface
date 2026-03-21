import DroppableColumn from "@/shared/components/DragAndDropContainer/components/DroppableColumn"
import DraggableItem from "@/shared/components/DragAndDropContainer/components/DraggableItem";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import SimpleCard from "@/shared/components/Cards/SimpleCard/SimpleCard";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord, formatNumberAsAccountingCurrency } from "@/shared/utils/strings/utils";
import RouteDTO from "@/application/dto/RouteDTO";
import { getRouteDayFromRoutesList, getRouteWhereRouteDayBelongs } from "@/shared/utils/routes/utils";
import NumericValueCard from "@/shared/components/Cards/NumericValueCard/NumericValueCard";

// UI components
import { LockOutline, LockOpen, VisibilityOff, Visibility, DeleteOutline } from "@mui/icons-material"

// Core - constants
import { DAYS } from "@/core/constants/Days";
import { useState } from "react";
import { Autocomplete, IconButton, Switch, TextField, Tooltip } from "@mui/material";


type RouteDayStoreContainerProps = {
    idRouteDayColumn: string;
    storesToAttend: RouteDayStoreDTO[];
    storesMap: Map<string, StoreDTO>;
    routes: RouteDTO[]; // List of routes to find where each route day belongs
    onAddStore: (idRouteDay: string, idStore: string) => void;
}

export default function RouteDayStoreContainer({ 
        idRouteDayColumn, 
        storesToAttend, 
        storesMap, 
        routes, 
        onAddStore 
    }: RouteDayStoreContainerProps) { 
    // State 
    const [inputValue, setInputValue] = useState<string>('');
    const [onlyViewMode, setOnlyViewMode] = useState<boolean>(true);
    const [showInformation, setShowInformation] = useState<boolean>(true);
    const [deleteMode, setDeleteMode] = useState<boolean>(true);
    const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("name");

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
                <div className="flex flex-row justify-start items-center my-2">
                    <div className="flex basis-1/2 gap-2 items-center">
                        <h3 className="text-center align-middle font-bold text-lg">{capitalizeFirstLetterOfEachWord(columnTitle)}</h3>
                        <Tooltip 
                            title={onlyViewMode ? "Cambiar a modo edición" : "Cambiar a modo solo vista"}
                            placement="top"
                            enterDelay={300}
                            arrow>
                            <IconButton
                                sx={{
                                    backgroundColor: '#f5a623',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#e09620',
                                    },
                                    width: 40,
                                    height: 40,
                                }}
                                onClick={() => setOnlyViewMode(!onlyViewMode)}
                                className="h-fit my-auto shadow-md"
                                size="small">
                                    
                                {onlyViewMode ? <LockOutline /> : <LockOpen />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip 
                            title={showInformation ? "Ocultar información" : "Mostrar información"}
                            placement="top"
                            enterDelay={300}
                            arrow>
                                <IconButton
                                    sx={{
                                        backgroundColor: '#f58220',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#e0741a',
                                        },
                                        width: 40,
                                        height: 40,
                                    }}
                                    onClick={() => setShowInformation(!showInformation)}
                                    className="h-fit my-auto shadow-md"
                                    size="small">
                                        
                                    {showInformation ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                        </Tooltip>
                    </div>
                    <div className="flex basis-1/2 justify-end mr-3">
                        <IconButton
                            sx={{
                                backgroundColor: '#f3281a',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#c72418',
                                },
                                width: 40,
                                height: 40,
                            }}
                            onClick={() => setDeleteMode(!deleteMode)}
                            className="h-fit my-auto shadow-md"
                            size="small">
                                <DeleteOutline />
                        </IconButton>
                    </div>
                </div>
                <div className="flex flex-row w-full justify-center items-center gap-2">
                    <div className="flex flex-col gap-1 w-full">
                        <h5 className="font-bold text-lg">Agregar cliente</h5>
                        <div className="flex flex-row">
                            <Switch 
                                checked={searchStoreBy === "name"}
                                onChange={(e) => setSearchStoreBy(e.target.checked ? "name" : "address")}
                                size="small"/>
                            <span className="text-sm">{`Buscar por ${searchStoreBy === "name" ? "nombre" : "dirección"}`}</span>
                        </div>
                        <Autocomplete
                            options={Array.from(storesMap.values()).map((item) => { return { id: item.id_store, ...item }})}
                            limitTags={10}
                            getOptionKey={(option) => option.id_store}
                            getOptionLabel={(option) => searchStoreBy === "name" ? option.store_name ?? "Nombre no disponible" : getAddressOfStore(option)}
                            inputValue={inputValue}
                            onChange={(event, newValue) => { 
                                setInputValue("");
                                if (newValue) {
                                    onAddStore(idRouteDayColumn, newValue.id);
                                }
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
            </div>
            <div className="flex-1 overflow-y-auto bg-system-secondary-background rounded-b-lg min-h-[200px]"
                style={{scrollBehavior: 'smooth'}}
                >
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


                        if (onlyViewMode) {
                            return (
                                <div key={id_route_day_store} className="p-2 max-w-[500px]">
                                    <NumericValueCard
                                        cardName={capitalizeFirstLetterOfEachWord(storeName)}
                                        cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                                        numericValue={formatNumberAsAccountingCurrency(1000)}/>
                                </div>
                            )
                        } else {
                            return (
                                <DraggableItem key={id_route_day_store} id={id_route_day_store} index={index} column={idRouteDayColumn}>
                                    <div className="p-2">
                                        <NumericValueCard 
                                            cardName={capitalizeFirstLetterOfEachWord(storeName)}
                                            cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                                            numericValue={formatNumberAsAccountingCurrency(0)}/>
                                    </div>
                                </DraggableItem> 
                            )
                        }
                    })}
                </DroppableColumn>
            </div>
        </div>
    );
}