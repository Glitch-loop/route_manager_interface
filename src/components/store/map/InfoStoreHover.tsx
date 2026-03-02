import RouteDayDTO from "@/application/dto/RouteDayDTO";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import DAYS from "@/utils/days";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";

interface InfoStoreHoverInterface {
        store_name: string,
        route_name: string,
        day_name: string,
        position_in_route: number,
        // store: StoreDTO,
        // routeDayStore: RouteDayStoreDTO,
        // routeDay: RouteDayDTO,
        // route: RouteDTO,
}

export default function InfoStoreHover({store_name, route_name, day_name, position_in_route}: InfoStoreHoverInterface) {
    // const { store_name } = store;

    // const { position_in_route } = routeDayStore;  

    // const { id_day } = routeDay.;

    // const { route_name } = route;

    // const dayName:string = DAYS[id_day].day_name

    return (
        <div className="flex flex-col text-black">
            <span className="text-xl">Nombre: {capitalizeFirstLetterOfEachWord(store_name)}</span>
            <div className="flex flex-row text-base">
                <span className="flex basis-1/4">{ capitalizeFirstLetter(route_name) } </span>
                <span className="mx-2 flex basis-1/4">{ capitalizeFirstLetter(day_name) }</span>
                <span className="flex basis-2/4">Posición: { position_in_route }</span>
            </div>
        </div>
    )
}