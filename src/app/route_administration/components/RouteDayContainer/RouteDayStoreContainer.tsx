import DroppableColumn from "@/shared/components/DragAndDropContainer/components/DroppableColumn"
import DraggableItem from "@/shared/components/DragAndDropContainer/components/DraggableItem";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord, formatNumberAsAccountingCurrency } from "@/shared/utils/strings/utils";
import RouteDTO from "@/application/dto/RouteDTO";
import { getRouteDayFromRoutesList, getRouteWhereRouteDayBelongs } from "@/shared/utils/routes/utils";
import NumericValueCard from "@/shared/components/Cards/NumericValueCard/NumericValueCard";
import RouteTransactionDTO from "@/application/dto/RouteTransactionDTO";
import DAY_OPERATIONS from "@/core/enums/DayOperations";

// UI components
import { LockOutline, LockOpen, VisibilityOff, Visibility, DeleteOutline, RemoveCircleOutline } from "@mui/icons-material"

// Core - constants
import { DAYS } from "@/core/constants/Days";
import { useState } from "react";
import { Autocomplete, Button, Dialog, IconButton, Switch, TextField, Tooltip } from "@mui/material";


type RouteDayStoreContainerProps = {
    idRouteDayColumn: string;
    storesToAttend: RouteDayStoreDTO[];
    storesMap: Map<string, StoreDTO>;
    routes: RouteDTO[]; // List of routes to find where each route day belongs
    routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // Map of store ID to list of route transactions
    onAddStore: (idRouteDay: string, idStore: string) => void;
}

