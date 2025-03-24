import { useEffect, useState } from "react";


// Controllers
import { getInventoryOperationDescriptionsOfWorkDay, getInventoryOperationsOfWorkDay } from "@/controllers/InventoryController";
import { getInformationOfStores, getStoresFromRouteTransactions, getStoresOfRouteDay } from "@/controllers/StoreController";
import { getRouteTransactionOperationDescriptionsFromWorkDay, getRouteTransactionOperationsFromWorkDay, getRouteTransactionsFromWorkDay, getTotalOfTypeOperationOfRouteTransaction } from "@/controllers/RouteTransactionsController";

// Interface
import { 
    IDay, 
    IDayGeneralInformation, 
    IDayOperation, 
    IInventoryOperation, 
    IInventoryOperationDescription, 
    IResponse, 
    IRoute, 
    IRouteDay, 
    IRouteDayStores, 
    IRouteTransaction, 
    IRouteTransactionOperation, 
    IRouteTransactionOperationDescription, 
    IStore, 
    IStoreStatusDay, 
    IUser
} from "@/interfaces/interfaces";

// Utils
import { getAddressOfStore } from "@/utils/storeUtils";

// Components
import IconButtonWithNotification from "../general/IconButtonWithNotification";
import { FaChevronRight } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa";
import CardRouteList from "./CardRouteList";
import ButtonWithNotification from "../general/ButtonWithNotificaion";
import HeaderRouteList from "./HeaderRouteList";

// Utils
import { 
    cast_string_to_date_hour_format, 
    cast_string_to_hour_format, 
    differenceBetweenDatesInSeconds, 
    differenceBetweenDatesWithFormat, 
    isDateGreater,
    timestamp_format
} from "@/utils/dateUtils";
import { getVendorById } from "@/controllers/VendorController";
import { isTypeIInventoryOperation, isTypeIRouteTransaction } from "@/utils/guards";
import { getNameOfOperationType } from "@/utils/dayOperationUtils";
import { 
    determineDayOperationTypeBackgroundColor, 
    determineStoreContextBackgroundColor 
} from "@/utils/stylesUtils";
import { formatToCurrency } from "@/utils/saleFunctionUtils";
import DAYS_OPERATIONS from "@/utils/dayOperations";
import { createSubscriptionToInventoryOperations, createSubscriptionToRouteTransactions } from "@/controllers/WorkDayController";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord, generateUUIDv4 } from "@/utils/generalUtils";
import { enumStoreStates } from "@/interfaces/enumStoreStates";

