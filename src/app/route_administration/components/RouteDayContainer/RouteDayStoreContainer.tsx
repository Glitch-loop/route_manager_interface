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
import { Autocomplete, Button, Collapse, Dialog, IconButton, Switch, TextField, Tooltip } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";


type RouteDayStoreContainerProps = {
    idRouteDayColumn: string;
    storesToAttend: RouteDayStoreDTO[];
    storesMap: Map<string, StoreDTO>;
    routes: RouteDTO[]; // List of routes to find where each route day belongs
    routeTransactionsMap: Map<string, RouteTransactionDTO[]>; // Map of store ID to list of route transactions
    onAddStore: (idRouteDay: string, idStore: string) => void;
    onRemoveStores: (idsRouteDayStore: string[]) => void; // Callback to remove stores from route day, receives list of id_route_day_store to remove
    onCancelRouteModification: (idRouteDay: string) => void; // Callback when user cancels modifications
    onSaveRouteModification: (idRouteDay: string) => void;
    onResetRouteModification: (idRouteDay: string) => void;
}

type RouteDayContainerActions = "reset" | "remove" | "save" | "close";

export default function RouteDayStoreContainer({ 
        idRouteDayColumn, 
        storesToAttend, 
        storesMap, 
        routes, 
        routeTransactionsMap,
        onAddStore,
        onRemoveStores,
        onCancelRouteModification,
        onSaveRouteModification,
        onResetRouteModification,
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
    const calculateColumnEstimatedTotal = (deleteModeActive: boolean, selectedStores: Set<string>): number => {
        let totalAmount: number = 0;
        if (deleteModeActive) {
            totalAmount = storesToAttend.reduce((total, store) => {
                if (selectedStores.has(store.id_route_day_store)) {
                    return total; // Skip stores selected for deletion
                } else {
                    return total + calculateStoreTotalSales(store.id_store);
                }
            }, 0);
        } else {
            totalAmount = storesToAttend.reduce((total, store) => {
                return total + calculateStoreTotalSales(store.id_store);
            }, 0);
        }

        return totalAmount;
    };

    // State 
    const [inputValue, setInputValue] = useState<string>('');
    const [onlyViewMode, setOnlyViewMode] = useState<boolean>(true);
    const [showInformation, setShowInformation] = useState<boolean>(true);
    const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("name");
    const [menuExpanded, setMenuExpanded] = useState<boolean>(true);
    
    // Selected states
    const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set()); // Track selected stores for deletion
    const [selectAll, setSelectAll] = useState<boolean>(false);
    
    // Delete mode states
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    
    // Find the route where this route day belongs
    const routeWhereDayBelongs: RouteDTO | null = getRouteWhereRouteDayBelongs(routes, idRouteDayColumn);
    const routeDayBeingModified = getRouteDayFromRoutesList(routes, idRouteDayColumn);

    // Dialog states
    const [dialogAction, setDialogAction] = useState<RouteDayContainerActions | null>(null);

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

    const handleStartDeleteMode = () => { setDeleteMode(!deleteMode); }

    const handleCancelDeleteMode = () => {
        if (deleteMode) {
            // Just exit delete mode without removing anything
            setDeleteMode(false);
            setSelectedStores(new Set());
        }
    }

    const handleAcceptDeleteStores = () => {
        if (deleteMode) {
            // Remove selected stores
            if (selectedStores.size > 0) {
                onRemoveStores(Array.from(selectedStores));
            }
            setDeleteMode(false);
            setSelectedStores(new Set());
        }
    }

    const handleResetRouteModification = () => { onResetRouteModification(idRouteDayColumn); }

    const handleSaveModifications = () => {
        onSaveRouteModification(idRouteDayColumn);
    }

    const handleCloseRouteModification = () => {
        onCancelRouteModification(idRouteDayColumn);
    }

    const handleOpenDialog = (actionType: RouteDayContainerActions) => {
        setDialogAction(actionType);
    }
    
    const handleCloseDeleteDialog = () => {
        setDialogAction(null);

        if (dialogAction === "remove") {
            handleCancelDeleteMode();
        }
    }

    const handleAcceptDialog = () => {
        if (dialogAction === "remove") {
            handleAcceptDeleteStores();
        } else if (dialogAction === "reset") {
            handleResetRouteModification();
        } else if (dialogAction === "save") {
            handleSaveModifications();
        }else if (dialogAction === "close") {
            handleCloseRouteModification();
        }

        setDialogAction(null);
    }

    return (
        <div className="min-w-[400px] max-w-[550px] h-full flex flex-col bg-system-primary-background rounded-lg">
            <Dialog open={dialogAction !== null} onClose={() => handleCloseDeleteDialog()}>
                <div className="p-3 flex flex-col gap-2 justify-center items-center">
                    <h3 className="text-center font-bold text-lg">¿Estas seguro de hacer la acción?</h3>
                    { dialogAction === "remove" && 
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-center text-red-600 font-semibold">
                                Se eliminarán {selectedStores.size} cliente(s) de este día de ruta.
                            </span>
                            <span className="text-center font-bold">
                                Después aplica los cambios para que se guarden las modificaciones realizadas.
                            </span>
                        </div>
                    }
                    { dialogAction === "save" && 
                        <span className="text-center text-red-600 font-semibold">
                            Se guardarán los cambios realizados en este día de ruta.
                        </span>
                    }
                    { dialogAction === "reset" && 
                        <span className="text-center text-red-600 font-semibold">
                            Se restablecerán los cambios realizados en este día de ruta hasta el último punto de guardado.
                        </span>
                    }
                    { dialogAction === "close" && 
                        <span className="text-center text-red-600 font-semibold">
                            Se cerrará la modificación de este día de ruta. Cualquier cambio no guardado se perderá.
                        </span>
                    }

                    <div className="flex flex-row gap-5 justify-center mt-5">
                        <Button
                            variant="contained" 
                            color="success"
                            onClick={handleAcceptDialog}>
                                Aceptar
                        </Button>
                    <Button 
                        variant="contained" 
                        color="warning" 
                        onClick={handleCloseDeleteDialog}>
                            Cancelar
                    </Button>
                </div>

                </div>
            </Dialog>
            <div className="p-2  flex flex-col">
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
                        <Tooltip 
                            title={"Remover clientes de este día"}
                            placement="top"
                            enterDelay={300}
                            arrow>
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
                                onClick={() => deleteMode ? handleCancelDeleteMode() : handleStartDeleteMode()}
                                className="h-fit my-auto shadow-md"
                                size="small">
                                    <DeleteOutline />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                {/* Menu toggle button */}
                <div 
                    className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                    onClick={() => setMenuExpanded(!menuExpanded)}>
                    <span className="font-semibold text-sm text-gray-600">
                        {deleteMode ? "Opciones de eliminación" : "Opciones de cliente"}
                    </span>
                    {menuExpanded ? <ExpandLess /> : <ExpandMore />}
                </div>
                {/* Menu - Collapsible */}
                <Collapse in={menuExpanded}>
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
                            <div className="flex flex-row gap-3">
                                <div className="flex basis-4/5">   
                                    <Autocomplete
                                        options={Array.from(storesMap.values()).map((item) => { return { id: item.id_store, ...item }})}
                                        className="w-full"
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
                            <Tooltip 
                                title={"Revierte los cambios al ultimo estado guardado"}
                                placement="top"
                                enterDelay={300}
                                arrow>
                                <Button
                                    variant="contained"
                                    onClick={() => handleOpenDialog("reset")}>Reset</Button>
                            </Tooltip>
                            </div>
                        </div>            
                    }
                </div>
                </Collapse>
            </div>
            {/* Estimated total section */}
            <div className="flex flex-row justify-end items-center px-4 py-2 ">
                <span className="font-bold text-lg mr-2">Total vendido entre el rango de fechas seleccionado: </span>
                <span className="font-bold text-lg text-black">
                    {formatNumberAsAccountingCurrency(calculateColumnEstimatedTotal(deleteMode, selectedStores))}
                </span>
            </div>
            {/* Droppable container */}
            <div className="flex-1 overflow-y-auto bg-system-secondary-background min-h-[200px]"
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
                                    className={deleteMode ? "relative p-2 cursor-pointer" : "relative p-2 cursor-default"}>
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
            {/* Actions buttons bar - Always visible */}
            <div className="bg-system-primary-background w-full flex flex-row gap-5 justify-center py-2 flex-shrink-0">
                { deleteMode ? 
                    <Button
                        variant="contained" 
                        color="error"
                        onClick={() => handleOpenDialog("remove")}>
                            Aceptar
                    </Button> :
                    <Button
                        variant="contained" 
                        color="success"
                        onClick={() => handleOpenDialog("save")}>
                            Guardar
                    </Button>
                }
                <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={() => deleteMode ? handleCancelDeleteMode() : handleOpenDialog("close")}> 
                        { deleteMode ? "Cancelar eliminación" : "Cerrar día de ruta" }
                </Button>
            </div>
        </div>
    );
}