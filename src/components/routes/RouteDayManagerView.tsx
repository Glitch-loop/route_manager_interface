"use client";

// Libraries
import { useState, useEffect } from "react";

// Interfaces
import { 
  ICatalogItem,
  IMapMarker,
    IResponse,
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

// Queries
import ListRoutesQuery from "@/application/queries/ListRoutesQuery";
import RetrieveRouteInformationQuery  from "@/application/queries/RetrieveRouteInformationQuery";


// DI container
import { di_container } from "@/infrastructure/di/container";

// Utils
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord, convertArrayInJsonUsingInterfaces, generateUUIDv4 } from "@/utils/generalUtils";

// Components
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, rgbToHex } from "@mui/material";
import MultiContainerDragDrop from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/MultiContainerDragDrop";
import RouteMap from "../general/mapComponent/RouteMap";
import InfoStoreHover from "../store/map/InfoStoreHover";
import InfoStoreClick from "../store/map/InfoStoreClick";
import DAYS from "@/utils/days";
import { generateRandomLightColor, getGradientColor, getLightestMarker } from "@/utils/stylesUtils";
import { apiResponseStatus } from "@/utils/responseUtils";
import { toast } from "react-toastify";
import RouteDTO from "@/application/dto/RouteDTO";
import { DAYS_ARRAY } from "@/core/constants/Days";
import DayType from "@/core/types/DaysType";
import ListAllRegisterdStoresQuery from "@/application/queries/ListAllRegisterdStoresQuery";
import StoreDTO from "@/application/dto/StoreDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import OrganizeRouteDayCommand from "@/application/commands/OrganizeRouteDayCommand";




