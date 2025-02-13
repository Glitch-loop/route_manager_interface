import IconButtonWithNotification from "../general/IconButtonWithNotification";
import { FaChevronRight } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa";
import CardRouteList from "./CardRouteList";
import ButtonWithNotification from "../general/ButtonWithNotificaion";
import HeaderRouteList from "./HeaderRouteList";


function RouteList(
    // {
    //     routeName,
    //     dayName,
    //     date,
    //     vendor,
    // }:{
    //     routeName,
    //     dayName,
    //     date,
    //     vendor,
    // }
) {
    return (
        <div className="w-full flex flex-col items-center">
            {/* Information about the route */}
            <div className="w-full flex flex-row">
                <div className="flex flex-col basis-4/5 items-start">
                    <span className="text-2xl">Route 1 - Wednesday (02/11/25)</span>
                    <span className="text-xl">Alexis Gonzáles</span>
                    <span className="text-lg">322-153-2554</span>
                </div>
                <div className="flex basis-1/5 justify-center">
                    <IconButtonWithNotification notificationAlert={true}>
                        <FaRegClipboard />
                    </IconButtonWithNotification>
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
            <CardRouteList 
                firstColumn="1" 
                seconColumn="Miguel's shop"
                descriptionSecondColumn="Some street in some place in the world"
                thirdColumn="$7000"
                fourthColumn="07:00"
                informationUpperCard="08:00 am"
                informationLowerCard="09:00pm"
                />
            <CardRouteList 
                firstColumn="1" 
                seconColumn="Miguel's shop"
                descriptionSecondColumn="Some street in some place in the world"
                thirdColumn="$7000"
                fourthColumn="07:00"
                informationUpperCard="08:00 am"
                informationLowerCard="09:00 pm"
                />
        </div>
    )
}


export default RouteList;