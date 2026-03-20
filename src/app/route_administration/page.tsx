


"use client";

import { useState } from "react";
import { Button, ButtonGroup, Collapse, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import RouteForm from "./components/RouteForm";
import SearchRoute from "./components/SearchRoute";
import StoreForm from "./components/StoreForm";
import UserDTO from "@/application/dto/UserDTO";
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import RouteExpandMenu from "@/shared/components/RoutesExpandMenu/RoutesExpandMenu";

export default function Page() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<RouteDTO | null>(null);
    const [selectedStore, setSelectedStore] = useState<StoreDTO | null>(null);

    const [vendors, setVendors] = useState<UserDTO[]>([
        {
            id_vendor: "1",
            cellphone: "1234567890",
            name: "Jhon Doe",
            password: null,
            status: null,
        }
    ]);

    const [routes, setRoutes] = useState<RouteDTO[]>([
        {
            id_route: "1",
            route_name: "Ruta Norte",
            description: "Ruta del sector norte",
            route_status: true,
            id_vendor: "1",
            route_day_by_day: null,
        },
        {
            id_route: "2",
            route_name: "Ruta Sur",
            description: "Ruta del sector sur",
            route_status: true,
            id_vendor: "",
            route_day_by_day: null,
        },
        {
            id_route: "3",
            route_name: "Ruta Este",
            description: "Ruta del sector este",
            route_status: false,
            id_vendor: "1",
            route_day_by_day: null,
        },
    ]);

    const [administrationView, setAdministrationView] = useState(1); // 1 for Routes, 2 for Stores

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
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white rounded-full">
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
                <div className="w-full h-1/6 bg-green-900">
                    <h1 className="text-white text-2xl font-bold p-4">Search content</h1>
                    <RangeDateSelection />
                </div>
                <div className="w-full flex-1 bg-blue-900">
                    <RouteExpandMenu />
                </div>
                
                {/* Collapsible bottom panel */}
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
                        <div className="w-full h-32 bg-teal-400"></div>
                    </Collapse>
                </div>
            </div>
        </div>
    );
}