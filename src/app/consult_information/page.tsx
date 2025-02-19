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
} from '@/interfaces/interfaces';

// Controllers
import { 
    getStoresByDate,
} from '@/controllers/WorkDayController';

import { 
    getRouteTransactionsFromRouteDay,
    getRouteTransactionOperationsFromRouteDay,
    getRouteTransactionOperationDescriptionsFromRouteDay,
} from '@/controllers/RouteTransactionsController';

// Components
import DateRangePicker from '@/components/general/DateRangePicker';
import ButtonWithNotification from '@/components/general/ButtonWithNotificaion';
import TableSearchVisualization from '@/components/workday/TableSearchVisualizationWorkDay';
import { getAllVendors } from '@/controllers/VendorController';
import { getAllRoutes } from '@/controllers/RoutesController';
import SummarizeRouteTransaction from '@/components/route_tranactions/SummarizeRouteTransaction';
import SummarizeOfTheDay from '@/components/route_tranactions/SummarizeOfTheDay';


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
        const routeTransactions:IRouteTransaction[] = await getRouteTransactionsFromRouteDay(workDay);
        const routeTransactionOperations:IRouteTransactionOperation[] = await getRouteTransactionOperationsFromRouteDay(routeTransactions);
        const routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[] = await getRouteTransactionOperationDescriptionsFromRouteDay(routeTransactionOperations);

        setWorkday(workDay);
        setRouteTransactions(routeTransactions)
        setRouteTransactionOperations(routeTransactionOperations)
        setRouteTransactionOperationDescriptions(routeTransactionOperationDescriptions)
    }

    return (
    <div className="w-full h-full flex flex-col items-start">
        <span className="text-style-h0">Consulta de información</span>
        <div className='w-full h-60 flex flex-row justify-start ml-3 mb-14'>
            <div className='flex flex-row justify-start'>
                <DateRangePicker 
                    defaultDay={dayjs()}
                    initialDate={initialDate}
                    finalDate={finalDate}
                    setInitialDate={setInitialDate}
                    setFinalDate={setFinalDate}/>
            </div>
            <div className='h-full flex flex-col items-center justify-center ml-5'>
                <ButtonWithNotification 
                    handlerPress={handlerSearchWorkDays}
                    label='Buscar'/>
            </div>
            { workDays.length > 0 &&
                <div className='w-9/12 flex flex-row justify-center'>
                    <TableSearchVisualization 
                        workDays={workDays}
                        vendors={vendors}
                        routes={routes}
                        onSelectWorkDay={handlerSelectWorkDay}

                        />
                </div>
            }
        </div>
        
        <div className='flex flex-row'>
            { workday !== undefined && routeTransactions !== undefined && routeTransactionOperations !== undefined && routeTransactionOperationDescriptions !== undefined &&
                <SummarizeOfTheDay
                    workday={workday}
                    routeTransactions={routeTransactions}
                    routeTransactionOperations={routeTransactionOperations}
                    routeTransactionOperationDescriptions={routeTransactionOperationDescriptions} 
                />
            }
        </div>
    </div>)
}

export default ConsultInformation
