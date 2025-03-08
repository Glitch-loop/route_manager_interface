"use client";
// Libraries
import { useState, useEffect } from "react";

// Interfaces
import { 
    IRoute, 
    IRouteDay, 
    IRouteDayStores, 
    IStore 
} from "@/interfaces/interfaces";

// Controllers
import { 
    getAllRoutes,
    getRouteDays, 
    updateRouteDay, 
    getStoresOfRouteDay
 } from "@/controllers/RoutesController";
import { getAllStores } from "@/controllers/StoreController";

// Utils
import { convertArrayInJsonUsingInterfaces } from "@/utils/generalUtils";

// Components
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import MultiContainerDragDrop from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/MultiContainerDragDrop";
import StoreMap from "@/components/general/mapComponent/StoreMap";
import RouteMap from "../general/mapComponent/RouteMap";
import InfoStoreHover from "../store/map/InfoStoreHover";

export default function RouteDayManagerView() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [routeDays, setRouteDays] = useState<IRouteDay[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [routeDayStores, setRouteDayStores] = useState<IRouteDayStores[]>([]);
  const [selectedRouteDay, setSelectedRouteDay] = useState<IRouteDay | null>(null);
  const [storeJson, setStoreJson] = useState<Record<string, IStore>>({});
  const [storesOfSelectedRouteDay, setStoresOfSelectedRouteDay] = useState<(IStore&IRouteDayStores)[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const routeDaysData = await getRouteDays();
    const routesData = await getAllRoutes();
    const storesData = await getAllStores();
    
    setRouteDays(routeDaysData);
    setRoutes(routesData);
    setStores(storesData);

    // Convert stores to JSON for quick access
    setStoreJson(convertArrayInJsonUsingInterfaces(storesData));
  };

  const handleRouteDaySelection = async (routeDay: IRouteDay) => {
    const storesOfTheRouteDay:(IStore&IRouteDayStores)[] = [];  
    setSelectedRouteDay(routeDay);
    const routeDayStoresData = await getStoresOfRouteDay(routeDay);
    setRouteDayStores(routeDayStoresData);

    // Get stores of stores from the route day
    routeDayStoresData.forEach((routeDayStore:IRouteDayStores) => {
        const { id_store } = routeDayStore;
        if(storeJson[id_store] !== undefined) {
            const currentStore:IStore = storeJson[id_store]
            storesOfTheRouteDay.push({...currentStore, ...routeDayStore}); 
        }
    })

    setStoresOfSelectedRouteDay([...storesOfTheRouteDay])
  };

  const handleSaveRouteDay = async (updatedStores: IRouteDayStores[]) => {
    if (!selectedRouteDay) return;

    await updateRouteDay({
      ...selectedRouteDay,
      stores: updatedStores,
    });

    fetchData();
  };

  return (
    <div className="flex w-full h-full p-4">
      {/* Left Side */}
      <div className="flex-1 basis-1/2 p-2">
        {/* Route Days Table */}
        <TableContainer component={Paper} className="max-h-96 overflow-y-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Route Name</TableCell>
                <TableCell>Day</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routeDays.map((routeDay) => (
                <TableRow key={routeDay.id_route_day} onDoubleClick={() => handleRouteDaySelection(routeDay)} className="cursor-pointer">
                  <TableCell>{routes.find((r) => r.id_route === routeDay.id_route)?.route_name || "Unknown"}</TableCell>
                  <TableCell>{routeDay.id_day}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MultiContainerDragDrop for Route Stores */}
        {selectedRouteDay && (
          <MultiContainerDragDrop
            catalogMatrix={[routeDayStores]}
            catalogTitles={["Stores in Route"]}
            onSave={handleSaveRouteDay}
          />
        )}
      </div>

      {/* Right Side - Store Map */}
      <div className="flex-1 basis-1/2 p-4">
        <RouteMap stores={storesOfSelectedRouteDay} 
        onSelectStore={(store) => console.log("Selected Store:", store)} 
        hoverComponent={(store_name:string, position_in_route:string) => {return <InfoStoreHover store_name={store_name} position_in_route={position_in_route}/>}}
        />
        {/* <StoreMap stores={storesOfSelectedRouteDay} 
        onSelectStore={(store) => console.log("Selected Store:", store)} /> */}
      </div>
    </div>
  );
}
