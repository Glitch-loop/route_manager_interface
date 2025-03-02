import { useEffect, useState } from "react";


// Controllers
import { getInventoryOperationsOfWorkDay } from "@/controllers/InventoryController";
import { getInformationOfStores, getStoresFromRouteTransactions, getStoresOfRouteDay } from "@/controllers/StoreController";
import { getRouteTransactionOperationDescriptionsFromWorkDay, getRouteTransactionOperationsFromWorkDay, getRouteTransactionsFromWorkDay } from "@/controllers/RouteTransactionsController";

// Interface
import { 
    IDay, 
    IDayGeneralInformation, 
    IInventoryOperation, 
    IRoute, 
    IRouteDay, 
    IRouteDayStores, 
    IRouteTransaction, 
    IStore, 
    IStoreStatusDay, 
    IUser
} from "@/interfaces/interfaces";

// Utils
import { getAddressOfStore } from "@/utils/storeUtils";
import { convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";

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
    differenceBetweenDatesWithFormat 
} from "@/utils/dateUtils";
import { getVendorById } from "@/controllers/VendorController";


function RouteList({ workDay }:{ workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay }) {
    
    const initializeElement = async () => {
        const { id_vendor } = workDay;

        // Related to vendor
        setVendor(await getVendorById(id_vendor));

        console.log("Initializing: ", workDay.id_work_day)
        const setOfStores = new Set<string>();

        console.log("Getting concept")
        // Related to route transaction
        const routeTransactions:IRouteTransaction[] = await getRouteTransactionsFromWorkDay(workDay);
        setRouteTransactions(routeTransactions);

        // Related to inventory operations
        const inventoryOperations:IInventoryOperation[] = await getInventoryOperationsOfWorkDay(workDay);
        setInventoryOperations(inventoryOperations);

        console.log("Getting planned stores")
        // Related to stores
        const storesInDay:IRouteDayStores[] = await getStoresOfRouteDay(workDay)
        console.log("storesInDay: ", storesInDay)
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

        console.log("Getting stores")
        // Getting information of stores
        console.log([...setOfStores.entries()].map(([id_store, value]) => { return id_store; }))
        const storesInTheDay:IStore[] = await getInformationOfStores([...setOfStores.entries()].map(([id_store, value]) => { return id_store; }))
        const storesWithStatus:Record<string, IStore&IStoreStatusDay&IRouteDayStores> = {};
        
        console.log("Creating input")
        storesInTheDay.forEach((store:IStore) => {
            const { id_store } = store;
            const plannedStoreFound:IRouteDayStores|undefined = storesInDay.find((plannedStore:IRouteDayStores) => {
                return plannedStore.id_store === id_store
            })

            if (plannedStoreFound) {
                const {id_route_day_store, position_in_route, id_route_day} = plannedStoreFound;
                console.log(position_in_route)
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

        console.log("storesWithStatus: ", 
            storesWithStatus
        )
        setPlannedStores(storesInDay);
        setStores(storesWithStatus);
    }

    useEffect(() => {
        console.log("Initializing day: ", workDay)
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
    
    // States related to product inventory
    const [inventoryOperations, setInventoryOperations] = useState<IInventoryOperation[]|undefined>(undefined);

    const { route_name, day_name, start_date, finish_date } = workDay;
    console.log("finish_date: ", finish_date)
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
                    { routeTransactions !== undefined &&
                        routeTransactions.map((currentDayOperation, index:number) => {
                            let nameOfStore:string = '';
                            let addressOfStore:string = '';
                            let positionInRouteOfStore:string = '';
                            let differenceBetweenDayOperations:string|undefined = undefined;
                            let rateOfDiffferenceBetweenDates:number|undefined = undefined;

                            const { id_route_transaction, id_store, date } = currentDayOperation;
                            
                            if(routeTransactions[index + 1] !== undefined) {
                                const nextDate:string = routeTransactions[index + 1].date;
                                differenceBetweenDayOperations = differenceBetweenDatesWithFormat(date, nextDate);
                                rateOfDiffferenceBetweenDates = differenceBetweenDatesInSeconds(date, nextDate);
                            }

                            if (stores[id_store] !== undefined) {
                                const { store_name, position_in_route } = stores[id_store];
                                nameOfStore = store_name;
                                addressOfStore = getAddressOfStore(stores[id_store]);
                                if (position_in_route === -1) {
                                    positionInRouteOfStore = '';
                                } else {
                                    positionInRouteOfStore = position_in_route.toString();
                                }
                            }

                            
                            return (
                                <CardRouteList
                                    key={id_route_transaction} 
                                    firstColumn={positionInRouteOfStore}
                                    seconColumn={nameOfStore}
                                    descriptionSecondColumn={addressOfStore}
                                    thirdColumn="$7000"
                                    fourthColumn={cast_string_to_hour_format(date)}
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
        </div>
    )
}


export default RouteList;