export default function RouteDayManagerView() {
  const [stores, setStores] = useState<IStore[]>([]);
  const [routeDayStores, setRouteDayStores] = useState<RouteDayStoreDTO[]>([]);
  const [selectedRouteDay, setSelectedRouteDay] = useState<IRouteDay | null>(null);
  
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
  const [mapRoutes, setMapRoutes] = useState<Map<string, RouteDTO>>(new Map());
  const [mapRouteDays, setMapRouteDays] = useState<Map<string, RouteDayDTO>>(new Map());
  // const [mapRouteDayStores, setMapRouteDayStores] = useState<Map<string, RouteDayStoreDTO>>(new Map());
  
  // NEW STATES ====================
  const [routeDTOs, setRouteDTOs] = useState<RouteDTO[]>([]);
  const [storeDTOs, setStoreDTOs] = useState<StoreDTO[]>([]);
  const [mapStoreDTOs, setMapStoreDTOs] = useState<Map<string, StoreDTO>|null>(null);
  const [storesOfSelectedRouteDay, setStoresOfSelectedRouteDay] = useState<(StoreDTO&RouteDayStoreDTO)[]>([]);
  

  useEffect(() => {
    fetchData();
  }, []);

  // ----------Auxiliar functions----------
  const fetchData = async () => {
    const listRouteQuery = di_container.resolve<ListRoutesQuery>(ListRoutesQuery);
    const retrieveRouteInformationQuery = di_container.resolve<RetrieveRouteInformationQuery>(RetrieveRouteInformationQuery);
    const listStoresQuery = di_container.resolve<ListAllRegisterdStoresQuery>(ListAllRegisterdStoresQuery);

    const routes:RouteDTO[] =  await listRouteQuery.execute()
    const routeIds:string[] = routes.map(route => route.id_route);

    const routesWithInformation:RouteDTO[] = await retrieveRouteInformationQuery.execute(routeIds);

    setRouteDTOs(routesWithInformation);

    const stores:StoreDTO[] = await listStoresQuery.execute();
    setStoreDTOs(stores);

    const mapOfStoreDTOs:Map<string, StoreDTO> = new Map<string, StoreDTO>();
    stores.forEach((store:StoreDTO) => {
      mapOfStoreDTOs.set(store.id_store, store);
    });

    
    setMapStoreDTOs(mapOfStoreDTOs);

    setCatalogStores(stores.map((store:StoreDTO) => {
        return {
          id_item_in_container: '',
          id_item: store.id_store,
          item_name: capitalizeFirstLetterOfEachWord(store.store_name),
          order_to_show: 0,
          id_group: '',
        }
      }));

  };

  function createMarker(id_store: string, id_route_day: string): IMapMarker | undefined {
    // Verifications of states
    if (mapStoreDTOs === null) {
      console.error("mapStoreDTOs is null, cannot fetch store information for the route day.");  
      return
    };

      if(mapStoreDTOs.has(id_store) === true) {
        // const colorAccordingThePosition:string = getGradientColor(colorOfRoute, position_in_route, totalstoresInRouteDay );
        
        const currentStore:StoreDTO = mapStoreDTOs.get(id_store)!;
        const { store_name, latitude, longitude } = currentStore;
        const nameOfStore:string = store_name ? store_name : 'Nombre de tienda no encontrado.';


        return {
          id_marker: generateUUIDv4(),
          id_item: id_store,
          hoverComponent: <InfoStoreHover store_name={nameOfStore} route_name={""} day_name={""} position_in_route={1} />,
          clickComponent: <InfoStoreClick store={currentStore} routeDayStores={[]} routeDays={mapRouteDays} routes={mapRoutes} />,
          color_item: '#5b1e1e',
          id_group: id_route_day,
          latitude: latitude,
          longitude: longitude
        }

      }
  
  
      }

  // ----------Handlers----------
  const handleAddRouteDay = async (route: RouteDTO, routeDay: RouteDayDTO) => {
    // Variables related to the route day to add
    const { id_route, route_name } = route;
    const { id_route_day, id_day, stores } = routeDay;

    // Variables related to the map component
    const markerOfTheRouteDay:IMapMarker[] = [];
    const colorOfRoute:string = generateRandomLightColor();

    // Variables to prevent route duplication.
    let routeSelectedPreviously:boolean = false;
    
    // Verifications of states
    if (mapStoreDTOs === null) {
      console.error("mapStoreDTOs is null, cannot fetch store information for the route day.");  
      return
    };

    // Verifying the user didn't choose before the route day.
    if (catalogsRoutes) {
      catalogsRoutes.forEach((catalog:ICatalogItem[]) => {
        const currentCatalog:ICatalogItem = catalog[0];

        if(currentCatalog) {
          const { id_group } = currentCatalog;
          if(id_group === id_route_day) {
            routeSelectedPreviously = true;
            return;
          }
        }
      })
    }

    if(routeSelectedPreviously) return;

    // Variables related to drag and drop component
    const storesOfTheRouteDay:(StoreDTO&RouteDayStoreDTO)[] = [];  
    const catalogOfTheRouteDay:ICatalogItem[] = [];
      
    const day:DayType|undefined = DAYS_ARRAY.find((day) => { return id_day === day.id_day});
    const day_name:string = day ? day.day_name : 'Nombre de día no encontrado.';

    const catalogRouteToAdd:ICatalogItem = {
      id_item: id_route_day,
      id_item_in_container: generateUUIDv4(),
      id_group: id_route,
      item_name: capitalizeFirstLetterOfEachWord(route_name + ' - ' + day_name),
      order_to_show: 0,
    }

    // Retriving information of the route day
    const totalstoresInRouteDay:number = stores.length;

  
    // Get stores position from the route day
    stores.sort((a:RouteDayStoreDTO, b:RouteDayStoreDTO) => a.position_in_route - b.position_in_route);
    console.log("Stores sorted by position in route day: ", stores);
    stores.forEach((routeDayStore:RouteDayStoreDTO) => {
        const { id_store, id_route_day, position_in_route } = routeDayStore;
        
        if(mapStoreDTOs.has(id_store) === true) {
          const colorAccordingThePosition:string = getGradientColor(colorOfRoute, position_in_route, totalstoresInRouteDay );
          
          const currentStore:StoreDTO = mapStoreDTOs.get(id_store)!;
          const { store_name, latitude, longitude } = currentStore;
          const nameOfStore:string = store_name ? store_name : 'Nombre de tienda no encontrado.';

          storesOfTheRouteDay.push({...currentStore, ...routeDayStore}); 

          markerOfTheRouteDay.push({
            id_marker: generateUUIDv4(),
            id_item: id_store,
            hoverComponent: <InfoStoreHover store_name={nameOfStore} route_name={route_name} day_name={day_name} position_in_route={position_in_route} />,
            clickComponent: <InfoStoreClick store={currentStore} routeDayStores={[routeDayStore]} routeDays={mapRouteDays} routes={mapRoutes} />,
            color_item: colorAccordingThePosition,
            id_group: id_route_day,
            latitude: latitude,
            longitude: longitude
          });

          catalogOfTheRouteDay.push({
            id_item: id_store,
            id_item_in_container: generateUUIDv4(),
            item_name: capitalizeFirstLetterOfEachWord(nameOfStore),
            order_to_show: position_in_route,
            id_group: id_route_day,
          });
        }
    });

    setSelectedRouteDay(routeDay);
    setMapRouteDays(new Map(mapRouteDays.set(id_route_day, routeDay)));
    setRouteDayStores(stores);

    // Related to map component
    setMarkerToShow([...markerOfTheRouteDay, ...markersToShow]);


    setStoresOfSelectedRouteDay([...storesOfTheRouteDay, ...storesOfSelectedRouteDay]);
    setNameOfRouteCatalog([{ ...catalogRouteToAdd }, ...nameOfRoutesCatalog]);

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
        
        const routeDay:RouteDayDTO = {
          id_route_day: routeCatalogItem.id_item,
          id_route: '',
          id_day: '',
          stores: []
        }

        const routeDayStores:RouteDayStoreDTO[] = catalogsRoutes[column].map((itemCatalog:ICatalogItem) => {
          const { id_item, id_group, order_to_show} = itemCatalog;
          console.log("Order to show: " , order_to_show)
          return {
            id_route_day_store: '',
            position_in_route: order_to_show,
            id_route_day: id_group,
            id_store: id_item
          }
        })
        
        const organizeRouteDayCommand = di_container.resolve<OrganizeRouteDayCommand>(OrganizeRouteDayCommand)

        await organizeRouteDayCommand.execute(routeDay, routeDayStores);

        // const responseRouteDayStore:IResponse<null> = await updateRouteDayStores(routeDay, routeDayStores);

        // if(apiResponseStatus(responseRouteDayStore, 201)) {
        //   handleDeleteRouteFromStates(column)
        //   toast.success("Se ha actualizado la ruta correctamente");
        // } else {
        //   toast.error("Ha habido un error al momento de actualizar la ruta");
        // }
      }
    }

    fetchData();
  };

  const handleDeleteRouteFromStates = (column: number) => {
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

  const handlerMondifyCatalogRoutes = (matrix:ICatalogItem[][]): void => {
    /*
    This a map to know which fields of the DTOs are used in CatalogItem
      id_item: id of the store,
      id_item_in_container: ID generated at moment of adding the route to this section,
      id_group: id of the route day (not get confused with the id of the route),
      item_name: Name of the store,
      order_to_show: Order to be displayed,
    */
    const markerOfTheRouteDay:IMapMarker[] = [];
    
    if (mapStoreDTOs === null) {
      console.error("mapStoreDTOs is null, cannot fetch store information for the route day.");
      return;
    }

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
        const { id_item_in_container, id_item, id_group, order_to_show  } = currentItem;
        
        if(mapStoreDTOs.has(id_item) === true) {
          const currentStore:StoreDTO = mapStoreDTOs.get(id_item)!;
          const { store_name, latitude, longitude } = currentStore;
          const colorAccordingThePosition:string = getGradientColor(colorOfRoute, order_to_show, totalItemsInCatalog);
          const nameOfStore:string = store_name ? store_name : 'Nombre de tienda no encontrado.';
          let day_name:string = 'Nombre de día no encontrado.';
          let route_name:string = 'Nombre de ruta no encontrado.';
          
          if (mapRouteDays.has(id_group) === true) {
            const selectedRouteDay = mapRouteDays.get(id_group)!;
            console.log("Selected Route Day: ", selectedRouteDay.id_route_day);
            const { id_day, id_route } = selectedRouteDay;
            const day:DayType|undefined = DAYS_ARRAY.find((day) => { return id_day === day.id_day});
            day_name = day ? day.day_name : 'Nombre de día no encontrado.';
            
            const route:RouteDTO|undefined = routeDTOs.find((route) => {return route.id_route === id_route});
            route_name = route ? route.route_name : 'Nombre de ruta no encontrado.';
          }

          markerOfTheRouteDay.push({
            id_marker: generateUUIDv4(),
            id_item: id_item_in_container,
            hoverComponent: <InfoStoreHover store_name={nameOfStore} route_name={route_name} day_name={day_name} position_in_route={order_to_show} />,
            clickComponent: <InfoStoreClick store={currentStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
            color_item: colorAccordingThePosition,
            id_group: id_group,
            latitude: latitude,
            longitude: longitude
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
      const foundStore:undefined|StoreDTO = storeDTOs.find((store) => store.id_store === item.id_item);

      if (foundStore) {
        const routeDayStore:IRouteDayStores = {
          id_route_day_store: "",
          position_in_route: order_to_show,
          id_route_day: id_group,
          id_store: id_item
        }
        const newMarker: IMapMarker|undefined = createMarker(item.id_item, item.id_group);

        if (newMarker) {
          updatedHoveredStores.push(newMarker);
        }
        // updatedHoveredStores.push(
        //   {
        //     id_marker: generateUUIDv4(),
        //     id_item: foundStore.id_store,
        //     hoverComponent: <InfoStoreHover store={foundStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes}/>,
        //     clickComponent: <InfoStoreClick store={foundStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
        //     color_item: '#5b1e1e'	,
        //     id_group: '',
        //     latitude: foundStore.latitude,
        //     longitude: foundStore.longitude,
        //   },
        // )
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
      const foundStore:undefined|StoreDTO = storeDTOs.find((store) => store.id_store === selectedItem.id_item);
      
      updatedSelectedStores = storeSelected.filter((marker) => marker.id_group !== selectedItem.id_group);
      if (foundStore) {
          const newMarker: IMapMarker|undefined = createMarker(selectedItem.id_item, selectedItem.id_group);
    
          if (newMarker) {
            updatedSelectedStores.push(newMarker);
          }      
          // updatedSelectedStores.push(
          //   {
          //     id_marker: generateUUIDv4(),
          //     id_item: foundStore.id_store,
          //     hoverComponent: <InfoStoreHover store={foundStore} routeDayStore={routeDayStore} routeDays={mapRouteDays} routes={mapRoutes}/>,
          //     clickComponent: <InfoStoreClick store={foundStore} routeDayStores={routeDayStores} routeDays={mapRouteDays} routes={mapRoutes} />,
          //     color_item: '#FF9980'	,
          //     id_group: selectedItem.id_group,
          //     latitude: foundStore.latitude,
          //     longuitude: foundStore.longuitude,
          //   }
          // );
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
                {routeDTOs.map((route:RouteDTO) => {
                const { route_day_by_day, route_name } = route;

                  if (route_day_by_day === null) return null;

                  return DAYS_ARRAY.map((day: DayType) => {
                    const { id_day, day_name } = day;
                    
                    if (route_day_by_day.has(id_day)) {
                      const routeDay = route_day_by_day.get(id_day)!;
                      const { id_route_day } = routeDay;
                      return (
                        <TableRow key={id_route_day} onDoubleClick={() => handleAddRouteDay(route, routeDay)} className="cursor-pointer">
                          <TableCell>{capitalizeFirstLetter(route_name)}</TableCell>
                          <TableCell>{day_name}</TableCell>
                        </TableRow>
                      )
                    } else {
                      return null;
                    }

                  });
                }
                )}
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
            onClose={(column:number) => {handleDeleteRouteFromStates(column)}}
            onModifyCatalogMatrix={(matrix:ICatalogItem[][]) => {handlerMondifyCatalogRoutes(matrix)}}
            onHoverOption={(item:ICatalogItem|null) => { handleHoverItem(item) }}
            onSelectExistingItem={(id_item:ICatalogItem) => {handleSelectItem(id_item)}} />
        )}
      </div>
    </div>
  );
}
