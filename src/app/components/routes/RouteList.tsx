import IconButtonWithNotification from "../general/IconButtonWithNotification";
import { FaChevronRight } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa";


function RouteList() {
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
                    <IconButtonWithNotification notificationAlert={false}>
                        <FaRegClipboard />
                    </IconButtonWithNotification>
                </div>

            </div>

            {/* Header of the list */}
            <div className="w-full flex flex-row my-3 justify-center items-center">
                <div className="text-xl flex flex-row basis-4/5 justify-center items-center p-3 bg-orange-400 rounded-md">
                    <span className="flex basis-1/6 justify-center">No.</span>
                    <span className="flex basis-4/6 justify-center">Tienda</span>
                    <span className="flex basis-1/6 justify-center">Vendido</span>
                    <span className="flex basis-1/6 justify-center">Tiempo</span>
                </div>
                <div className="flex flex-row basis-1/5 justify-center items-center">
                    <IconButtonWithNotification notificationAlert={false}>
                        <FaChevronRight />
                    </IconButtonWithNotification>
                </div>
            </div>
            <div className="w-full flex flex-row max-h-16 mt-3">
                <div className="text-lg flex flex-row basis-4/5 justify-center items-center p-3 bg-orange-400 rounded-md">
                    <span className="flex basis-1/6 justify-center">1</span>
                    <div className="flex flex-col basis-4/6 justify-center">
                        <span className="">Miguel's shop</span>
                        <span className="text-sm">Mariano Otero #1254, Atemajac del Valle asasaasas asasas </span>
                    </div>
                    <span className="flex basis-1/6 justify-center">$27,000</span>
                    <span className="flex basis-1/6 justify-center">8:00</span>
                </div>
                <div className="relative flex flex-col basis-1/5 justify-start">
                    {/* <div className="absolute right-28 bottom-11  p-3 bg-green-500 rounded-md">
                        08:00
                    </div> */}
                    <div className="absolute right-28 top-11  p-3 bg-red-500 rounded-md">
                        10:50
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-row max-h-16 mt-3">
                <div className="text-lg flex flex-row basis-4/5 justify-center items-center p-3 bg-orange-400 rounded-md">
                    <span className="flex basis-1/6 justify-center">1</span>
                    <div className="flex flex-col basis-4/6 justify-center">
                        <span className="">Miguel's shop</span>
                        <span className="text-sm">Mariano Otero #1254, Atemajac del Valle asasaasas asasas </span>
                    </div>
                    <span className="flex basis-1/6 justify-center">$27</span>
                    <span className="flex basis-1/6 justify-center">8:00</span>
                </div>
                <div className="relative flex flex-col basis-1/5 justify-start">
                    {/* <div className="absolute right-28 bottom-11  p-3 bg-green-500 rounded-md">
                        08:00
                    </div> */}
                    <div className="absolute right-28 top-11  p-3 bg-red-500 rounded-md">
                        10:50
                    </div>
                </div>
            </div>
        </div>
    )
}


export default RouteList;