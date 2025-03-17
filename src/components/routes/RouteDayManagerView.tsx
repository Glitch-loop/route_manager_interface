"use client";
// Libraries
import { useState, useEffect } from "react";

// Interfaces
import { 
  ICatalogItem,
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
    updateRouteDayStores, 
    getStoresOfRouteDay
 } from "@/controllers/RoutesController";

import { getAllStores } from "@/controllers/StoreController";

// Utils
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord, convertArrayInJsonUsingInterfaces, generateUUIDv4 } from "@/utils/generalUtils";

// Components
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, rgbToHex } from "@mui/material";
import MultiContainerDragDrop from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/MultiContainerDragDrop";
import StoreMap from "@/components/general/mapComponent/StoreMap";
import RouteMap from "../general/mapComponent/RouteMap";
import InfoStoreHover from "../store/map/InfoStoreHover";
import InfoStoreClick from "../store/map/InfoStoreClick";
import DAYS from "@/utils/days";
import { generateRandomLightColor, getGradientColor, getLightestMarker } from "@/utils/stylesUtils";

export default function RouteDayManagerView() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [routeDays, setRouteDays] = useState<IRouteDay[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [routeDayStores, setRouteDayStores] = useState<IRouteDayStores[]>([]);
  const [selectedRouteDay, setSelectedRouteDay] = useState<IRouteDay | null>(null);
  const [storeJson, setStoreJson] = useState<Record<string, IStore>>({});
  const [storesOfSelectedRouteDay, setStoresOfSelectedRouteDay] = useState<(IStore&IRouteDayStores)[]>([]);

  // Map component
  const [markersToShow, setMarkerToShow] = useState<IMapMarker[]>([]);
  const [temporalMarkers, setTemporalMarkers] = useState<IMapMarker[]>([]);
  const [storeHoverd, setStoreHovered] = useState<IMapMarker[]>([]);
  const [storeSelected, setSelectedStore] = useState<IMapMarker[]>([]);
  
  // Drag and drop component
  const [catalogsRoutes, setCatalogsRoutes] = useState<ICatalogItem[][]|null>(null);
  const [catalogStores, setCatalogStores] = useState<ICatalogItem[]>([]);
  const [nameOfRoutesCatalog, setNameOfRouteCatalog] = useState<ICatalogItem[]>([]);
  
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

    setCatalogStores(storesData.map((store:IStore) => { 
      const { id_store, store_name } = store;
      return { 
      id_item: id_store,
      id_item_in_container: generateUUIDv4(),
      item_name: store_name,
      id_group: '',
      order_to_show: 0,
    }}))

    // Convert stores to JSON for quick access
    setStoreJson(convertArrayInJsonUsingInterfaces(storesData));
  };

  // Related to the table
  const handleAddRouteDay = async (routeDay: IRouteDay) => {
    // Variables to prevent route duplication.
    let routeSelectedPreviously:boolean = false;
    
    // Variables related to drag and drop component
    const storesOfTheRouteDay:(IStore&IRouteDayStores)[] = [];  
    const catalogOfTheRouteDay:ICatalogItem[] = [];
    const catalogRoute:ICatalogItem = {
      id_item: '',
      id_item_in_container: '',
      id_group: '',
      item_name: '',
      order_to_show: 0,
    }

    // Variables related to the map component
    const markerOfTheRouteDay:IMapMarker[] = [];
    const colorOfRoute:string = generateRandomLightColor();

    // Verifying the user didn't choose before the route day.
    if (catalogsRoutes) {
      catalogsRoutes.forEach((catalog:ICatalogItem[]) => {
        if(catalog[0]) {
          if(catalog[0].id_group === routeDay.id_route_day) {
            routeSelectedPreviously = true;
            return;
          }
        }
      })
    }

    if(routeSelectedPreviously) return;

    // Retriving information of the route day
    const { id_route, id_day, id_route_day } = routeDay;
    const routeDayStoresData = await getStoresOfRouteDay(routeDay);
    const totalstoresInRouteDay:number = routeDayStoresData.length;


    // Catalog item for the route day itself.
    catalogRoute.id_item_in_container = generateUUIDv4();
    catalogRoute.id_item = id_route_day;
    catalogRoute.id_group = id_route;
    if(mapRoutes[id_route]) catalogRoute.item_name = capitalizeFirstLetter(mapRoutes[id_route].route_name) + ' - ';
    if(DAYS[id_day]) catalogRoute.item_name = catalogRoute.item_name + DAYS[id_day].day_name;
    catalogRoute.order_to_show = 0;
    

    // Get stores position from the route day
    routeDayStoresData.forEach((routeDayStore:IRouteDayStores) => {
        const { id_store, id_route_day, position_in_route } = routeDayStore;
        if(storeJson[id_store] !== undefined) {
          const colorAccordingThePosition:string = getGradientColor(colorOfRoute, position_in_route, totalstoresInRouteDay );
          
          const currentStore:IStore = storeJson[id_store];
          const { store_name, latitude, longuitude } = currentStore;

          storesOfTheRouteDay.push({...currentStore, ...routeDayStore}); 
          
          markerOfTheRouteDay.push({
            id_marker: generateUUIDv4(),
            id_item: id_store,
            hoverComponent: <InfoStoreHover store={currentStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes} />,
            clickComponent: <InfoStoreClick store={currentStore} routeDayStores={[routeDayStore]} routeDays={mapRouteDays} routes={mapRoutes} />,
            color_item: colorAccordingThePosition,
            id_group: id_route_day,
            latitude: latitude,
            longuitude: longuitude
          });

          catalogOfTheRouteDay.push({
            id_item: id_store,
            id_item_in_container: generateUUIDv4(),
            item_name: capitalizeFirstLetterOfEachWord(store_name),
            order_to_show: position_in_route,
            id_group: id_route_day,
          });
        }
    });

    setSelectedRouteDay(routeDay);
    setRouteDayStores(routeDayStoresData);

    setStoresOfSelectedRouteDay([...storesOfTheRouteDay, ...storesOfSelectedRouteDay]);
    setMarkerToShow([...markerOfTheRouteDay, ...markersToShow]);
    setNameOfRouteCatalog([{ ...catalogRoute }, ...nameOfRoutesCatalog]);

    if (catalogsRoutes) {
      setCatalogsRoutes([[...catalogOfTheRouteDay], ...catalogsRoutes])
    } else {
      setCatalogsRoutes([[...catalogOfTheRouteDay]])
    }
  };

  // Related drag and drop component
  const handleSaveRouteDay = async (column: number, routeCatalogItem:ICatalogItem) => {
    // the list that lists the route day will be taken as the truth table.

    if (catalogsRoutes) {
      if(catalogsRoutes[column]) {

        if (!selectedRouteDay) return;
        
        const routeDay:IRouteDay = {
          id_route_day: routeCatalogItem.id_item,
          id_route: '',
          id_day: ''
        }

        const routeDayStores:IRouteDayStores[] = catalogsRoutes[column].map((itemCatalog:ICatalogItem) => {
          const { id_item, id_group, order_to_show} = itemCatalog;
          return {
            id_route_day_store: '',
            position_in_route: order_to_show,
            id_route_day: id_group,
            id_store: id_item
          }
        })

        await updateRouteDayStores(routeDay, routeDayStores);
      }
    }

    fetchData();
  };

  const handleClose = (column: number) => {
    const updatedMatrix:ICatalogItem[][] = [];
    let id_group_to_delete:string|null = null;
    
    if (catalogsRoutes) {
      for(let i = 0; i < catalogsRoutes.length; i++) {
        if (i !== column) {
          updatedMatrix.push(catalogsRoutes[i]);
        } else {
          if (catalogsRoutes[i][0]) {
            id_group_to_delete = catalogsRoutes[i][0].id_group;
          }
        }
      }
      
      if (updatedMatrix.length > 0) {
        setCatalogsRoutes([...updatedMatrix]);
      } else {
        setCatalogsRoutes(null)
      }

      if (id_group_to_delete) {
        setMarkerToShow(markersToShow.filter((marker) => marker.id_group !== id_group_to_delete));
        const updatedStoreHovered:IMapMarker[] = [];
        const updatedSelectedStore:IMapMarker[] = storeSelected.filter((marker) => marker.id_group !== id_group_to_delete);
        setStoreHovered(updatedStoreHovered);
        setSelectedStore(updatedSelectedStore);
        setTemporalMarkers([...updatedStoreHovered, ...updatedSelectedStore]);

      }

      setNameOfRouteCatalog(nameOfRoutesCatalog.filter((routeName, index) => index !== column));
    }
  }

  const handlerMondifyCatalogRoutes = (matrix:ICatalogItem[][]) => {
    const markerOfTheRouteDay:IMapMarker[] = [];


    matrix.forEach((currentCatalog:ICatalogItem[]) => {
      let colorOfRoute:string = generateRandomLightColor();
      const totalItemsInCatalog:number = currentCatalog.length;

      // Extracting color of the route
      if(currentCatalog[0]) {
        const { id_group } = currentCatalog[0];
        const lightestMarker:IMapMarker|null = getLightestMarker(
          markersToShow.filter((marker) => {return marker.id_group === id_group}));
        
        if (lightestMarker){
          colorOfRoute = rgbToHex(lightestMarker.color_item);
        }

      }

      // Making route
      currentCatalog.forEach((currentItem:ICatalogItem) => {
        const {id_item, id_group, order_to_show  } = currentItem;
        
        if(storeJson[id_item] !== undefined) {
          const currentStore:IStore = storeJson[id_item];
          const { latitude, longuitude } = currentStore;
          const colorAccordingThePosition:string = getGradientColor(colorOfRoute, order_to_show, totalItemsInCatalog);
          const routeDayStore:IRouteDayStores = {
            id_route_day_store: "",
            position_in_route: order_to_show,
            id_route_day: id_group,
            id_store: id_item
          }
          markerOfTheRouteDay.push({
            id_marker: generateUUIDv4(),
            id_item: id_item,
            hoverComponent: <InfoStoreHover store={currentStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes}/>,
            clickComponent: <InfoStoreClick store={currentStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
            color_item: colorAccordingThePosition,
            id_group: id_group,
            latitude: latitude,
            longuitude: longuitude
          });
        }
      });
    });

    setCatalogsRoutes(matrix);
    
    setMarkerToShow([ ...markerOfTheRouteDay ]);

  }

  const handleHoverItem = (item:ICatalogItem|null) => {
    const updatedHoveredStores:IMapMarker[] = [];
    
    if (item) {
      const { order_to_show, id_group, id_item } = item;
      const foundStore:undefined|IStore = stores.find((store) => store.id_store === item.id_item);

      if (foundStore) {
        const routeDayStore:IRouteDayStores = {
          id_route_day_store: "",
          position_in_route: order_to_show,
          id_route_day: id_group,
          id_store: id_item
        }

        updatedHoveredStores.push(
          {
            id_marker: generateUUIDv4(),
            id_item: foundStore.id_store,
            hoverComponent: <InfoStoreHover store={foundStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes}/>,
            clickComponent: <InfoStoreClick store={foundStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
            color_item: '#F08080'	,
            id_group: '',
            latitude: foundStore.latitude,
            longuitude: foundStore.longuitude,
          },
        )
      }
    } else {
      /* Do nothing */
    }

    setStoreHovered(updatedHoveredStores);
    setTemporalMarkers([...updatedHoveredStores, ...storeSelected]);
  }

  const handleSelectItem = (selectedItem:ICatalogItem) => {
    let updatedSelectedStores:IMapMarker[] = [];
    const { order_to_show, id_group, id_item } = selectedItem;
    const routeDayStore:IRouteDayStores = {
      id_route_day_store: "",
      position_in_route: order_to_show,
      id_route_day: id_group,
      id_store: id_item
    }

    const foundMarker:undefined|IMapMarker = storeSelected.find((marker) => marker.id_item === selectedItem.id_item);


    if (foundMarker === undefined) {
      const foundStore:undefined|IStore = stores.find((store) => store.id_store === selectedItem.id_item);
      
      updatedSelectedStores = storeSelected.filter((marker) => marker.id_group !== selectedItem.id_group);
      
        if (foundStore) {
          updatedSelectedStores.push(
            {
              id_marker: generateUUIDv4(),
              id_item: foundStore.id_store,
              hoverComponent: <InfoStoreHover store={foundStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes}/>,
              clickComponent: <InfoStoreClick store={foundStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
              color_item: '#FF9980'	,
              id_group: selectedItem.id_group,
              latitude: foundStore.latitude,
              longuitude: foundStore.longuitude,
            }
          );
        }
    } else {
      updatedSelectedStores.filter((marker) => marker.id_item !== foundMarker.id_item);
    }

      setTemporalMarkers([...storeHoverd, ...updatedSelectedStores])
      setSelectedStore([ ...updatedSelectedStores ]);
    
  }

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="h-1/2 flex flex-row">
        {/* Left Side */}
        {/* Route Days Table */}
        <div className="basis-1/2 overflow-hidden">
          <TableContainer component={Paper} className="overflow-y-auto max-h-full">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Ruta</TableCell>
                  <TableCell>Dia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routeDays.map((routeDay) => (
                  <TableRow key={routeDay.id_route_day} onDoubleClick={() => handleAddRouteDay(routeDay)} className="cursor-pointer">
                    <TableCell>{capitalizeFirstLetter(routes.find((r) => r.id_route === routeDay.id_route)?.route_name) || "No se identifico la ruta"}</TableCell>
                    <TableCell>{DAYS[routeDay.id_day].day_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {/* Right Side - Store Map */}
        <div className="basis-1/2 ml-2 overflow-hidden">
          <RouteMap 
            markers={markersToShow}
            temporalMarkers={temporalMarkers}
            onSelectStore={(store) => console.log("Selected Store:", store)} 
          />
        </div>
      </div>
      <div className="h-1/2 mt-3 flex basis-2/3 overflow-y-auto">
        {/* MultiContainerDragDrop for Route Stores */}
        {catalogsRoutes && (
          <MultiContainerDragDrop
            catalogMatrix={catalogsRoutes}
            catalogTitles={nameOfRoutesCatalog}
            allItems={catalogStores}
            onSave={(column:number, catalogItem:ICatalogItem) => {handleSaveRouteDay(column, catalogItem)}}
            onClose={(column:number) => {handleClose(column)}}
            onModifyCatalogMatrix={(matrix:ICatalogItem[][]) => {handlerMondifyCatalogRoutes(matrix)}}
            onHoverOption={(item:ICatalogItem|null) => { handleHoverItem(item) }}
            onSelectExistingItem={(id_item:ICatalogItem) => {handleSelectItem(id_item)}} />
        )}
      </div>
    </div>
  );
}