export default function RouteDayStoreContainer({ 
        idRouteDayColumn, 
        storesToAttend, 
        storesMap, 
        routes, 
        routeTransactionsMap,
        onAddStore 
    }: RouteDayStoreContainerProps) { 

    /**
     * Calculate total sales amount for a store from its transactions.
     * Only counts transactions with operation type "sales".
     * @param storeId - The ID of the store
     * @returns Total sales amount or 0 if no transactions
     */
    const calculateStoreTotalSales = (storeId: string): number => {
        const transactions = routeTransactionsMap.get(storeId);
        if (!transactions || transactions.length === 0) {
            return 0;
        }

        let total = 0;
        for (const transaction of transactions) {
            for (const description of transaction.transaction_description) {
                // Only count sales operations
                if (description.id_transaction_operation_type === DAY_OPERATIONS.sales) {
                    total += description.price_at_moment * description.amount;
                }
            }
        }
        return total;
    };

    /**
     * Calculate total estimated sales for all stores in this column.
     */
    const calculateColumnEstimatedTotal = (): number => {
        return storesToAttend.reduce((total, store) => {
            return total + calculateStoreTotalSales(store.id_store);
        }, 0);
    };

    // State 
    const [inputValue, setInputValue] = useState<string>('');
    const [onlyViewMode, setOnlyViewMode] = useState<boolean>(true);
    const [showInformation, setShowInformation] = useState<boolean>(true);
    const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("name");
    
    // Selected states
    const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set()); // Track selected stores for deletion
    const [selectAll, setSelectAll] = useState<boolean>(false);
    
    // Delete mode states
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    
    // Find the route where this route day belongs
    const routeWhereDayBelongs: RouteDTO | null = getRouteWhereRouteDayBelongs(routes, idRouteDayColumn);
    const routeDayBeingModified = getRouteDayFromRoutesList(routes, idRouteDayColumn);

    // Dialog states
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

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

    // Handlers
    const handleSelect = (id_route_day_store: string) => {
        if (deleteMode) {
            if (selectedStores.has(id_route_day_store)) {
                // If already selected, deselect it
                const newSelected = new Set(selectedStores);
                newSelected.delete(id_route_day_store);
                setSelectedStores(newSelected);
            } else {
                // If not selected, select it
                setSelectedStores(new Set(selectedStores).add(id_route_day_store));
            }
        }
    }   
    
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStores(new Set());
        } else {
            const allStoreIds = storesToAttend.map(store => store.id_route_day_store);
            setSelectedStores(new Set(allStoreIds));
        }

        setSelectAll(!selectAll);
    }

    const handleStartDeleteMode = () => {
        setDeleteMode(!deleteMode)
        // setOnlyViewMode(true);
    }


    const handleCancelDeleteMode = () => {
        setDeleteMode(false);
        setSelectedStores(new Set());
    }

    const handleAcceptDeleteStores = () => {
        setDeleteMode(false);
        setSelectedStores(new Set());   
    }


    
    return (
        <div className="min-w-[280px] flex flex-col">
            {/* <Dialog open={showDeleteDialog}>

            </Dialog> */}
            <div className="p-2 bg-system-primary-background rounded-t-lg flex flex-col">
                {/* Title and main actions */}
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
                            onClick={() => handleStartDeleteMode()}
                            className="h-fit my-auto shadow-md"
                            size="small">
                                <DeleteOutline />
                        </IconButton>
                    </div>
                </div>
                {/* Menu */}
                <div className="flex flex-row w-full justify-center items-center gap-2">
                    { deleteMode ?
                        <div className="flex flex-row w-full justify-between">
                            <h5 className="font-bold text-lg">Eliminar clientes</h5>
                            <Button
                                onClick={handleSelectAll}
                                color="info"
                                variant="contained"
                                >
                                { selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
                            </Button>
                        </div> :
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
                    }
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-system-secondary-background rounded-b-lg min-h-[200px]"
                style={{scrollBehavior: 'smooth'}}>
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
                                <div
                                    key={id_route_day_store} 
                                    onDoubleClick={() => { handleSelect(id_route_day_store); }}
                                    className={deleteMode ? "relative p-2 cursor-pointer" : "relative p-2"}>
                                    { selectedStores.has(id_route_day_store) && 
                                        <div className="absolute right-3 top-3 bg-red-600 w-6 h-6 text-slate-200 rounded-full flex items-center justify-center">
                                            <RemoveCircleOutline fontSize="small" />
                                        </div>
                                    }
                                    <NumericValueCard
                                        cardName={capitalizeFirstLetterOfEachWord(storeName)}
                                        cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                                        numericValue={formatNumberAsAccountingCurrency(calculateStoreTotalSales(id_store))}/>
                                </div>
                            )
                        } else {
                            return (
                                <DraggableItem key={id_route_day_store} id={id_route_day_store} index={index} column={idRouteDayColumn}>
                                    <div
                                        onDoubleClick={() => { handleSelect(id_route_day_store); }}
                                        className={"relative p-2"}>
                                        { selectedStores.has(id_route_day_store) && 
                                            <div className="absolute right-3 top-3 bg-red-600 w-6 h-6 text-slate-200 rounded-full flex items-center justify-center">
                                                <RemoveCircleOutline fontSize="small" />
                                            </div>
                                        }
                                        <NumericValueCard 
                                            cardName={capitalizeFirstLetterOfEachWord(storeName)}
                                            cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
                                            numericValue={formatNumberAsAccountingCurrency(calculateStoreTotalSales(id_store))}/>
                                    </div>
                                </DraggableItem> 
                            )
                        }
                    })}
                </DroppableColumn>
            </div>
            {/* Estimated total section */}
            <div className="flex flex-row justify-end items-center px-4 py-2 bg-system-primary-background">
                <span className="font-bold text-lg mr-2">Estimado</span>
                <span className="font-bold text-lg text-green-600">
                    {formatNumberAsAccountingCurrency(calculateColumnEstimatedTotal())}
                </span>
            </div>
            <div className="w-full flex flex-row gap-5 justify-center">
                { deleteMode ? 
                    <Button
                        variant="contained" 
                        color="error"
                        onClick={handleAcceptDeleteStores}>
                            Eliminar
                    </Button> :
                    <Button
                        variant="contained" 
                        color="success"
                        onClick={handleAcceptDeleteStores}>
                            Guardar
                    </Button>
                }
                <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={handleCancelDeleteMode}>
                        Cancelar
                </Button>
            </div>
        </div>
    );
}