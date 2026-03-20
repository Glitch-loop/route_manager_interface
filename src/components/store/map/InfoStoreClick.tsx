import RouteDayDTO from "@/application/dto/RouteDayDTO";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import { IRoute, IRouteDay, IRouteDayStores, IStore } from "@/interfaces/interfaces"
import DAYS from "@/utils/days";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";


interface InfoStoreClickProps {
    store: StoreDTO,
    routeDayStores: RouteDayStoreDTO[],
    routeDays: Map<string, RouteDayDTO>,
    routes: Map<string, RouteDTO>,
}

export default function InfoStoreClick({ store, routeDayStores, routeDays, routes }: InfoStoreClickProps) {
    const { id_store, store_name, street, ext_number, colony, address_reference, postal_code, latitude, longitude } = store;

    const routeDaysStoreAppear:RouteDayStoreDTO[] = routeDayStores.filter((routeDayStore:RouteDayStoreDTO) => routeDayStore.id_store === id_store);

    return (
        <div className="flex flex-col text-black">
            <span className="text-2xl font-bold">{capitalizeFirstLetterOfEachWord(store_name)}</span>
            <div className="text-lg">
                <span className="mr-1">id:</span><span>{id_store}</span>
            </div>
            <div className="text-lg">
                <span className="mr-1">coords:</span><span>{`${latitude}, ${longitude}`}</span>
            </div>
            <div className="text-lg">
                <span className="mr-1">Dirección:</span><span>{capitalizeFirstLetterOfEachWord(street)} #{ext_number}, {capitalizeFirstLetterOfEachWord(colony)}</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">C.P.:</span><span>{postal_code}</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">Dueño:</span><span>{ "No especificado" }</span>
            </div>
            <div className="text-lg">
                <span className="ml-1 text-lg">Referencia:</span><span>{address_reference ? capitalizeFirstLetter(address_reference) : "No especificado" }</span>
            </div>
            <div className="mt-3">
                <span className="text-lg">Rutas asignadas:</span>
                
                { routeDaysStoreAppear.map((routeDayStore:RouteDayStoreDTO) => {
                    const { id_route_day_store, position_in_route, id_route_day } = routeDayStore;
                    let dayName:string = "";
                    let routeName:string = "";

                    if (routeDays.get(id_route_day)) {
                        const { id_day, id_route } = routeDays.get(id_route_day)!;
                        dayName = DAYS[id_day].day_name
                        // routeName = routes.get(id_route)!.route_name
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