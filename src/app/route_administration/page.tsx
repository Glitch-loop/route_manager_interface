// Critial imports
"use client";
import 'reflect-metadata';

// Libraries
import { useEffect, useState, useMemo } from "react";
import { Button, ButtonGroup, Collapse, Dialog, IconButton, List, ListItem, Tooltip } from "@mui/material";

// DTOs
import UserDTO from "@/application/dto/UserDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";
import RouteTransactionDTO from "@/application/dto/RouteTransactionDTO";

// Queries
import ListRoutesQuery from "@/application/queries/ListRoutesQuery";
import RetrieveRouteInformationQuery  from "@/application/queries/RetrieveRouteInformationQuery";
import ListAllRegisterdStoresQuery from "@/application/queries/ListAllRegisterdStoresQuery";
import OrganizeRouteDayCommand from "@/application/commands/OrganizeRouteDayCommand";
import ListRouteTransactionsByStoreWithinDateRange from "@/application/queries/ListRouteTransactionsByStoreWithinDateRange";

// DI container
import { di_container } from "@/infrastructure/di/container";

// UI components
import { ChevronLeft, ChevronRight, KeyboardArrowUp, KeyboardArrowDown, Menu as MenuIcon } from "@mui/icons-material";
import RouteForm from "./components/RouteForm";
import SearchRoute from "./components/SearchRoute";
import StoreForm from "./components/StoreForm";
import RouteExpandMenu from "@/shared/components/RoutesExpandMenu/RoutesExpandMenu";
import RouteDayContainer from "./components/RouteDayContainer/RouteDayContainer";

// Utils
import { createMapStoresInRouteDay, getRouteDayFromRoutesList } from '@/shared/utils/routes/utils';

import { IMapMarker } from '@/shared/components/MarkerMap/interfaces/interfaces';
import { coordinates } from '@/shared/components/MarkerMap/types/types';
import MarkerMap from '@/shared/components/MarkerMap/MarkerMap';
import { generateRandomColor, getGradientColor } from '@/shared/utils/styles/utils';

import { DraggableRouteDayStore, MarkerGroup, RouteDayEffect } from './types/types';
import { getAddressOfStore } from '@/shared/utils/stores/utils';
import { StorePositionInRouteType } from '@/shared/types/types';
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from '@/shared/utils/strings/utils';
import StoreSearchBar from './components/StoreSearchBar';
import { findStoresAround } from '@/shared/utils/clients/utils';
import { RANGE_OPTIONS } from './constants/constants';
import SimpleCard from '@/shared/components/Cards/SimpleCard/SimpleCard';


function createMapHoverComponent(store: StoreDTO): any {
    const storeName = store.store_name ?? "Nombre no disponible";
    const storeAddress = getAddressOfStore(store);

    return (
        <div className="p-2">
            <p className="text-lg font-semibold">{capitalizeFirstLetterOfEachWord(storeName)}</p>
            <p className="text-base text-gray-600">{storeAddress}</p>
        </div>
    )
}


