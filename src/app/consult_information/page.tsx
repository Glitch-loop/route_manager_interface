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
} from '@/interfaces/interfaces';

// Controllers
import { 
    getStoresByDate,
} from '@/controllers/WorkDayController';

import { 
    getRouteTransactionsFromWorkDay,
    getRouteTransactionOperationsFromWorkDay,
    getRouteTransactionOperationDescriptionsFromWorkDay,
} from '@/controllers/RouteTransactionsController';

// Components
import DateRangePicker from '@/components/general/DateRangePicker';
import ButtonWithNotification from '@/components/general/ButtonWithNotificaion';
import TableSearchVisualization from '@/components/workday/TableSearchVisualizationWorkDay';
import { getAllVendors } from '@/controllers/VendorController';
import { getAllRoutes } from '@/controllers/RoutesController';
import SummarizeRouteTransaction from '@/components/route_tranactions/SummarizeRouteTransaction';
import SummarizeOfTheDay from '@/components/route_tranactions/SummarizeOfTheDay';
import { getInventoryOperationsOfWorkDay, getInventoryOperationDescriptionsOfWorkDay } from '@/controllers/InventoryController';
import SummarizeDayComission from '@/components/route_tranactions/SummarizeDayComission';


function ConsultInformation() {
    const [initialDate, setInitialDate] = useState<Dayjs | null>(null);
    const [finalDate, setFinalDate] = useState<Dayjs | null>(null);

    const [workDays, setWorkDays] = useState<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]>([]);
    const [vendors, setVendors] = useState<IUser[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [workday, setWorkday] = useState<(IRoute&IDayGeneralInformation&IDay&IRouteDay|undefined)>();
    const [routeTransactions, setRouteTransactions] = useState<IRouteTransaction[]|undefined>(undefined);
    const [routeTransactionOperations, setRouteTransactionOperations] = useState<IRouteTransactionOperation[]|undefined>(undefined);
    const [routeTransactionOperationDescriptions, setRouteTransactionOperationDescriptions] = useState<IRouteTransactionOperationDescription[]|undefined>(undefined);
    const [inventoryOperations, setInventoryOperations] = useState<IInventoryOperation[]|undefined>(undefined);
    const [inventoryOperationDescriptions, setInventoryOperationDescriptions] = useState<IInventoryOperationDescription[]|undefined>(undefined);

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
    }

    return (
    <div className="w-full h-full flex flex-col items-start">
        <span className="text-style-h0">Consulta de información</span>
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
        <div className=' my-3 ml-3 flex flex-row overflow-x-auto'>
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
    </div>)
}

export default ConsultInformation