function createRouteDayOperations(dayOperations:(IRouteTransaction|IInventoryOperation)[], plannedStores: IRouteDayStores[]):(IRouteTransaction|IInventoryOperation)[] {
    let listOfDayOperations:(IRouteTransaction|IInventoryOperation)[] = [];
    let pendingStores:IRouteDayStores[] = [];
    let id_work_day:string = '';
    let pendingStoreARouteTransactions:IRouteTransaction[] = [];

    const validDayOperations:(IRouteTransaction|IInventoryOperation)[] = dayOperations.filter((dayOperation:IRouteTransaction|IInventoryOperation) => {
        if (isTypeIRouteTransaction(dayOperation)) return dayOperation.id_route_transaction !== '';
        if (isTypeIInventoryOperation(dayOperation)) return dayOperation.id_inventory_operation !== '';
    })


    validDayOperations.sort((a, b) => {
        if (a.date < b.date) return -1
        else if (a.date > b.date) return 1
        else return 0
    })

    

    // Determining pending stores
    if (plannedStores.length > 0) {
        pendingStores = plannedStores.reduce((pendingStores:IRouteDayStores[], currentStore) => {
            const isAttendedStore:boolean = validDayOperations.some((dayOperation) => 
                isTypeIRouteTransaction(dayOperation) ? dayOperation.id_store === currentStore.id_store : false);
    
            console.log("isAttendedStore: ", isAttendedStore)
            if (!isAttendedStore) pendingStores.push(currentStore);
            
            return pendingStores;
        }, []);

        if (validDayOperations[0]) id_work_day = validDayOperations[0].id_work_day;

        pendingStoreARouteTransactions = pendingStores.map((pendingStore:IRouteDayStores) => {
            return {
                id_route_transaction: '',
                date: timestamp_format(),
                state: 1,
                cash_received: 0,
                id_work_day: id_work_day,
                id_payment_method: '',
                id_store: pendingStore.id_store
            }
        });
    } else {
        const pendingDayOperations:(IRouteTransaction|IInventoryOperation)[] = dayOperations.filter((pendingDayOperatons:(IRouteTransaction|IInventoryOperation)) => {
            if (isTypeIRouteTransaction(pendingDayOperatons)) return pendingDayOperatons.id_route_transaction === '';
            if (isTypeIInventoryOperation(pendingDayOperatons)) return pendingDayOperatons.id_inventory_operation === '';
        });

        pendingStoreARouteTransactions = pendingDayOperations.reduce((pendingStores:IRouteTransaction[], currentDayOperation:IRouteTransaction|IInventoryOperation) => {
            if (isTypeIRouteTransaction(currentDayOperation)) {
                const isAttendedStore:boolean = validDayOperations.some((dayOperation) => 
                    isTypeIRouteTransaction(dayOperation) ? dayOperation.id_store === currentDayOperation.id_store : false);
        
                console.log("isAttendedStore: ", isAttendedStore)
                if (!isAttendedStore) pendingStores.push(currentDayOperation);

            }
            return pendingStores;
        }, []);
    }



    listOfDayOperations = [
        ...validDayOperations,
        ...pendingStoreARouteTransactions,
    ]        

    console.log(listOfDayOperations)
    return listOfDayOperations;
}