function createMapClickComponent(store: StoreDTO, storePositions: StorePositionInRouteType[]): any {
    const { id_store } = store;
	const storeName = store.store_name ?? "Nombre no disponible";
    const storeAddress = getAddressOfStore(store);
    const modifiedRouteDayIds: Set<string> = new Set(); // Replace with actual logic to get modified route day IDs

    return (
        <div className="p-3 min-w-[280px]">
            <h4 className="font-bold text-lg mb-2">{storeName}</h4>
            <p className="text-sm text-gray-600 mb-1">{id_store}</p>
            <p className="text-sm text-gray-600 mb-1">{storeAddress}</p>
            {store.address_reference && (
                <p className="text-sm text-gray-500 mt-1">Referencias: {store.address_reference}</p>
            )}
            
            {/* Route days table */}
            {storePositions.length > 0 && (
                <div className="mt-3 border-t pt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Días de ruta:</p>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-1 pr-2">Ruta</th>
                                <th className="text-left py-1 pr-2">Día</th>
                                <th className="text-center py-1">Pos.</th>
                                <th className="w-6"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {storePositions.map((pos) => {
                                const isBeingModified = modifiedRouteDayIds.has(pos.idRouteDay);
                                return (
                                    <tr key={pos.idRouteDayStore} className="border-b border-gray-100">
                                        <td className="py-1 pr-2">{capitalizeFirstLetter(pos.routeName)}</td>
                                        <td className="py-1 pr-2">{capitalizeFirstLetter(pos.dayName)}</td>
                                        <td className="py-1 text-center">{pos.position}</td>
                                        <td className="py-1 text-center">
                                            {isBeingModified && (
                                                <Tooltip title="Día de ruta en modificación" arrow placement="top">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full cursor-help">
                                                        <span className="text-white text-xs font-bold">!</span>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    // Collapse menu states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
    const [topPanelOpen, setTopPanelOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDTO | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreDTO | null>(null);
    const [routeMenuAnchor, setRouteMenuAnchor] = useState<HTMLElement | null>(null);

    // Application states
    const [routes, setRoutes] = useState<RouteDTO[]>([]); // Source of truth for route days.
    
    // States related to store information.
    const [stores, setStores] = useState<StoreDTO[]>([]);
    const [mapStores, setMapStores] = useState<Map<string, StoreDTO>>(new Map()); // Map of store ID to StoreDTO for quick access
    const [mapRouteTransactionByStore, setMapRouteTransactionByStore] = useState<Map<string, RouteTransactionDTO[]>>(new Map()); // Map of store ID to list of route transactions
    const [mapStoresInRouteDay, setMapStoresInRouteDay] = useState<Map<string, StorePositionInRouteType[]>>(new Map()); // Map of store ID to StoreDTO for stores in the selected route day
	const [storeWithinRouteAssigned, setStoreWithinRouteAssigned] = useState<Set<string>>(new Set()); // Set of store IDs that are already assigned within the route being modified, used to avoid showing them in the search results when modifying a route day.

    // States related to route day.
    const [routesInModification, setRoutesInModification] = useState<Record<string, DraggableRouteDayStore[]>>({}); // Keep track of routes that are being modified to apply special effects on map markers.
    const [effectSelectedRouteDay, setEffectSelectedRouteDay] = useState<Map<string, RouteDayEffect>>(new Map());
    
    // States related to expand menu.
    const [checkedRouteDays, setCheckedRouteDays] = useState<Record<string, boolean>>({});
    const [pendingUnselectRouteDayId, setPendingUnselectRouteDayId] = useState<string | null>(null);
    
    // State for the map
    const [hoveredStore, setHoveredStore] = useState<StoreDTO | null>(null);
    const [selectedRouteDayStore, setSelectedRouteDayStore] = useState<string | null>(null);
	const [searchByCoords, setSearchByCoords] = useState<boolean>(false);
	const [includeDeactiveStores, setIncludeDeactiveStores] = useState<boolean>(false);
	const [selectedRange, setSelectedRange] = useState<number>(RANGE_OPTIONS[3].value);
	const [storesFoundByPosition, setStoresFoundByPosition] = useState<StoreDTO[]>([]);
	const [selectedCoordinate, setSelectedCoordinate] = useState<coordinates | null>(null);
	const [totalStoresFoundBySearchRange, setTotalStoresFoundBySearchRange] = useState<number | null>(null);

	// States related search bar
	const [searchedStore, setSearchedStore] = useState<StoreDTO|null>(null);
	const [hideCoordSearchResults, setHideCoordSearchResults] = useState<boolean>(false);

    const [vendors, setVendors] = useState<UserDTO[]>([
        {
            id_vendor: "1",
            cellphone: "1234567890",
            name: "Jhon Doe",
            password: null,
            status: null,
        }
    ]);

    const [administrationView, setAdministrationView] = useState(2); // 1 for Routes, 2 for Stores


    // Use effects
    useEffect(() => { fetchScreenInformation(); }, [])

    useEffect(() => {
		const mapStoresInRouteDay = createMapStoresInRouteDay(routes);
        setMapStoresInRouteDay(mapStoresInRouteDay);

		const storeWithinRouteAssigned = new Set<string>();

		stores.forEach(store => {
			const { id_store } = store;
			if (!mapStoresInRouteDay.has(id_store)) {
				storeWithinRouteAssigned.add(id_store);
			}
		});

		setStoreWithinRouteAssigned(storeWithinRouteAssigned);
    }, [routes])

    // Auxiliar functions
    const fetchScreenInformation = async () => {
        // Injecting dependencies
        const listRouteQuery = di_container.resolve<ListRoutesQuery>(ListRoutesQuery);
        const retrieveRouteInformationQuery = di_container.resolve<RetrieveRouteInformationQuery>(RetrieveRouteInformationQuery);
        // Retrieve routes.
        const routes:RouteDTO[] =  await listRouteQuery.execute();
        const routeIds:string[] = routes.map(route => route.id_route);
        // const routesWithInformation:RouteDTO[] = await 
        retrieveRouteInformationQuery.execute(routeIds)
        .then((routesWithInformation:RouteDTO[]) => {
            setRoutes(routesWithInformation);
        });


        // Retrieve stores.
        fetchStores();
    }


    const fetchStores = async () => {
        const listStoresQuery = di_container.resolve<ListAllRegisterdStoresQuery>(ListAllRegisterdStoresQuery);
        // const stores:StoreDTO[] = await 
        listStoresQuery.execute()
        .then((stores:StoreDTO[]) => {
            setStores(stores);
            const storeMap = new Map<string, StoreDTO>();
            stores.forEach(store => {
                storeMap.set(store.id_store, store);
            });
            setMapStores(storeMap);
        });
    }

    // Memoized components
    const mapMarkers = useMemo<IMapMarker[]>(() => {
        const markers: IMapMarker[] = [];
                
        Object.entries(routesInModification).forEach(([idRouteDay, stores]) => {
            const effect = effectSelectedRouteDay.get(idRouteDay);
            
            // Skip if showStores is false
            if (!effect?.showStores) return;
            
            const baseColor = effect.assignedColor;
            const totalStores = stores.length;
            
            stores.forEach((routeDayStore, storeIndex) => {
                const store = mapStores.get(routeDayStore.id_store);
                if (store !== undefined) {
                    const { latitude, longitude, id_store } = store;
                    const { id_route_day_store } = routeDayStore;
                    // Get all route days where this store belongs
                    const storePositions = mapStoresInRouteDay.get(id_store) ?? [];

                    // Calculate gradient color: first store is lightest, last store is darkest
                    const gradientColor = totalStores > 1 
                        ? getGradientColor(baseColor, totalStores - 1 - storeIndex, totalStores) 
                        : baseColor;
                    
                    markers.push({
                        id_marker: id_route_day_store,
                        id_item: id_store,
                        id_group: idRouteDay,
                        color_item: gradientColor,
                        latitude: latitude,
                        longitude: longitude,
                        hoverComponent: createMapHoverComponent(store),
                        clickComponent: createMapClickComponent(store, storePositions),
                    });
                }
            });
        });
        
        if (hoveredStore !== null) {
            const { id_store, latitude, longitude } = hoveredStore;
            const storePositions = mapStoresInRouteDay.get(hoveredStore.id_store) ?? [];
			const markerGroup:MarkerGroup = "searchbar-hovered-coord";
            markers.push({
                id_marker: generateRandomColor(), // Unique ID for hovered store marker
                id_item: id_store,
                id_group: markerGroup,
                color_item: "#FF8C00", // Default color
                latitude: latitude,
                longitude: longitude,
                hoverComponent: createMapHoverComponent(hoveredStore),
                clickComponent: createMapClickComponent(hoveredStore, storePositions),
            });   
        }

        if (searchedStore !== null) {
            const { id_store, latitude, longitude } = searchedStore;
            const storePositions = mapStoresInRouteDay.get(searchedStore.id_store) ?? [];
			const markerGroup:MarkerGroup = "searchbar-searched-store";
            markers.push({
                id_marker: generateRandomColor(), // Unique ID for searched store marker
                id_item: id_store,
                id_group: markerGroup,
                color_item: "#bd2cb6", // Default color
                latitude: latitude,
                longitude: longitude,
                hoverComponent: createMapHoverComponent(searchedStore),
                clickComponent: createMapClickComponent(searchedStore, storePositions),
            });   
        }


		if (!hideCoordSearchResults) {
			storesFoundByPosition.forEach((store) => {
				const { id_store, latitude, longitude } = store;
				const storePositions = mapStoresInRouteDay.get(store.id_store) ?? [];
				const markerGroup:MarkerGroup = "store-found-by-coords";
				markers.push({
					id_marker: generateRandomColor(), // Unique ID for store found by coordinates
					id_item: id_store,
					id_group: markerGroup,
					color_item: "#3713da", // Default color
					latitude: latitude,
					longitude: longitude,
					hoverComponent: createMapHoverComponent(store),
					clickComponent: createMapClickComponent(store, storePositions),
				});
			});
		}


		if (selectedCoordinate) {
			if (!hideCoordSearchResults) {
				const { Lat, Lng } = selectedCoordinate;
				const markerGroup:MarkerGroup = "pivot-coord-search";
				markers.push({
					id_marker: generateRandomColor(), // Unique ID for store found by coordinates
					id_item: generateRandomColor(),
					id_group: markerGroup,
					color_item: "#dc3d35", // Default color
					latitude: Lat.toString(),
					longitude: Lng.toString(),
					hoverComponent: <span>Click para cancelar busqueda</span>,
					clickComponent: null,
				});
			}
		}


	

        return markers;
    }, [
        routesInModification, // Provides the route days currently being modified
        mapStores, // Provides store information including coordinates
        effectSelectedRouteDay, // Provides effects that will be applied to the markers
        mapStoresInRouteDay, // Provides information about which route days each store belongs to for the hover and click components
        hoveredStore,
		searchedStore,
		storesFoundByPosition,
		selectedCoordinate,
		hideCoordSearchResults
    ]);

    // Handlers - Route menu
    const handleRouteSelect = (route: RouteDTO) => { setSelectedRoute(route); };

    const handleCancel = () => { setSelectedRoute(null); };

    // Handlers - Store menu
    const handleStoreCancel = () => { setSelectedStore(null); };

    // Handlers - Administration menu management
    const handleAdministrationView = (option: number) => { setAdministrationView(option); }

    // Handlers - Route day menu selection
    const handleRouteDaySelect = (routeDayId: string, state: boolean) => {
        if(state) { // Add route day because it was selected
            // Check if already selected to avoid duplication
            if (routesInModification[routeDayId]) return;
            
            const routeDayFound:RouteDayDTO|null = getRouteDayFromRoutesList(routes, routeDayId);
            
            if (routeDayFound !== null) {
                // Transform RouteDayStoreDTO[] to DraggableRouteDayStore[] for dnd-kit compatibility
                const draggableStores: DraggableRouteDayStore[] = (routeDayFound.stores || []).map(store => ({
                    ...store,
                    id: store.id_route_day_store,
                }));
                
                // Add to routesInModification
                setRoutesInModification(prev => ({
                    ...prev,
                    [routeDayId]: draggableStores,
                }));
                
                // Set effects for map markers
                setEffectSelectedRouteDay(prev => {
                    const newMap = new Map(prev);
                    newMap.set(routeDayId, {
                        showStores: true,
                        assignedColor: generateRandomColor()
                    });
                    return newMap;
                });
            }
        } else { // Show confirmation dialog before unselecting
            setPendingUnselectRouteDayId(routeDayId);
        }
    }

    const handleConfirmUnselectRouteDay = () => {
        if (pendingUnselectRouteDayId) {
            // Remove route day from routesInModification
            setRoutesInModification(prev => {
                const updated = { ...prev };
                delete updated[pendingUnselectRouteDayId];
                return updated;
            });
            
            // Remove from checkedRouteDays
            setCheckedRouteDays(prev => {
                const newCheckedDays = { ...prev };
                delete newCheckedDays[pendingUnselectRouteDayId];
                return newCheckedDays;
            });

            // Remove effects
            setEffectSelectedRouteDay(prev => {
                const newMap = new Map(prev);
                newMap.delete(pendingUnselectRouteDayId);
                return newMap;
            });
        }
        setPendingUnselectRouteDayId(null);
    }

    const handleCancelUnselectRouteDay = () => {
        // Revert the checkbox state since user cancelled
        if (pendingUnselectRouteDayId) {
            setCheckedRouteDays(prev => ({
                ...prev,
                [pendingUnselectRouteDayId]: true
            }));
        }
        setPendingUnselectRouteDayId(null);
    }

    // Handlers - Route day modification (route container).
    const handleRetrieveRouteTransactions = async (startDate: Date, endDate: Date, idStores: string[]) => {
        // TODO: Optimize logic to avoid retrieving transactions that are already in the map and are within the date range.
        const listTransactionsQuery = di_container.resolve<ListRouteTransactionsByStoreWithinDateRange>(
            ListRouteTransactionsByStoreWithinDateRange
        );
        
        await  listTransactionsQuery.execute(idStores, startDate, endDate)
        .then((transactionsMap: Map<string, RouteTransactionDTO[]>) => { 
            setMapRouteTransactionByStore(transactionsMap); })
        .catch(error => { console.error("Error retrieving route transactions: ", error)});
    }

    const handleModifyRouteDays = (modifiedRouteDays: Record<string, DraggableRouteDayStore[]>) => {
        setRoutesInModification(modifiedRouteDays);
    }

    const handleSaveRouteModification = (idRouteDayColumn: string, storesInRouteDay: RouteDayStoreDTO[]) => {
        // Update position_in_route based on array index
        const updatedStores = storesInRouteDay.map((store, index) => ({
            ...store,
            position_in_route: index + 1 // Position is 1-indexed
        }));

        // Update routes state with new store order and positions (using callback to get current state)
        // Routes state is the source of truth for route days.
        setRoutes(prevRoutes => 
            prevRoutes.map(route => {
                const { route_day_by_day } = route;
                if (!route_day_by_day) return route;

                const routeDayByDay = new Map<string, RouteDayDTO>();
                
                for (const [idDay, routeDay] of route_day_by_day) {
                    if (routeDay.id_route_day === idRouteDayColumn) {
                        routeDayByDay.set(idDay, { ...routeDay, stores: updatedStores });
                    } else {
                        routeDayByDay.set(idDay, routeDay);
                    }
                }

                return {
                    ...route,
                    route_day_by_day: routeDayByDay
                };
            })
        );

        console.log("Route modification saved");
    }

    const handleCloseRouteDay = (idRouteDay: string) => {
        // Remove route day from routesInModification
        setRoutesInModification(prev => {
            const updated = { ...prev };
            delete updated[idRouteDay];
            return updated;
        });

        // Remove from checkedRouteDays
        setCheckedRouteDays(prev => {
            const newCheckedDays = { ...prev };
            delete newCheckedDays[idRouteDay];
            return newCheckedDays;
        });
        
        // Remove effects
        setEffectSelectedRouteDay(prev => {
            const newMap = new Map(prev);
            newMap.delete(idRouteDay);
            return newMap;
        });
    }

    const handleShowInformation = (idRouteDay: string, state: boolean) => {
        if(effectSelectedRouteDay.has(idRouteDay)) {
            effectSelectedRouteDay.get(idRouteDay)!.showStores = state;
            setEffectSelectedRouteDay(new Map(effectSelectedRouteDay));
        }
    }

    const handleSelectRouteDayColor = (idRouteDay: string, color: string) => {
        if(effectSelectedRouteDay.has(idRouteDay)) {
            effectSelectedRouteDay.get(idRouteDay)!.assignedColor = color;
            setEffectSelectedRouteDay(new Map(effectSelectedRouteDay));
        }
    }

    const handleOverStoreAutoComplete = (store: StoreDTO|null) => { 
        setHoveredStore(store);
    }

    const handleSelectRouteDayStore = (idRouteDayStore: string) => {
        if (selectedRouteDayStore === idRouteDayStore) {
            setSelectedRouteDayStore(null);
        } else {
            setSelectedRouteDayStore(idRouteDayStore);
        }
    }

	// Handlers for store search bar
	const handlerSwitchSearchByCoords = (active: boolean) => {
		setSearchByCoords(active);

		if (!active) {
			setStoresFoundByPosition([]);
			setSelectedCoordinate(null);
			setTotalStoresFoundBySearchRange(null);
			setTotalStoresFoundBySearchRange(0);
		} else {
			setTotalStoresFoundBySearchRange(0);
		}
	}

	const handleSelectStore = (store: StoreDTO | null) => {
		setSearchedStore(store);
	}

	const handleIncludeDeactiveStores = (active: boolean) => {
		setIncludeDeactiveStores(active);
	}

	const handleStartSearchByAutocompletion = () => {
		setSearchedStore(null);
	}

	const handleSelectedRange = (range: number) => {
		if (searchByCoords && selectedCoordinate) {
			const foundStores = findStoresAround(selectedCoordinate, stores, range);
			setTotalStoresFoundBySearchRange(foundStores.length);
			setStoresFoundByPosition(foundStores);
		}
		
		setSelectedRange(range);
	}

	const handleCoordSearchResult = (hide: boolean) => {
		setHideCoordSearchResults(hide);
	}

	// Map handlers
    const handleCoordSelected = (selectedCoords: coordinates | IMapMarker) => {
		if (searchByCoords && "Lat" in selectedCoords && "Lng" in selectedCoords) {
			const foundStores = findStoresAround(selectedCoords, stores, selectedRange);
			setStoresFoundByPosition(foundStores);
			setSelectedCoordinate(selectedCoords);
			setTotalStoresFoundBySearchRange(foundStores.length);
		} else {
			const { id_group } = selectedCoords as IMapMarker;

			if (id_group === "pivot-coord-search") {
				setStoresFoundByPosition([]);
				setSelectedCoordinate(null);
				setTotalStoresFoundBySearchRange(0);
			} else {
				// At the moment, do nothing.
			}
		}

    };

    return (
        <div className="h-full w-full flex flex-row bg-system-primary-background rounded-lg">
            {/* Confirmation dialog for unselecting route day */}
            <Dialog open={pendingUnselectRouteDayId !== null} onClose={handleCancelUnselectRouteDay}>
                <div className="p-5 flex flex-col gap-2 justify-center items-center">
                    <h3 className="text-center font-bold text-lg">¿Estas seguro de deseleccionar este día de ruta?</h3>
                    <span className="text-center text-red-600 font-semibold">
                        Se cerrará la modificación de este día de ruta. Cualquier cambio no guardado se perderá.
                    </span>
                    <div className="flex flex-row gap-5 justify-center mt-5">
                        <Button
                            variant="contained" 
                            color="success"
                            onClick={handleConfirmUnselectRouteDay}>
                                Aceptar
                        </Button>
                        <Button 
                            variant="contained" 
                            color="warning" 
                            onClick={handleCancelUnselectRouteDay}>
                                Cancelar
                        </Button>
                    </div>
                </div>
            </Dialog>
            {/* Route and store section */}
            <div className="relative flex max-w-[400px]">
                <Collapse in={sidebarOpen} orientation="horizontal">
                    {/* Route section */}
                    <div className="flex flex-col h-full">
                        <div className="w-full flex items-center justify-center p-4">
                            <ButtonGroup variant='contained'>
                                <Button onClick={() => handleAdministrationView(1)}>Rutas</Button>
                                <Button onClick={() => handleAdministrationView(2)}>Clientes</Button>
                            </ButtonGroup>                        
                        </div>
                        {/* Search Route */}
                        {/* <div className="w-64 md:w-72 bg-system-third-background overflow-y-auto"> */}
						{administrationView === 1 && (
							<SearchRoute
								routeList={routes}
								vendorList={vendors}
								onRouteSelect={handleRouteSelect}
								selectedRouteId={selectedRoute?.id_route}
							/>
						)}
                        {/* </div> */}
                        {/* Route Form */}
                        {/* <div className="w-64 md:w-72 bg-system-secondary-background overflow-y-auto"> */}
						{administrationView === 1 && (
							<RouteForm
								vendorList={vendors}
								existingRoute={selectedRoute}
								onCancel={handleCancel}
							/>
						)}
                        {/* </div> */}
                        {/* Store section */}
                        {administrationView === 2 && (
                            <div className='flex flex-col items-center overflow-y-auto'>
								<h4 className='text-lg font-bold'>Tiendas sin rutas</h4>	
								<List className="max-h-[40vh] min-h-[30vh] overflow-y-auto">
									{ storeWithinRouteAssigned.size === 0 && (
										<p className="text-sm text-gray-500 italic text-center">Todas las tiendas están asignadas a una ruta.</p>
									)}
									{ storeWithinRouteAssigned.entries().map(([id_store]) => {
										const store = mapStores.get(id_store);
										if (store === undefined) return null;
										const { store_name } = store;
										return <ListItem key={id_store}>
												<SimpleCard 
													cardName={store_name ?? "Nombre no disponible"}
													cardDetails={getAddressOfStore(store)}
												/>
										</ListItem>
									})}
								</List>
								<StoreForm
									existingStore={selectedStore}
									onCancel={handleStoreCancel}
								/>
							</div>
                        )}
                    </div>
                </Collapse>
                {/* Toggle button - stays at right edge of sidebar area */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full">
                    <Tooltip 
                        title={"Administracion tiendas / rutas"}
                        placement="right"
                        enterDelay={300}
                        arrow>
                        <IconButton
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="h-fit my-auto bg-color-info-primary shadow-md"
                            size="small">
                            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            {/* Main content */}
            <div className="flex flex-col flex-1 h-full">
                {/* Search content - collapses to top */}
                <div className="relative w-full flex-shrink-0">
                    <Collapse in={topPanelOpen}>
                        <div className="w-full bg-system-primary-background h-fit">
                            <StoreSearchBar 
								stores={stores}
								onSelectStore={handleSelectStore}
								searchByCoords={searchByCoords}
								rangeOptions={RANGE_OPTIONS}
								totalStoresFoundBySearchRange={totalStoresFoundBySearchRange}
								selectedRange={selectedRange}
								onSwitchSearchByCoords={handlerSwitchSearchByCoords}
								onSelectRange={handleSelectedRange}
								includeDesactiveStores={includeDeactiveStores}
								onHandleIncludeDesactiveStores={handleIncludeDeactiveStores}
								onHoverAutocompleteOption={handleOverStoreAutoComplete}
								onStartSearchByAutocompletion={handleStartSearchByAutocompletion}
								onHideSearchCoordResults={handleCoordSearchResult}
                                /> 
                        </div>
                    </Collapse>
                    {/* Toggle button */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
                        <Tooltip 
                            title={"Buscar clientes"}
                            placement="bottom"
                            enterDelay={300}
                            arrow>
                                <IconButton
                                    onClick={() => setTopPanelOpen(!topPanelOpen)}
                                    size="small"
                                >
                                    {topPanelOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                        </Tooltip>
                    </div>
                </div>

                {/* Map content - takes remaining space */}
                <div className="relative w-full flex-1 bg-blue-900">
                    {/* Button that displays the menu */}
                    <div className="absolute left-48 top-2 z-10">
                        <IconButton
                            onClick={(e) => setRouteMenuAnchor(e.currentTarget)}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                                width: 48,
                                height: 48,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <RouteExpandMenu 
                            routeList={routes} 
                            anchorEl={routeMenuAnchor}
                            open={Boolean(routeMenuAnchor)}
                            mapStores={mapStores}
                            onClose={() => setRouteMenuAnchor(null)}
                            onDaySelect={() => {}}
                            onDaySelectCheckbox={handleRouteDaySelect}
                            showDayCheckbox={true}
                            checkedDays={checkedRouteDays}
                            onCheckedDaysChange={setCheckedRouteDays}
                        />
                    </div>
                    <MarkerMap 
                        markers={mapMarkers}
                        idMarkerSelected={selectedRouteDayStore}
                        setIdMarkerSelected={setSelectedRouteDayStore}
                        onCoordSelected={handleCoordSelected}
                    />
                </div>

                {/* Route organization - collapses to bottom */}
                <div className="relative w-full flex-shrink-0">
                    {/* Toggle button */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
                        <Tooltip 
                            title={"Organizar ruta"}
                            placement="top"
                            enterDelay={300}
                            arrow>
                            <IconButton
                                onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                                size="small"
                            >
                                {bottomPanelOpen ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                            </IconButton>
                        </Tooltip>
                    </div>
                    <Collapse in={bottomPanelOpen}>
                        <div className="w-full h-[50vh]">
                            <RouteDayContainer 
                                storeMap={mapStores}
                                routeDaysInModification={routesInModification}
                                routeDayEffectsMap={effectSelectedRouteDay}
                                routes={routes}
                                routeTransactionsMap={mapRouteTransactionByStore}
                                onRequireRouteTransactions={handleRetrieveRouteTransactions}
                                onSaveRouteModification={handleSaveRouteModification}
                                onCloseRouteDay={handleCloseRouteDay}
                                onShowInformation={handleShowInformation}
                                onSelectRouteDayColor={handleSelectRouteDayColor}
                                onModifyRouteDays={handleModifyRouteDays}
                                onHoverAutocompleteOption={handleOverStoreAutoComplete}
                                onSelectRouteDayStore={handleSelectRouteDayStore}
                            />
                        </div>
                    </Collapse>
                </div>
            </div>
        </div>
    );
}