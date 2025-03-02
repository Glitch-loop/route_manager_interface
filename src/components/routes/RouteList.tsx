import { useEffect, useState } from "react";


// Controllers
import { getInventoryOperationsOfWorkDay } from "@/controllers/InventoryController";
import { getInformationOfStores, getStoresFromRouteTransactions, getStoresOfRouteDay } from "@/controllers/StoreController";
import { getRouteTransactionOperationDescriptionsFromWorkDay, getRouteTransactionOperationsFromWorkDay, getRouteTransactionsFromWorkDay, getTotalOfTypeOperationOfRouteTransaction } from "@/controllers/RouteTransactionsController";

// Interface
import { 
    IDay, 
    IDayGeneralInformation, 
    IInventoryOperation, 
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
    isDateGreater
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

            
        })
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
        })

        setDayOperations(operationsOfTheDay)
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
                    <span className="text-2xl">{route_name} - {day_name}</span>
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
                            let idOfTheCard:string = '';
                            let title:string = '';
                            let description:string = '';
                            let positionInRouteOfStore:string = '';
                            let differenceBetweenDayOperations:string|undefined = undefined;
                            let rateOfDiffferenceBetweenDates:number|undefined = undefined;
                            let dateOfTheOperation:string = '';
                            let cardColorStyle:string = 'bg-orange-400';
                            let totalSold:string = '$0';
                            
                            // Common fields
                            const { date } = currentDayOperation;
                            
                            if (isTypeIInventoryOperation(currentDayOperation)) {
                                console.log("Inventory operation")
                                const { id_inventory_operation, id_inventory_operation_type } = currentDayOperation;
                                idOfTheCard = id_inventory_operation;
                                title = getNameOfOperationType(id_inventory_operation_type);
                                totalSold = "";
                                cardColorStyle = determineDayOperationTypeBackgroundColor(id_inventory_operation_type);
                            }

                            if (isTypeIRouteTransaction(currentDayOperation)) {
                                console.log("Route transaction")
                                const { id_route_transaction, id_store, state } = currentDayOperation;

                                idOfTheCard = id_route_transaction;
                                
                                
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

                                if (stores[id_store] !== undefined) {
                                    const { store_name, position_in_route } = stores[id_store];
                                    title = store_name;
                                    description = getAddressOfStore(stores[id_store]);
                                    if (position_in_route === -1) {
                                        positionInRouteOfStore = '';
                                    } else {
                                        positionInRouteOfStore = position_in_route.toString();
                                    }

                                    cardColorStyle = determineStoreContextBackgroundColor(stores[id_store], false)
                                }
                            }
                            


                            // Calculating the difference of time between day operations
                            if(dayOperations[index + 1] !== undefined) {
                                const nextDate:string = dayOperations[index + 1].date;
                                differenceBetweenDayOperations = differenceBetweenDatesWithFormat(date, nextDate);
                                rateOfDiffferenceBetweenDates = differenceBetweenDatesInSeconds(date, nextDate);
                            }

                            // Getting the date of the operation day. 
                            dateOfTheOperation = date;
                            

                            console.log(cardColorStyle)

                            return (
                                <CardRouteList
                                    key={idOfTheCard} 
                                    firstColumn={positionInRouteOfStore}
                                    seconColumn={title}
                                    descriptionSecondColumn={description}
                                    thirdColumn={totalSold}
                                    fourthColumn={cast_string_to_hour_format(dateOfTheOperation)}
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
                                return acc + getTotalOfTypeOperationOfRouteTransaction(DAYS_OPERATIONS.sales, routeTransaction, routeTransactionOperations, routeTransactionOperationDescriptions);
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