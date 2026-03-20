"use client";

import { useState, useEffect } from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import RouteDTO from "@/application/dto/RouteDTO";
import UserDTO from "@/application/dto/UserDTO";

interface RoutesFormProps {
    existingRoute?: RouteDTO | null;
    vendorList: UserDTO[];
    onCreate?: (routeData: Omit<RouteDTO, "id_route" | "route_day_by_day">) => void;
    onUpdate?: (routeData: RouteDTO) => void;
    onCancel?: () => void;
    onStatusChange?: (routeId: string, newStatus: boolean) => void;
}

export default function RouteForm({
    existingRoute,
    vendorList,
    onCreate,
    onUpdate,
    onCancel,
    onStatusChange,
}: RoutesFormProps) {
    const isEditMode = existingRoute !== undefined && existingRoute !== null;

    const [routeName, setRouteName] = useState("");
    const [vendorId, setVendorId] = useState("");
    const [routeDescription, setRouteDescription] = useState("");

    useEffect(() => {
        if (existingRoute) {
            setRouteName(existingRoute.route_name);
            setVendorId(existingRoute.id_vendor);
            setRouteDescription(existingRoute.description);
        }
    }, [existingRoute]);

    const handleCreate = () => {
        if (!onCreate) return;
        onCreate({
            route_name: routeName,
            description: routeDescription,
            route_status: true,
            id_vendor: vendorId,
        });
    };

    const handleUpdate = () => {
        if (!onUpdate || !existingRoute) return;
        onUpdate({
            ...existingRoute,
            route_name: routeName,
            description: routeDescription,
            id_vendor: vendorId,
        });
    };

    const handleStatusChange = () => {
        if (!onStatusChange || !existingRoute) return;
        onStatusChange(existingRoute.id_route, !existingRoute.route_status);
    };

    const clearForm = () => {
        setRouteName("");
        setVendorId("");
        setRouteDescription("");
    };

    return (
        <div className="p-4 md:p-6 rounded-lg w-full max-w-xs md:max-w-sm">
            {/* Título */}
            <h2 className="text-sm md:text-style-h4 font-bold mb-3 md:mb-4 text-center">
                {isEditMode ? "Ruta consultada" : "Crear nueva ruta"}
            </h2>

            {/* Campo: Nombre de ruta */}
            <TextField
                fullWidth
                size="small"
                placeholder="Nombre de ruta..."
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="mb-3 md:mb-4"
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Campo: Selector de vendedor */}
            <div className="my-3">
                <FormControl fullWidth size="small" className="mb-3 md:mb-4">
                    <InputLabel id="vendor-selector-label">Vendedor</InputLabel>
                    <Select
                        labelId="vendor-selector-label"
                        value={vendorId}
                        label="Vendedor"
                        onChange={(e) => setVendorId(e.target.value)}
                        sx={{ backgroundColor: "white" }}
                    >
                        {vendorList.map((vendor) => (
                            <MenuItem key={vendor.id_vendor} value={vendor.id_vendor}>
                                {vendor.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Campo: Descripción de ruta */}
            <div className="my-3">
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Descripción de ruta..."
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    className="mb-3 md:mb-4"
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2">
                {!isEditMode ? (
                    /* Modo creación */
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCreate}
                        sx={{
                            backgroundColor: "#2ECC71",
                            "&:hover": { backgroundColor: "#27ae60" },
                            textTransform: "none",
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                        }}
                    >
                        Crear
                    </Button>
                ) : (
                    /* Modo edición */
                    <>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleUpdate}
                                sx={{
                                    backgroundColor: "#007BFF",
                                    "&:hover": { backgroundColor: "#0056b3" },
                                    textTransform: "none",
                                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                                }}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={onCancel}
                                sx={{
                                    backgroundColor: "#FF851B",
                                    "&:hover": { backgroundColor: "#e67600" },
                                    textTransform: "none",
                                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleStatusChange}
                            sx={{
                                backgroundColor: existingRoute.route_status ? "#E74C3C" : "#2ECC71",
                                "&:hover": {
                                    backgroundColor: existingRoute.route_status ? "#c0392b" : "#27ae60",
                                },
                                textTransform: "none",
                                fontSize: { xs: "0.75rem", md: "0.875rem" },
                            }}
                        >
                            {existingRoute.route_status ? "Desactivar" : "Activar"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
