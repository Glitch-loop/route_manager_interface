import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import { Switch } from "@mui/material";



export default function RouteDayContainer() {
    return (
        <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
            <div className="flex flex-col bg-system-third-background p-1 rounded-lg">
                <h2 className="text-lg md:text-xl font-bold mb-4">Administración de días en ruta</h2>
                <div className="flex flex-row items-center gap-2">
                    <span className="text-center align-middle">Abrir callout: </span><Switch />
                </div>
                <RangeDateSelection />
            </div>
            <div className="ml-2 flex flex-row w-full bg-system-third-background rounded-lg">
                
            </div>
        </div>
    );
}