"use client";
// Libraries
import { useState, useEffect } from "react";

// Interfaces
import { 
  IMapMarker,
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
import { capitalizeFirstLetter, convertArrayInJsonUsingInterfaces, generateUUIDv4 } from "@/utils/generalUtils";

// Components
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import MultiContainerDragDrop from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/MultiContainerDragDrop";
import StoreMap from "@/components/general/mapComponent/StoreMap";
import RouteMap from "../general/mapComponent/RouteMap";
import InfoStoreHover from "../store/map/InfoStoreHover";
import InfoStoreClick from "../store/map/InfoStoreClick";
import DAYS from "@/utils/days";

export default function RouteDayManagerView() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [routeDays, setRouteDays] = useState<IRouteDay[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [routeDayStores, setRouteDayStores] = useState<IRouteDayStores[]>([]);
  const [selectedRouteDay, setSelectedRouteDay] = useState<IRouteDay | null>(null);
  const [storeJson, setStoreJson] = useState<Record<string, IStore>>({});
  const [storesOfSelectedRouteDay, setStoresOfSelectedRouteDay] = useState<(IStore&IRouteDayStores)[]>([]);
  const [markersToShow, setMarkerToShow] = useState<(IMapMarker)[]>([]);

  // Maps
  const [mapRoutes, setMapRoutes] = useState<Record<string, IRoute>>({});
  const [mapRouteDays, setMapRouteDays] = useState<Record<string, IRouteDay>>({});
  // const [mapRouteDayStores, setMapRouteDayStores] = useState<Record<string, IRouteDayStores>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const mapOfRouteDays:Record<string, IRouteDay> = {};
    const mapOfRoutes:Record<string, IRoute> = {};
    
    const routesData = await getAllRoutes();
    const routeDaysData = await getRouteDays();
    const storesData = await getAllStores();
    
    routesData.forEach((route:IRoute) => {
      const { id_route } = route;
      mapOfRoutes[id_route] = route;
    });

    routeDaysData.forEach((routeDay:IRouteDay) => {
      const { id_route_day} = routeDay;
      mapOfRouteDays[id_route_day] = routeDay;
    });

    // Creating maps of the concepts
    setMapRouteDays(mapOfRouteDays);
    setMapRoutes(mapOfRoutes);


    // Creating states
    setRoutes(routesData);

    setRouteDays(routeDaysData.sort((routeDayA:IRouteDay, routeDayB:IRouteDay) => {
      let dayA = DAYS[routeDayA.id_day];
      let dayB = DAYS[routeDayB.id_day];

      let routeA = mapOfRoutes[routeDayA.id_route];
      let routeB = mapOfRoutes[routeDayB.id_route];

      if (routeA && routeB) {
        if (routeA.route_name == routeB.route_name) {
          if(dayA && dayB) {
            if(dayA.order_to_show < dayB.order_to_show) {
              return -1;
            } else {
              return 1;
            }
          } else {
            return 0;
          }
        } else {
          if(routeA.route_name < routeB.route_name) {
            return -1;
          } else {
            return 1;
          }
        }
      } else {
        return 0;
      }     

    }));
    setStores(storesData);



    // Convert stores to JSON for quick access
    setStoreJson(convertArrayInJsonUsingInterfaces(storesData));
  };

  const handleRouteDaySelection = async (routeDay: IRouteDay) => {
    const storesOfTheRouteDay:(IStore&IRouteDayStores)[] = [];  
    const markerOfTheRouteDay:IMapMarker[] = [];

    setSelectedRouteDay(routeDay);
    const routeDayStoresData = await getStoresOfRouteDay(routeDay);
    
    setRouteDayStores(routeDayStoresData);


    // Get stores of stores from the route day
    routeDayStoresData.forEach((routeDayStore:IRouteDayStores) => {
        const { id_store, id_route_day, position_in_route } = routeDayStore;
        if(storeJson[id_store] !== undefined) {
          const currentStore:IStore = storeJson[id_store]
          const { store_name, latitude, longuitude } = currentStore;
            storesOfTheRouteDay.push({...currentStore, ...routeDayStore}); 
            markerOfTheRouteDay.push({
              id_marker: generateUUIDv4(),
              id_item: id_store,
              hoverComponent: <InfoStoreHover store_name={store_name} position_in_route={position_in_route.toString()}/>,
              clickComponent: <InfoStoreClick store={currentStore} routeDayStores={[routeDayStore]} routeDays={mapRouteDays} routes={mapRoutes} />,
              color_item: "#64C8FF",
              id_group: id_route_day,
              latitude: latitude,
              longuitude: longuitude
            })
        }
    })

    setStoresOfSelectedRouteDay([...storesOfTheRouteDay])
    setMarkerToShow([...markerOfTheRouteDay])
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
                <TableCell>Ruta</TableCell>
                <TableCell>Dia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routeDays.map((routeDay) => (
                <TableRow key={routeDay.id_route_day} onDoubleClick={() => handleRouteDaySelection(routeDay)} className="cursor-pointer">
                  <TableCell>{capitalizeFirstLetter(routes.find((r) => r.id_route === routeDay.id_route)?.route_name) || "No se identifico la ruta"}</TableCell>
                  <TableCell>{DAYS[routeDay.id_day].day_name}</TableCell>
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
        <RouteMap markers={markersToShow} 
        onSelectStore={(store) => console.log("Selected Store:", store)} 
        />
        {/* <StoreMap stores={storesOfSelectedRouteDay} 
        onSelectStore={(store) => console.log("Selected Store:", store)} /> */}
      </div>
    </div>
  );
}
