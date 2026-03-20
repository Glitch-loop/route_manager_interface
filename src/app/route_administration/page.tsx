// Critial imports
"use client";
import 'reflect-metadata';

// Libraries
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Collapse, IconButton } from "@mui/material";

// DTOs
import UserDTO from "@/application/dto/UserDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import RouteDayDTO from "@/application/dto/RouteDayDTO";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";

// Queries
import ListRoutesQuery from "@/application/queries/ListRoutesQuery";
import RetrieveRouteInformationQuery  from "@/application/queries/RetrieveRouteInformationQuery";
import ListAllRegisterdStoresQuery from "@/application/queries/ListAllRegisterdStoresQuery";
import OrganizeRouteDayCommand from "@/application/commands/OrganizeRouteDayCommand";

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

export default function Page() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<RouteDTO | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreDTO | null>(null);
    const [routeMenuAnchor, setRouteMenuAnchor] = useState<HTMLElement | null>(null);

    const [routes, setRoutes] = useState<RouteDTO[]>([]);
    const [stores, setStores] = useState<StoreDTO[]>([]);
    const [mapStores, setMapStores] = useState<Map<string, StoreDTO>>(new Map()); // Map of store ID to StoreDTO for quick access
    

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


    useEffect(() => {
        fetchScreenInformation();
    }, [])

    // Auxiliar functions
    const fetchScreenInformation = async () => {
        // Injecting dependencies
        const listRouteQuery = di_container.resolve<ListRoutesQuery>(ListRoutesQuery);
        const retrieveRouteInformationQuery = di_container.resolve<RetrieveRouteInformationQuery>(RetrieveRouteInformationQuery);


        // Retrieve routes.
        const routes:RouteDTO[] =  await listRouteQuery.execute();
        const routeIds:string[] = routes.map(route => route.id_route);
        const routesWithInformation:RouteDTO[] = await retrieveRouteInformationQuery.execute(routeIds);
        setRoutes(routesWithInformation);


        // Retrieve stores.
        await fetchStores();
    }


    const fetchStores = async () => {
        const listStoresQuery = di_container.resolve<ListAllRegisterdStoresQuery>(ListAllRegisterdStoresQuery);
        const stores:StoreDTO[] = await listStoresQuery.execute();
        setStores(stores);
        const storeMap = new Map<string, StoreDTO>();
        stores.forEach(store => {
            storeMap.set(store.id_store, store);
        });
        setMapStores(storeMap);
    }

    // Handlers
    const handleRouteSelect = (route: RouteDTO) => {
        setSelectedRoute(route);
    };

    const handleCancel = () => {
        setSelectedRoute(null);
    };

    const handleStoreCancel = () => {
        setSelectedStore(null);
    };

    const handleAdministrationView = (option: number) => {
        setAdministrationView(option);
    }

    const handleRouteDaySelect = (dayId: string, state: boolean) => {
        console.log(`Day ${dayId} selected with state: ${state}`);
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
                    <IconButton
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="h-fit my-auto bg-color-info-primary shadow-md"
                        size="small">
                        {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1">
                {/* Search content */}
                <div className="w-full h-1/6 bg-green-900">
                    <h1 className="text-white text-2xl font-bold p-4">Search content</h1>
                    {/* <RangeDateSelection /> */}
                </div>

                {/* Map content */}
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
                        />
                    </div>
                    <RouteMap 
                        markers={[]}
                        temporalMarkers={[]}
                        onSelectStore={() => {}}
                    />
                </div>
                
                {/* Route organization */}
                <div className="relative w-full">
                    {/* Toggle button */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
                        <IconButton
                            onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                            size="small"
                        >
                            {bottomPanelOpen ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                        </IconButton>
                    </div>
                    
                    <Collapse in={bottomPanelOpen}>
                        <div className="w-full h-96">
                            <RouteDayContainer />
                        </div>
                    </Collapse>
                </div>
            </div>
        </div>
    );
}