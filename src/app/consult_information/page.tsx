'use client'

// Librareis
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// Interfaces
import {
    IRouteDayStores,
    IStore,
    IDayGeneralInformation,
    IDay,
    IRouteDay,
    IRoute,
    IStoreStatusDay,
    IResponse,
    IUser,
    IRouteTransaction,
    IRouteTransactionOperation,
    IRouteTransactionOperationDescription,
    IInventoryOperation,
    IInventoryOperationDescription,
    IProductInventory,
    IProduct,
} from '@/interfaces/interfaces';

// Controllers
import { 
    getStoresByDate,
} from '@/controllers/WorkDayController';
import { getAllVendors } from '@/controllers/VendorController';
import { getAllRoutes } from '@/controllers/RoutesController';
import { 
    getRouteTransactionsFromWorkDay,
    getRouteTransactionOperationsFromWorkDay,
    getRouteTransactionOperationDescriptionsFromWorkDay,
} from '@/controllers/RouteTransactionsController';
import { getInventoryOperationsOfWorkDay, getInventoryOperationDescriptionsOfWorkDay, getAllConceptOfProducts } from '@/controllers/InventoryController';

// Components
import DateRangePicker from '@/components/general/DateRangePicker';
import ButtonWithNotification from '@/components/general/ButtonWithNotificaion';
import TableSearchVisualization from '@/components/workday/TableSearchVisualizationWorkDay';
import SummarizeOfTheDay from '@/components/route_tranactions/SummarizeOfTheDay';
import SummarizeDayComission from '@/components/route_tranactions/SummarizeDayComission';
import SummarizeRouteTransacionsOfTheDay from '@/components/route_tranactions/SummarizeRouteTransacionsOfTheDay';

// Utils
import { convertProductToProductInventoryInterface } from '@/utils/inventoryUtils';
import { getInformationOfStores } from '@/controllers/StoreController';
import TableInventoryOperationsVisualization from '@/components/inventory/TableInventoryOperationsVisualization';
import TableInventoryVisualization from '@/components/inventory/TableInventoryVisualization';
import { cast_string_to_timestamp_standard_format } from '@/utils/dateUtils';


function getRouteName(idRoute:string, routes:IRoute[]):string {
    let routeName:string = '';
    const index:number = routes.findIndex((route) => {return route.id_route === idRoute});

    if (index === -1) {
        routeName = "No especificado";
    } else {
        routeName = routes[index].route_name;
    }

    return routeName;
}

function getVendorName(idVendor:string, vendors:IUser[]):string {
    let vendorName:string = '';
    const index:number = vendors.findIndex((vendor) => {return vendor.id_vendor === idVendor});

    if (index === -1) {
        vendorName = "No especificado";
    } else {
        vendorName = vendors[index].name;
    }

    return vendorName;   
}

