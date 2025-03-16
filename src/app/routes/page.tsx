"use client";
// Libraries
import { useState } from "react";

// Components
import RouteDayManagerView  from "@/components/routes/RouteDayManagerView"
import RouteManagerView from "@/components/routes/RouteManagerView";
import { Button } from "@mui/material";

export default function RoutesPage() {
  const [switchToRouteDayManager, setSwitchToRouteDayManager] = useState<boolean>(false);

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div>
        <Button variant="contained" color="info" onClick={() => setSwitchToRouteDayManager(!switchToRouteDayManager)}>
          { switchToRouteDayManager ?
              'Cambiar a administrador de rutas' :
              'Camiar a administrador de tiendas en ruta'
          }
        </Button>
      </div>
      { switchToRouteDayManager ?
        <RouteDayManagerView /> :
        <RouteManagerView />
      }
    </div>
  );
}
