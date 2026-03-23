// Critial imports
"use client";
import 'reflect-metadata';

// Libraries
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Collapse, IconButton, Tooltip } from "@mui/material";

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

// Core - Constant


// DI container
import { di_container } from "@/infrastructure/di/container";

// UI components
import { ChevronLeft, ChevronRight, KeyboardArrowUp, KeyboardArrowDown, Menu as MenuIcon } from "@mui/icons-material";
import RouteForm from "./components/RouteForm";
import SearchRoute from "./components/SearchRoute";
import StoreForm from "./components/StoreForm";
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import RouteExpandMenu from "@/shared/components/RoutesExpandMenu/RoutesExpandMenu";
import RouteMap from "@/components/general/mapComponent/RouteMap";
import RouteDayContainer from "./components/RouteDayContainer/RouteDayContainer";

// Utils
import { getRouteDayFromRoutesList } from '@/shared/utils/routes/utils';

export default function Page() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
    const [topPanelOpen, setTopPanelOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDTO | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreDTO | null>(null);
    const [routeMenuAnchor, setRouteMenuAnchor] = useState<HTMLElement | null>(null);

    const [routes, setRoutes] = useState<RouteDTO[]>([]);
    const [stores, setStores] = useState<StoreDTO[]>([]);
    const [mapStores, setMapStores] = useState<Map<string, StoreDTO>>(new Map()); // Map of store ID to StoreDTO for quick access
    const [mapRouteTransactionByStore, setMapRouteTransactionByStore] = useState<Map<string, RouteTransactionDTO[]>>(new Map()); // Map of store ID to list of route transactions
    
    const [selectedRouteDay, setSelectedRouteDay] = useState<RouteDayDTO[]>([]);
    const [checkedRouteDays, setCheckedRouteDays] = useState<Record<string, boolean>>({});

    const [vendors, setVendors] = useState<UserDTO[]>([
        {
            id_vendor: "1",
            cellphone: "1234567890",
            name: "Jhon Doe",
            password: null,
            status: null,
        }
    ]);

    const [administrationView, setAdministrationView] = useState(1); // 1 for Routes, 2 for Stores


    useEffect(() => { fetchScreenInformation(); }, [])

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

    // Handlers
    const handleRouteSelect = (route: RouteDTO) => { setSelectedRoute(route); };

    const handleCancel = () => { setSelectedRoute(null); };

    const handleStoreCancel = () => { setSelectedStore(null); };

    const handleAdministrationView = (option: number) => { setAdministrationView(option); }

    const handleRouteDaySelect = (routeDayId: string, state: boolean) => {
        if(state) { // Add route day because it was selected
            const routeDayFound:RouteDayDTO|null = getRouteDayFromRoutesList(routes, routeDayId);
            
            if (routeDayFound !== null) {
                const routeDayToAdd = {...routeDayFound, stores: routeDayFound.stores.map(store => ({...store, selected: state}))};
                setSelectedRouteDay([...selectedRouteDay, routeDayToAdd]);
            }
        } else { // Remove route day because it was unselected
            setSelectedRouteDay(selectedRouteDay.filter(routeDay => routeDay.id_route_day !== routeDayId));
        }
    }

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

    const handleSaveRouteModification = (idRouteDayColumn: string, storesInRouteDay: RouteDayStoreDTO[]) => {
        console.log("Save route modification")
        storesInRouteDay.forEach(store => {
            let name = "Unknown store";
            const storeData = mapStores.get(store.id_store);
            if (storeData) {
                const { store_name } = storeData;
                name = store_name === null ? "Store without name" : store_name;
            }

            console.log(`Store in route day: ${name}, position: ${store.position_in_route}`);
        });
    }

    const handleCloseRouteDay = (idRouteDay: string) => {
        // Remove route day from selectedRouteDay
        setSelectedRouteDay(selectedRouteDay.filter(routeDay => routeDay.id_route_day !== idRouteDay));

        // Remove from checkedRouteDays
        setCheckedRouteDays(prev => {
            const newCheckedDays = { ...prev };
            delete newCheckedDays[idRouteDay];
            return newCheckedDays;
        });
    }

    return (
        <div className="h-full w-full flex flex-row bg-system-primary-background rounded-lg">
            {/* Route and store section */}
            <div className="relative flex">
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
                            <StoreForm
                                existingStore={selectedStore}
                                onCancel={handleStoreCancel}
                            />
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
                        <div className="w-full bg-green-900">
                            <h1 className="text-white text-2xl font-bold p-4">Search content</h1>
                        </div>
                    </Collapse>
                    {/* Toggle button */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
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
                    <RouteMap 
                        markers={[]}
                        temporalMarkers={[]}
                        onSelectStore={() => {}}
                    />
                </div>

                {/* Route organization - collapses to bottom */}
                <div className="relative w-full flex-shrink-0">
                    {/* Toggle button */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
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
                                routesDay={selectedRouteDay} 
                                storeMap={mapStores}
                                routes={routes}
                                routeTransactionsMap={mapRouteTransactionByStore}
                                onRequireRouteTransactions={handleRetrieveRouteTransactions}
                                onSaveRouteModification={handleSaveRouteModification}
                                oncloseRouteDay={handleCloseRouteDay}
                            />
                        </div>
                    </Collapse>
                </div>
            </div>
        </div>
    );
}