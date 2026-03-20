"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import {
    Menu,
    MenuItem,
    Paper,
    MenuList,
    Popper,
    Grow,
    ClickAwayListener,
    Tooltip,
    Checkbox,
} from "@mui/material";
import ChevronRight from "@mui/icons-material/ChevronRight";

// DTOs
import RouteDTO from "@/application/dto/RouteDTO";
import StoreDTO from "@/application/dto/StoreDTO";

// Core - Constant
import { DAYS_ARRAY } from "@/core/constants/Days";

// Utils
import { capitalizeFirstLetterOfEachWord } from "@/shared/utils/strings/utils";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";

interface RoutesExpandMenuProps {
    routeList: RouteDTO[];
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    mapStores?: Map<string, StoreDTO>; // Optional map of store ID to StoreDTO for quick access
    onDaySelect?: (routesDaySelected: string) => void;
    onDaySelectCheckbox?: (routesDaySelected: string, selected: boolean) => void;
    showDayCheckbox?: boolean;
}

export default function RouteExpandMenu({ 
    routeList, 
    anchorEl, 
    open, 
    onClose, 
    mapStores,
    onDaySelect,
    onDaySelectCheckbox,
    showDayCheckbox = false,
}: RoutesExpandMenuProps) {
    
    // States
    const [submenuAnchorEl, setSubmenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [activeRoute, setActiveRoute] = React.useState<RouteDTO | null>(null);
    const [checkedDays, setCheckedDays] = React.useState<Record<string, boolean>>({});
    const [hoveredDayTooltip, setHoveredDayTooltip] = React.useState<string | null>(null);
    
    // Refs
    const isOverSubmenu = useRef(false);
    const isOverMenuItem = useRef(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const routeHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dayHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const submenuOpen = Boolean(submenuAnchorEl) && Boolean(activeRoute);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
            if (routeHoverTimeoutRef.current) {
                clearTimeout(routeHoverTimeoutRef.current);
            }
            if (dayHoverTimeoutRef.current) {
                clearTimeout(dayHoverTimeoutRef.current);
            }
        };
    }, []);

    const clearCloseTimeout = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const clearRouteHoverTimeout = () => {
        if (routeHoverTimeoutRef.current) {
            clearTimeout(routeHoverTimeoutRef.current);
            routeHoverTimeoutRef.current = null;
        }
    };

    const clearDayHoverTimeout = () => {
        if (dayHoverTimeoutRef.current) {
            clearTimeout(dayHoverTimeoutRef.current);
            dayHoverTimeoutRef.current = null;
        }
        setHoveredDayTooltip(null);
    };

    const handleClose = () => {
        clearCloseTimeout();
        clearRouteHoverTimeout();
        clearDayHoverTimeout();
        setSubmenuAnchorEl(null);
        setActiveRoute(null);
        isOverSubmenu.current = false;
        isOverMenuItem.current = false;
        onClose();
    };

    const handleRouteHover = (event: React.MouseEvent<HTMLLIElement>, route: RouteDTO) => {
        clearCloseTimeout();
        clearRouteHoverTimeout();
        isOverMenuItem.current = true;
        setSubmenuAnchorEl(event.currentTarget);
        setActiveRoute(route);

        // 3-second hover detection for route
        routeHoverTimeoutRef.current = setTimeout(() => {
            console.log(`Route hovered for 1 second: ${route.route_name}`);
        }, 1000);
    };

    const handleRouteLeave = () => {
        clearRouteHoverTimeout();
        isOverMenuItem.current = false;
        // Delay to check if mouse moved to submenu or another menu item
        closeTimeoutRef.current = setTimeout(() => {
            if (!isOverSubmenu.current && !isOverMenuItem.current) {
                setSubmenuAnchorEl(null);
                setActiveRoute(null);
            }
        }, 150);
    };

    const handleDayHover = (dayId: string, dayName: string) => {
        clearDayHoverTimeout();
        
        // 3-second hover detection for day
        dayHoverTimeoutRef.current = setTimeout(() => {
            console.log(`Day hovered for 3 seconds: ${dayName}`);
            setHoveredDayTooltip(dayId);
        }, 1000);
    };

    const handleDayLeave = () => {
        clearDayHoverTimeout();
    };

    const handleCheckboxChange = (dayId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        
        // Determine selected days.
        setCheckedDays(prev => ({
            ...prev,
            [dayId]: !prev[dayId]
        }));
        console.log("handleCheckboxChange: ", dayId)
        if (onDaySelectCheckbox !== undefined) {
            console.log("lift state")
            if (checkedDays[dayId]) {
                onDaySelectCheckbox(dayId, !checkedDays[dayId]); // If it was previously selected, now, determine the state
            } else {
                console.log("first time selection: ", dayId)
                onDaySelectCheckbox(dayId, true); // First time selection is always true
            }
        }
    };

    const handleSubmenuEnter = () => {
        clearCloseTimeout();
        isOverSubmenu.current = true;
    };

    const handleSubmenuLeave = () => {
        isOverSubmenu.current = false;
        clearDayHoverTimeout();
        // Delay to allow moving back to menu item
        closeTimeoutRef.current = setTimeout(() => {
            if (!isOverMenuItem.current && !isOverSubmenu.current) {
                setSubmenuAnchorEl(null);
                setActiveRoute(null);
            }
        }, 150);
    };

    const handleDayClick = (dayId: string) => {
        if (showDayCheckbox) {
            setCheckedDays(prev => ({
                ...prev,
                [dayId]: !prev[dayId]
            }));
            if (onDaySelectCheckbox !== undefined) {
                if (checkedDays[dayId]) {
                    onDaySelectCheckbox(dayId, !checkedDays[dayId]); // If it was previously selected, now, determine the state
                } else {
                    onDaySelectCheckbox(dayId, true); // First time selection is always true
                }
            }
        } else {
            if (activeRoute && onDaySelect) {
                onDaySelect(dayId);
            } 

            handleClose();
        }
    };

    const getTooltipText = (stores: RouteDayStoreDTO[]) => {
        let zonification:string  = "";
        const identifiedZones: Set<string> = new Set();

        if (mapStores !== undefined) {
            stores.forEach((store:RouteDayStoreDTO) => {
                const storeInfo = mapStores.get(store.id_store);
                if (storeInfo) {
                    const { colony } = storeInfo;
                    identifiedZones.add(colony.trim().toLowerCase());
                }
            })
            
            if (identifiedZones.size > 0) {
                zonification = "Zonas visitadas: ";
                identifiedZones.forEach((zone:string) => { zonification = zonification.concat(capitalizeFirstLetterOfEachWord(zone) + ", ") });    
                zonification = zonification.slice(0, -2); // Remove last comma and space
            } else {
                zonification = "Zonas visitadas: No identificadas";
            }
        }

        return zonification;
    }

    return (
        <>
            {/* Main Menu - Routes */}
            <Menu
                id="routes-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "routes-menu-button",
                }}
            >
                {routeList.length > 0 ? (
                    routeList.map((route) => (
                        <MenuItem
                            key={route.id_route}
                            onMouseEnter={(e) => handleRouteHover(e, route)}
                            onMouseLeave={handleRouteLeave}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                minWidth: 180,
                                backgroundColor:
                                    activeRoute?.id_route === route.id_route
                                        ? "rgba(0, 123, 255, 0.1)"
                                        : "transparent",
                            }}
                        >
                            <span>{capitalizeFirstLetterOfEachWord(route.route_name)}</span>
                            <ChevronRight fontSize="small" />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No hay rutas disponibles</MenuItem>
                )}
            </Menu>

            {/* Submenu - Days of week */}
            <Popper
                open={submenuOpen}
                anchorEl={submenuAnchorEl}
                placement="right-start"
                transition
                disablePortal={false}
                style={{ zIndex: 1301 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps}>
                        <Paper 
                            elevation={8}
                            onMouseEnter={handleSubmenuEnter}
                            onMouseLeave={handleSubmenuLeave}
                        >
                            <ClickAwayListener onClickAway={() => {}}>
                                <MenuList sx={{ padding: 0 }}>
                                    {/* Header row */}
                                    <MenuItem
                                        disabled
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            borderBottom: "1px solid #e0e0e0",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                            fontSize: "0.85rem",
                                            color: "#333 !important",
                                            opacity: "1 !important",
                                            minHeight: 36,
                                        }}
                                    >
                                        <span style={{ width: 90 }}>{capitalizeFirstLetterOfEachWord("Dia")}</span>
                                        <span style={{ width: 70, textAlign: "center" }}>{capitalizeFirstLetterOfEachWord("Clientes")}</span>
                                        {showDayCheckbox && (
                                            <span style={{ width: 70, textAlign: "center" }}>{capitalizeFirstLetterOfEachWord("Selected")}</span>
                                        )}
                                    </MenuItem>
                                    {/* Day rows */}
                                    {DAYS_ARRAY.map((day) => {


                                        if (!activeRoute) return null;
                                        
                                        const {  route_day_by_day } = activeRoute;

                                        if (route_day_by_day === undefined || route_day_by_day === null) return null;

                                        const { id_day, day_name } = day;

                                        if (route_day_by_day.has(id_day) === false) return null;
                                        
                                        const routeDay = route_day_by_day.get(id_day)!;
                                        const { id_route_day, stores } = routeDay;
                                    

                                        return (                                                
                                                <Tooltip
                                                    key={id_route_day}
                                                    title={getTooltipText(stores)}
                                                    open={hoveredDayTooltip === id_route_day && mapStores !== undefined}
                                                    placement="right"
                                                    arrow
                                                >
                                                <MenuItem
                                                    onClick={() => handleDayClick(id_route_day)}
                                                    onMouseEnter={() => handleDayHover(id_route_day, day_name)}
                                                    onMouseLeave={handleDayLeave}
                                                    sx={{ 
                                                        display: "flex",
                                                        alignItems: "center",
                                                        minHeight: 40,
                                                    }}
                                                >
                                                    <span style={{ width: 90 }}>{capitalizeFirstLetterOfEachWord(day_name)}</span>
                                                    <span style={{ 
                                                        width: 70, 
                                                        textAlign: "center",
                                                        color: '#666'
                                                    }}>
                                                        {stores.length}
                                                    </span>
                                                    {showDayCheckbox && (
                                                        <span style={{ width: 70, textAlign: "center" }}>
                                                            <Checkbox
                                                                checked={checkedDays[id_route_day] || false}
                                                                onClick={(e) => handleCheckboxChange(id_route_day, e)}
                                                                size="small"
                                                                sx={{ padding: 0 }}
                                                            />
                                                        </span>
                                                    )}
                                                </MenuItem>
                                            </Tooltip>
                                        )
                                    }
                                    
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}