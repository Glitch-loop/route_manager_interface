import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import { Switch } from "@mui/material";
import RouteDayStoreContainer from "./RouteDayStoreContainer";
import { DragDropProvider } from "@dnd-kit/react";
import StoreDTO from "@/application/dto/StoreDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import { useEffect, useState } from "react";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";


type RouteDayContainerProps = {
    routesDay: RouteDayDTO[];
    storeMap:Map<string, StoreDTO>;
}


export default function RouteDayContainer({ 
        routesDay,
        storeMap, 
    }: 
    RouteDayContainerProps) {
    
    const [routeDayModified, setRouteDayModified] = useState<RouteDayDTO[]>([]);

    const [currentRoutesDay, setCurrentRoutesDay] = useState<Record<string, RouteDayStoreDTO[]>>({});


    useEffect(() => {
        setCurrentRoutesDay((prev) => {
            const updatedRouteDayModifiedRecord: Record<string, RouteDayStoreDTO[]> = {...prev};
            
            routesDay.forEach((routeDay) => {
                const { id_route_day } = routeDay;
                if(updatedRouteDayModifiedRecord[id_route_day] === undefined) {
                    updatedRouteDayModifiedRecord[id_route_day] = routeDay.stores;
                } 
            });
            return updatedRouteDayModifiedRecord;
        })
    }, [routesDay]);

    return (
        <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
            <div className="flex flex-col bg-system-third-background p-1 rounded-lg">
                <h2 className="text-lg md:text-xl font-bold mb-4">Administración de días en ruta</h2>
                <div className="flex flex-row items-center gap-2">
                    <span className="text-center align-middle">Abrir callout: </span><Switch />
                </div>
                <RangeDateSelection />
            </div>
            <DragDropProvider>
                <div className="ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">
                    { Object.entries(currentRoutesDay).map(([id_route_day, stores]) => {
                        return (<RouteDayStoreContainer key={id_route_day} id_column={id_route_day} stores={stores} />)
                    })}
                </div>
            </DragDropProvider>
        </div>
    );
}