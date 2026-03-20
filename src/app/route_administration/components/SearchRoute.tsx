"use client";

import { useState, useMemo } from "react";
import {
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    Switch,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import RouteDTO from "@/application/dto/RouteDTO";
import UserDTO from "@/application/dto/UserDTO";

interface SearchRouteProps {
    routeList: RouteDTO[];
    vendorList: UserDTO[];
    onRouteSelect?: (route: RouteDTO) => void;
    selectedRouteId?: string | null;
}

export default function SearchRoute({
    routeList,
    vendorList,
    onRouteSelect,
    selectedRouteId,
}: SearchRouteProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState<string>("");
    const [includeInactiveRoutes, setIncludeInactiveRoutes] = useState(false);
    const [showUnassignedRoutes, setShowUnassignedRoutes] = useState(false);

    // Filter routes based on search criteria
    const filteredRoutes = useMemo(() => {
        return routeList.filter((route) => {
            // Filter by search query
            const matchesSearch = route.route_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Filter by vendor
            const matchesVendor =
                selectedVendorId === "" || route.id_vendor === selectedVendorId;

            // Filter by active status
            const matchesStatus = includeInactiveRoutes || route.route_status;

            // Filter by unassigned vendor
            const matchesUnassigned =
                !showUnassignedRoutes ||
                !route.id_vendor ||
                route.id_vendor === "";

            return matchesSearch && matchesVendor && matchesStatus && matchesUnassigned;
        });
    }, [routeList, searchQuery, selectedVendorId, includeInactiveRoutes, showUnassignedRoutes]);

    return (
        <div className="bg-system-primary-background p-4 rounded-lg w-full h-full flex flex-col">
            {/* Title */}
            <h2 className="text-lg md:text-xl font-bold mb-4">Rutas disponibles</h2>

            {/* Search input */}
            <TextField
                fullWidth
                size="small"
                placeholder="Buscar ruta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search className="text-gray-500" />
                        </InputAdornment>
                    ),
                }}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Vendor filter */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm whitespace-nowrap">Asignado a:</span>
                <FormControl size="small" className="flex-1">
                    <Select
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        displayEmpty
                        sx={{ backgroundColor: "white" }}
                    >
                        <MenuItem value="">
                            <em>Todos</em>
                        </MenuItem>
                        {vendorList.map((vendor) => (
                            <MenuItem key={vendor.id_vendor} value={vendor.id_vendor}>
                                {vendor.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Toggle: Include inactive routes */}
            <div className="flex items-center justify-between mb-1 border-b border-gray-300 pb-2">
                <span className="text-sm">Incluir rutas inactivas</span>
                <Switch
                    checked={includeInactiveRoutes}
                    onChange={(e) => setIncludeInactiveRoutes(e.target.checked)}
                    size="small"
                />
            </div>

            {/* Toggle: Show unassigned routes */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-300 pb-2">
                <span className="text-sm">Mostrar rutas sin vendedor asignado</span>
                <Switch
                    checked={showUnassignedRoutes}
                    onChange={(e) => setShowUnassignedRoutes(e.target.checked)}
                    size="small"
                />
            </div>

            {/* Routes list */}
            <div className="flex-1 overflow-y-auto bg-white rounded-md">
                <List dense disablePadding>
                    {filteredRoutes.length > 0 ? (
                        filteredRoutes.map((route) => (
                            <ListItemButton
                                key={route.id_route}
                                selected={selectedRouteId === route.id_route}
                                onClick={() => onRouteSelect?.(route)}
                                divider
                                sx={{
                                    "&.Mui-selected": {
                                        backgroundColor: "#e3f2fd",
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={route.route_name}
                                    secondary={!route.route_status ? "Inactiva" : undefined}
                                    primaryTypographyProps={{
                                        className: "text-center",
                                    }}
                                    secondaryTypographyProps={{
                                        className: "text-center text-red-500",
                                    }}
                                />
                            </ListItemButton>
                        ))
                    ) : (
                        <ListItemButton disabled>
                            <ListItemText
                                primary="No se encontraron rutas"
                                primaryTypographyProps={{
                                    className: "text-center text-gray-500",
                                }}
                            />
                        </ListItemButton>
                    )}
                </List>
            </div>
        </div>
    );
}