function RouteList({ workDay }:{ workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay }) {
    const initializeElement = async () => {
        const { id_vendor } = workDay;
        const setOfStores = new Set<string>();
        const operationsOfTheDay:(IRouteTransaction|IInventoryOperation)[] = []

        // Related to vendor
        setVendor(await getVendorById(id_vendor));

        // Related to route transaction
        const routeTransactions:IRouteTransaction[] = await getRouteTransactionsFromWorkDay(workDay);
        const routeTransactionOperations:IRouteTransactionOperation[] = await getRouteTransactionOperationsFromWorkDay(routeTransactions);
        const routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[] = await getRouteTransactionOperationDescriptionsFromWorkDay(routeTransactionOperations);

        setRouteTransactions(routeTransactions);
        setRouteTransactionOperations(routeTransactionOperations);
        setRouteTransactionOperationDescriptions(routeTransactionOperationDescriptions);

        // Related to inventory operations
        const inventoryOperations:IInventoryOperation[] = await getInventoryOperationsOfWorkDay(workDay);

        setInventoryOperations(inventoryOperations);

        // Related to stores
        const storesInDay:IRouteDayStores[] = await getStoresOfRouteDay(workDay)
        // Getting the planned stores of the day
        storesInDay.forEach((store:IRouteDayStores) => {
            const {id_store} = store;
            if (setOfStores.has(id_store) === false) {
                setOfStores.add(id_store);
            }
        });

        // Getting stores from route transactions
        routeTransactions.forEach((routeTransaction:IRouteTransaction) => {
            const { id_store } = routeTransaction;
            if (setOfStores.has(id_store) === false) {
                setOfStores.add(id_store);
            }
        });

        // Getting information of stores
        const storesInTheDay:IStore[] = await getInformationOfStores([...setOfStores.entries()].map(([id_store, value]) => { return id_store; }))
        const storesWithStatus:Record<string, IStore&IStoreStatusDay&IRouteDayStores> = {};
        
        storesInTheDay.forEach((store:IStore) => {
            const { id_store } = store;
            const plannedStoreFound:IRouteDayStores|undefined = storesInDay.find((plannedStore:IRouteDayStores) => {
                return plannedStore.id_store === id_store
            })

            if (plannedStoreFound) {
                const {id_route_day_store, position_in_route, id_route_day} = plannedStoreFound;
                storesWithStatus[id_store] = {
                    ...store,
                    route_day_state: 0,
                    id_route_day_store: id_route_day_store,
                    position_in_route: position_in_route,
                    id_route_day: id_route_day
                }                
            } else {
                storesWithStatus[id_store] = {
                    ...store,
                    route_day_state: 0,
                    id_route_day_store: '',
                    position_in_route: -1,
                    id_route_day: ''
                }
            }  
        });
        setPlannedStores(storesInDay);
        setStores(storesWithStatus);

        // Ordering inventory operations and route transactions in a single state
        routeTransactions.forEach((routeTransaction:IRouteTransaction) => {
            operationsOfTheDay.push(routeTransaction);
        });
        
        inventoryOperations.forEach((inventoryOperation:IInventoryOperation) => {
            operationsOfTheDay.push(inventoryOperation);
        });

        operationsOfTheDay.sort((a:IRouteTransaction|IInventoryOperation, b:IRouteTransaction|IInventoryOperation) => {
            let isGreater:number = 0
            if (isDateGreater(a.date, b.date)) {
                isGreater = 1;
            } else {
                isGreater = -1;
            }

            return isGreater;
        });

        setDayOperations(createRouteDayOperations(operationsOfTheDay, storesInDay));

        // Creating channel for listening the proces of the route
        createSubscriptionToInventoryOperations((payload:RealtimePostgresChangesPayload<IInventoryOperation>) => { handlerWorkDayInventoryOperations(payload, plannedStores); });
        createSubscriptionToRouteTransactions((payload:RealtimePostgresChangesPayload<IRouteTransaction>) => { handlerWorkDayRouteTransactions(payload); });
    }

    // Channels handlers
    const handlerWorkDayRouteTransactions = async (payload:RealtimePostgresChangesPayload<IRouteTransaction>) => {
        if (isTypeIRouteTransaction(payload.new)) {
            const newRouteTransaction:IRouteTransaction = payload.new;
    
            if (newRouteTransaction.id_work_day === workDay.id_work_day) {
                setRouteTransactions((prev) => 
                    prev?.some((t) => t.id_route_transaction === newRouteTransaction.id_route_transaction) 
                    ? prev : [...prev ?? [], newRouteTransaction]);
                
                // Route operations and descriptions might delay at the moment of syncing with the database.
                setTimeout(async () => {
                    const resultNewTransactionOperations:IRouteTransactionOperation[] = await getRouteTransactionOperationsFromWorkDay([newRouteTransaction]);
                    const resultNewOperationDescriptions:IRouteTransactionOperationDescription[] = await getRouteTransactionOperationDescriptionsFromWorkDay(resultNewTransactionOperations);
                    setRouteTransactionOperations((prev) => [
                        ...prev ?? [], 
                        ...resultNewTransactionOperations.filter((op) => 
                            !prev?.some((existingOp) => existingOp.id_route_transaction_operation === op.id_route_transaction_operation)
                    )]);
                    setRouteTransactionOperationDescriptions((prev) => [
                        ...prev ?? [], 
                        ...resultNewOperationDescriptions.filter((desc) => 
                        !prev?.some((existingDesc) => existingDesc.id_route_transaction_operation_description === desc.id_route_transaction_operation_description)
                    )]);   

                    setDayOperations((prev) => {
                        if (!prev) return createRouteDayOperations([newRouteTransaction], plannedStores); // If prev is undefined, initialize with the new transaction
                        
                        // Check if the item already exists (match by id)
                        const exists = prev.some((op) => 
                            "id_route_transaction" in op 
                            ? op.id_route_transaction === newRouteTransaction.id_route_transaction
                            : op.id_inventory_operation === (newRouteTransaction as any).id_inventory_operation
                        );
                        return createRouteDayOperations(
                            exists ? prev : [...prev, newRouteTransaction],
                            plannedStores
                        )
                    });
                }, 3000); 

            }
        }
    }

    const handlerWorkDayInventoryOperations = async (payload:RealtimePostgresChangesPayload<IInventoryOperation>, plannedStores:any[]) => {
        console.log("Inventory operation. - plannedStores: ", plannedStores.length)
        if (isTypeIInventoryOperation(payload.new)) {
            const newInventoryOperation:IInventoryOperation = payload.new;
            
            if (newInventoryOperation.id_work_day === workDay.id_work_day) {
                setInventoryOperations((prev) => 
                    prev?.some((t) => t.id_inventory_operation === newInventoryOperation.id_inventory_operation) 
                    ? prev : [...prev ?? [], newInventoryOperation]);
                
                // Route operations and descriptions might delay at the moment of syncing with the database.
                setTimeout(async () => {
                    setDayOperations((prev) => {
                        if (!prev) return createRouteDayOperations([newInventoryOperation], plannedStores); // If prev is undefined, initialize with the new transaction
                        console.log("Inventory operation: ", prev?.length)
                        
                        // Check if the item already exists (match by id)
                        const exists = prev.some((op) => 
                            "id_route_transaction" in op 
                            ? op.id_route_transaction === newInventoryOperation.id_inventory_operation
                            : op.id_inventory_operation === (newInventoryOperation as any).id_inventory_operation
                        );
                        return createRouteDayOperations(
                            exists ? prev : [...prev, newInventoryOperation],
                            plannedStores
                        );
                    });
                }, 3000); 
            }
        }
    } 

    useEffect(() => {
        initializeElement();
    }, [])

    // Vendor
    const [vendor, setVendor] = useState<IUser|undefined>(undefined)
    
    // States related to stores
    const [plannedStores, setPlannedStores] = useState<IRouteDayStores[]>([]);
    // const [storesFromRouteTransactions, setStoresFromRouteTransactions] = useState<IRouteDayStores[]>([]);
    const [stores, setStores] = useState<Record<string, IStore&IStoreStatusDay&IRouteDayStores>>({});

    // States related to route transactions
    const [routeTransactions, setRouteTransactions] = useState<IRouteTransaction[]|undefined>(undefined);
    const [routeTransactionOperations, setRouteTransactionOperations] = useState<IRouteTransactionOperation[]|undefined>(undefined);
    const [routeTransactionOperationDescriptions, setRouteTransactionOperationDescriptions] = useState<IRouteTransactionOperationDescription[]|undefined>(undefined);
    
    // States related to product inventory
    const [inventoryOperations, setInventoryOperations] = useState<IInventoryOperation[]|undefined>(undefined);

    // States related to day operations
    const [dayOperations, setDayOperations] = useState<(IRouteTransaction|IInventoryOperation)[] | undefined>(undefined);

    const { route_name, day_name, start_date, finish_date } = workDay;



    return (
        <div className="w-full h-1/2 flex flex-col items-center">
            {/* Information about the route */}
            <div className="w-full flex flex-row">
                <div className="flex flex-col basis-4/5 items-start">
                    <span className="text-2xl">{capitalizeFirstLetter(route_name)} - {capitalizeFirstLetter(day_name)}</span>
                    <span className="text-2xl">Fecha inicio: {cast_string_to_date_hour_format(start_date)} </span>
                    <span className="text-2xl">Fecha terminado: 
                        { finish_date === null ? 'Sin terminar' : cast_string_to_date_hour_format(finish_date) }
                    </span>
                    { vendor !== undefined &&
                        <span className="text-xl">Vendedor: { vendor.name } </span>
                    }
                    { vendor !== undefined &&
                        <span className="text-lg">Telefono: { vendor.cellphone } </span>
                    }
                </div>
                <div className=" flex basis-1/5 justify-center">
                    {/* <IconButtonWithNotification 
                        notificationAlert={true}
                        backGroundColor="bg-color-success-primary">
                        <FaRegClipboard />
                    </IconButtonWithNotification> */}
                </div>
            </div>
            {/* Header of the list */}
            <div className="w-full flex flex-row my-3 justify-center items-center">
                <div className="flex flex-row basis-4/5">
                    <HeaderRouteList
                        firstColumn="No."
                        seconColumn="Tienda"
                        thirdColumn="Vendido"
                        fourthColumn="Hora"
                        />
                </div>
                <div className="flex flex-row basis-1/5 justify-center items-center">
                    <IconButtonWithNotification notificationAlert={false}>
                        <FaChevronRight />
                    </IconButtonWithNotification>
                </div>
            </div>
            <div className="w-full max-h-96 overflow-y-auto">
                <div className="w-full my-3 flex flex-col justify-center items-center">
                    { dayOperations !== undefined &&
                        dayOperations.map((currentDayOperation, index:number) => {
                            const idOfTheCard:string = generateUUIDv4();
                            let title:string = '';
                            let description:string = '';
                            let positionInRouteOfStore:string = '';
                            let differenceBetweenDayOperations:string|undefined = undefined;
                            let rateOfDiffferenceBetweenDates:number|undefined = undefined;
                            let dateOfTheOperation:string = '';
                            let cardColorStyle:string = 'bg-orange-400';
                            let totalSold:string = '$0';
                            let storeStatus:enumStoreStates = enumStoreStates.NUETRAL_STATE;
                            let indexPreviousOperationDay:number = -1;
                            let isCurrentOperation:boolean = false;
                            // Common fields
                            const { date } = currentDayOperation;
                            
                            if (isTypeIInventoryOperation(currentDayOperation)) {
                                const { id_inventory_operation, id_inventory_operation_type } = currentDayOperation;
                                title = getNameOfOperationType(id_inventory_operation_type);
                                totalSold = "";
                                cardColorStyle = determineDayOperationTypeBackgroundColor(id_inventory_operation_type);
                            }

                            if (isTypeIRouteTransaction(currentDayOperation)) {
                                const { id_route_transaction, id_store, state } = currentDayOperation;

                                // Getting total of the selling.
                                if (routeTransactionOperations !== undefined && routeTransactionOperationDescriptions !== undefined && state === 1) {
                                    totalSold = formatToCurrency(
                                        getTotalOfTypeOperationOfRouteTransaction(DAYS_OPERATIONS.sales,
                                            currentDayOperation,
                                            routeTransactionOperations,
                                            routeTransactionOperationDescriptions)
                                            , "$");
                                } else {
                                    totalSold = formatToCurrency(0, "$");    
                                }

                                // Getting information regarded to the store
                                if (stores[id_store] !== undefined) {
                                    const { store_name, position_in_route } = stores[id_store];
                                    title = store_name;
                                    description = getAddressOfStore(stores[id_store]);
                                    if (position_in_route === -1) {
                                        positionInRouteOfStore = '';
                                    } else {
                                        positionInRouteOfStore = position_in_route.toString();
                                    }


                                    
                                    // Determining the state of the store
                                    if (routeTransactions) {
                                        const routeTransactionFound:IRouteTransaction|undefined = routeTransactions.find((routeTransaction) => routeTransaction.id_store === id_store);
                                        indexPreviousOperationDay = index - 1;
                                        
                                        // Determining if the currect day operation is the current one.
                                        if(indexPreviousOperationDay >= 0) {
                                            const previousDayOperation:IRouteTransaction|IInventoryOperation = dayOperations[indexPreviousOperationDay];
                                            if (isTypeIInventoryOperation(previousDayOperation) && routeTransactionFound === undefined) {
                                                isCurrentOperation = true
                                            } else if (isTypeIRouteTransaction(previousDayOperation)) {
                                                const previoudDayRouteTransactionFound:IRouteTransaction|undefined = routeTransactions.find((routeTransaction) => routeTransaction.id_store === previousDayOperation.id_store);
                                                if (previoudDayRouteTransactionFound && routeTransactionFound === undefined) {
                                                    isCurrentOperation = true;
                                                } else {
                                                    isCurrentOperation = false;
                                                }
                                            }
                                        } else { // The operation is not the current one.
                                            isCurrentOperation = false;
                                        }

                                        if (!isCurrentOperation) {
                                            if (routeTransactionFound) {
                                                const index:number = plannedStores.findIndex((plannedStore) => { return plannedStore.id_store === routeTransactionFound.id_store});
                                                if (index === -1) {
                                                    storeStatus = enumStoreStates.SPECIAL_SALE;
                                                } else {
                                                    storeStatus = enumStoreStates.SERVED;
                                                }
                                            } else {
                                                storeStatus = enumStoreStates.PENDING_TO_VISIT;
                                            }
                                        }

                                    } else {
                                        storeStatus = enumStoreStates.NUETRAL_STATE;
                                    }
                                    cardColorStyle = determineStoreContextBackgroundColor({
                                        ...stores[id_store],
                                        route_day_state: storeStatus,
                                    }, isCurrentOperation)
                                }
                            }
                            
                            // Calculating the difference of time between day operations
                            if(dayOperations[index + 1] !== undefined) {
                                const nextDate:string = dayOperations[index + 1].date;
                                differenceBetweenDayOperations = differenceBetweenDatesWithFormat(date, nextDate);
                                rateOfDiffferenceBetweenDates = differenceBetweenDatesInSeconds(date, nextDate);

                                if (differenceBetweenDayOperations === "00:00:00") {
                                    differenceBetweenDayOperations = undefined;
                                    rateOfDiffferenceBetweenDates = undefined;
                                } else {
                                    /* Do nothing */
                                }
                            }

                            // Getting 'date' of the operation day. 
                            if (differenceBetweenDayOperations && rateOfDiffferenceBetweenDates) {
                                dateOfTheOperation = date;
                            } else {
                                dateOfTheOperation = '';
                            }
                            

                            return (
                                <CardRouteList
                                    key={idOfTheCard} 
                                    firstColumn={capitalizeFirstLetter(positionInRouteOfStore)}
                                    seconColumn={capitalizeFirstLetterOfEachWord(title)}
                                    descriptionSecondColumn={description}
                                    thirdColumn={totalSold}
                                    fourthColumn={dateOfTheOperation === '' ? "--:--" : cast_string_to_hour_format(dateOfTheOperation)}
                                    cardColorStyle={cardColorStyle}
                                    informationUpperCard={undefined}
                                    informationLowerCard={differenceBetweenDayOperations}
                                    rateOfDifferenceUpperCard={undefined}
                                    rateOfDifferenceLowerCard={rateOfDiffferenceBetweenDates}
                                    />
                            )
                        })
                    }
                </div>
            </div>
            { routeTransactions && routeTransactionOperations && routeTransactionOperationDescriptions &&
            <div className="w-full my-3 ml-3 flex flex-row text-xl italic">
                <span>Total de venta del dia:</span>
                <span className="ml-2 font-bold">
                    {
                        formatToCurrency(
                            routeTransactions.reduce((acc:number, routeTransaction:IRouteTransaction) => {
                                let resultado:number = 0;
                                if(routeTransaction.state === 0) {
                                    resultado = acc + 0;
                                } else {
                                    resultado = acc + getTotalOfTypeOperationOfRouteTransaction(DAYS_OPERATIONS.sales, routeTransaction, routeTransactionOperations, routeTransactionOperationDescriptions);
                                }
                                return resultado;
                            }, 0),
                            "$"
                        )
                    }
                </span>
            </div>

            }
        </div>
    )
}


export default RouteList;