function ConsultInformation() {
    const [initialDate, setInitialDate] = useState<Dayjs | null>(null);
    const [finalDate, setFinalDate] = useState<Dayjs | null>(null);

    // States related to the workday
    const [workDays, setWorkDays] = useState<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>([]);
    const [workday, setWorkday] = useState<(IRoute&IDayGeneralInformation&IDay&IRouteDay|undefined)>();
    const [vendors, setVendors] = useState<IUser[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    
    // States related to stores
    const [stores, setStores] = useState<IStore[]>([]);

    // States related to route transactions
    const [routeTransactions, setRouteTransactions] = useState<IRouteTransaction[]|undefined>(undefined);
    const [routeTransactionOperations, setRouteTransactionOperations] = useState<IRouteTransactionOperation[]|undefined>(undefined);
    const [routeTransactionOperationDescriptions, setRouteTransactionOperationDescriptions] = useState<IRouteTransactionOperationDescription[]|undefined>(undefined);
    
    // States related to product inventory
    const [inventoryOperations, setInventoryOperations] = useState<IInventoryOperation[]|undefined>(undefined);
    const [inventoryOperationDescriptions, setInventoryOperationDescriptions] = useState<IInventoryOperationDescription[]|undefined>(undefined);
    const [productsInventory, setProductsInventory] = useState<IProductInventory[]|undefined>(undefined);

    const handlerSearchWorkDays = async () => {
        if(initialDate === null) {
            return
        } 

        if (finalDate === null) {
            return
        }

        setWorkDays(await getStoresByDate(initialDate.format('YYYY/MM/DD'), finalDate.format('YYYY/MM/DD')));
        setVendors(await getAllVendors());
        setRoutes(await getAllRoutes());
    }


    const handlerSelectWorkDay = async(workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay) => {
        // Getting information related to product inventory
        const products:IProduct[] = await getAllConceptOfProducts();
        console.log("Before set: ", convertProductToProductInventoryInterface(products))
        setProductsInventory(convertProductToProductInventoryInterface(products))
        
        // Getting information related to transactions
        const routeTransactions:IRouteTransaction[] = await getRouteTransactionsFromWorkDay(workDay);
        const routeTransactionOperations:IRouteTransactionOperation[] = await getRouteTransactionOperationsFromWorkDay(routeTransactions);
        const routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[] = await getRouteTransactionOperationDescriptionsFromWorkDay(routeTransactionOperations);

        setWorkday(workDay);
        setRouteTransactions(routeTransactions);
        setRouteTransactionOperations(routeTransactionOperations);
        setRouteTransactionOperationDescriptions(routeTransactionOperationDescriptions);

        // Getting information related to inventory operation
        const inventoryOperations:IInventoryOperation[] = await getInventoryOperationsOfWorkDay(workDay);
        const inventoryOperationDescriptions:IInventoryOperationDescription[] = await getInventoryOperationDescriptionsOfWorkDay(inventoryOperations)

        setInventoryOperations(inventoryOperations);
        setInventoryOperationDescriptions(inventoryOperationDescriptions)

        // Getting ingotmation related to stores
        const storesOfTheDay:Set<string> = new Set<string>();

        // Getting all the stores of the day
        routeTransactions.forEach((routeTransaction:IRouteTransaction) => {
            const { id_store } = routeTransaction;

            if (storesOfTheDay.has(id_store) === false) {
                storesOfTheDay.add(id_store);
            }
        });

        const informationOfStores:IStore[] = await getInformationOfStores(
            [...storesOfTheDay.entries()].map((item) => {return item[0]}))
        
        setStores(informationOfStores)
    }

    return (
    <div className="w-full h-full flex flex-col items-start">
        <span className="text-style-h0">Consulta de información</span>
        {/* Parameters to consult the days */}
        <div className='w-full h-60 flex flex-row justify-start ml-3 mb-14'>
            <div className='flex flex-row basis-4/12 justify-start'>
                <DateRangePicker 
                    defaultDay={dayjs()}
                    initialDate={initialDate}
                    finalDate={finalDate}
                    setInitialDate={setInitialDate}
                    setFinalDate={setFinalDate}/>
                <div className='h-full flex flex-col items-center justify-center'>
                    <ButtonWithNotification 
                        handlerPress={handlerSearchWorkDays}
                        label='Buscar'/>
                </div>
            </div>
            <div className='flex flex-row basis-8/12 justify-center'>
            { workDays.length > 0 &&
                <div className='w-11/12'>
                    <TableSearchVisualization 
                        workDays={workDays}
                        vendors={vendors}
                        routes={routes}
                        maxHeight={275}
                        onSelectWorkDay={handlerSelectWorkDay}/>
                </div>
            }
            </div>
        </div>
        {/* Title of the day */}
        { workday !== undefined && 
            <div className='flex flex-col ml-2'>
                <span className='text-3xl font-bold'>Ruta: { getRouteName(workday.id_route, routes) }</span>
                <span className='text-2xl'>Fecha: {cast_string_to_timestamp_standard_format(workday.start_date)}</span>
                <span className='text-xl'>Vendedor: {getVendorName(workday.id_vendor, vendors)}</span>
            </div>
        
        }
        {/* Components that summarize the day */}
        <div className='w-3/5 my-3 ml-3 flex flex-col overflow-x-auto'>
            <div className='flex flex-row'>
                { workday !== undefined && routeTransactions !== undefined && routeTransactionOperations !== undefined && routeTransactionOperationDescriptions !== undefined &&
                    <SummarizeOfTheDay
                        workday={workday}
                        routeTransactions={routeTransactions}
                        routeTransactionOperations={routeTransactionOperations}
                        routeTransactionOperationDescriptions={routeTransactionOperationDescriptions} 
                    />

                }
                { (workday !== undefined && routeTransactions !== undefined && routeTransactionOperations !== undefined 
                    && routeTransactionOperationDescriptions !== undefined && inventoryOperations !== undefined && inventoryOperationDescriptions !== undefined) &&
                    <SummarizeDayComission
                        workday={workday}
                        routeTransactions={routeTransactions}
                        routeTransactionOperations={routeTransactionOperations}
                        routeTransactionOperationDescriptions={routeTransactionOperationDescriptions} 
                        inventoryOperations={inventoryOperations}
                        inventoryOperationDescriptions={inventoryOperationDescriptions}
                    />
                }
            </div>
            {/* Summarie of prodct of the day */}
            { (productsInventory !== undefined && routeTransactions !== undefined && routeTransactionOperations !== undefined 
                && routeTransactionOperationDescriptions !== undefined && inventoryOperations !== undefined && inventoryOperationDescriptions !== undefined) &&
                <div className='w-full my-3'>
                    <span className='text-xl font-bold ml-2'>Resumen de movimiento de inventario</span>
                    <TableInventoryVisualization
                        inventory={productsInventory}
                        inventoryOperations={inventoryOperations}
                        inventoryOperationDescriptions={inventoryOperationDescriptions}
                        routeTransactions={routeTransactions}
                        routeTransactionOperations={routeTransactionOperations}
                        routeTransactionOperationDescriptions={routeTransactionOperationDescriptions}
                    />
                </div>
            }
            {/* Summaraize of route transactions */}
            { routeTransactions && routeTransactionOperations && routeTransactionOperationDescriptions && productsInventory &&
                <div className='w-full'>
                    <span className='text-xl font-bold ml-2'>Resumen de ventas</span>
                    <SummarizeRouteTransacionsOfTheDay 
                        routeTransactionOfTheDay={routeTransactions}
                        routeTransactionOperationsOfTheDay={routeTransactionOperations}
                        routeTransactionOperationDescriptionsOfTheDay={routeTransactionOperationDescriptions}
                        productsInventory={productsInventory}
                        storesOfTheDay={stores}
                    />
                </div>
            }

        </div>
    </div>)
}

export default ConsultInformation
