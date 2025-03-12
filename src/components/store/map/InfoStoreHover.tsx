import { IRoute, IRouteDay, IRouteDayStores, IStore } from "@/interfaces/interfaces";
import DAYS from "@/utils/days";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";

interface InfoStoreHoverInterface {
        store: IStore,
        routeDayStore: IRouteDayStores,
        routeDays: Record<string, IRouteDay>,
        routes: Record<string, IRoute>,
}

export default function InfoStoreHover({store, routeDayStore, routeDays, routes}: InfoStoreHoverInterface) {
    const { store_name } = store;

    const { id_route_day, position_in_route } = routeDayStore;  

    console.log("id_route_day: ", id_route_day)
    console.log("routeDays: ", routeDays)
    console.log("routeDays[id_route_day]: ", routeDays[id_route_day])
    const { id_day, id_route } = routeDays[id_route_day];

    const { route_name } = routes[id_route];

    const dayName:string = DAYS[id_day].day_name

    return (
        <div className="flex flex-col">
            <span className="text-xl">Nombre: {capitalizeFirstLetterOfEachWord(store_name)}</span>
            <div className="flex flex-row text-base">
                <span className="flex basis-1/4">{ capitalizeFirstLetter(route_name) } </span>
                <span className="mx-2 flex basis-1/4">{ capitalizeFirstLetter(dayName) }</span>
                <span className="flex basis-2/4">Posición: { position_in_route }</span>
            </div>
        </div>
    )
}