import { IRoute, IRouteDay, IRouteDayStores, IStore } from "@/interfaces/interfaces"
import DAYS from "@/utils/days";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";


interface InfoStoreClickProps {
    store: IStore,
    routeDayStores: IRouteDayStores[],
    routeDays: Record<string, IRouteDay>,
    routes: Record<string, IRoute>,
}

export default function InfoStoreClick({ store, routeDayStores, routeDays, routes }: InfoStoreClickProps) {
    const { store_name, street, ext_number, colony, owner_name, address_reference, postal_code } = store;
    return (
        <div className="flex flex-col">
            <span className="text-2xl font-bold">{capitalizeFirstLetterOfEachWord(store_name)}</span>
            <div className="text-lg">
                <span className="mr-1">Dirección:</span><span>{capitalizeFirstLetterOfEachWord(street)} #{ext_number}, {capitalizeFirstLetterOfEachWord(colony)}</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">C.P.:</span><span>{postal_code}</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">Dueño:</span><span>{owner_name ? capitalizeFirstLetterOfEachWord(owner_name) : "No especificado" }</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">Referencia:</span><span>{address_reference ? capitalizeFirstLetter(address_reference) : "No especificado" }</span>
            </div>
            <div className="mt-3">
                <span className="text-lg">Rutas asignadas:</span>
                
                { routeDayStores.map((routeDayStore:IRouteDayStores) => {
                    const { id_route_day_store, position_in_route, id_route_day } = routeDayStore;
                    let dayName:string = "";
                    let routeName:string = "";

                    if (routeDays[id_route_day]) {
                        const { id_day, id_route } = routeDays[id_route_day];
                        dayName = DAYS[id_day].day_name
                        routeName = routes[id_route].route_name
                    }

                    return (
                        <div key={id_route_day_store} className="flex flex-col text-sm">
                            <div className="flex flex-row">
                                <span className="flex basis-1/3">{ capitalizeFirstLetter(routeName) } </span>
                                <span className="mx-2 flex basis-1/3">{ capitalizeFirstLetter(dayName) }</span>
                                <span className="flex basis-1/3">Posición: { position_in_route }</span>
                            </div>
                        </div>

                    )})}
            </div>
        </div>
    )
}