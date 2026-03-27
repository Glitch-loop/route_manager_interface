"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Divider } from "@mui/material";
import StoreDTO from "@/application/dto/StoreDTO";

interface StoreFormProps {
    existingStore?: StoreDTO | null;
    onCreate?: (storeData: Omit<StoreDTO, "id_store" | "creation_date" | "is_new">) => void;
    onUpdate?: (storeData: StoreDTO) => void;
    onCancel?: () => void;
    onActivate?: (idStore: string) => void;
    onDesactivate?: (idStore: string) => void;
}

export default function StoreForm({
    existingStore,
    onCreate,
    onUpdate,
    onCancel,
    onActivate,
    onDesactivate,
}: StoreFormProps) {
    const isEditMode = existingStore !== undefined && existingStore !== null;

    // Necessary fields
    const [storeName, setStoreName] = useState("");
    const [street, setStreet] = useState("");
    const [extNumber, setExtNumber] = useState("");
    const [colony, setColony] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [addressReference, setAddressReference] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Optional fields
    const [ownerName, setOwnerName] = useState("");
    const [cellphone, setCellphone] = useState("");

    useEffect(() => {
        if (existingStore) {
            setStoreName(existingStore.store_name || "");
            setStreet(existingStore.street);
            setExtNumber(existingStore.ext_number || "");
            setColony(existingStore.colony);
            setPostalCode(existingStore.postal_code);
            setAddressReference(existingStore.address_reference || "");
            setLatitude(existingStore.latitude);
            setLongitude(existingStore.longitude);
        }
    }, [existingStore]);

    const handleCreate = () => {
        if (!onCreate) return;
        onCreate({
            store_name: storeName || null,
            street,
            ext_number: extNumber || null,
            colony,
            postal_code: postalCode,
            address_reference: addressReference || null,
            latitude,
            longitude,
            status_store: 1,
        });
    };

    const handleUpdate = () => {
        if (!onUpdate || !existingStore) return;
        onUpdate({
            ...existingStore,
            store_name: storeName || null,
            street,
            ext_number: extNumber || null,
            colony,
            postal_code: postalCode,
            address_reference: addressReference || null,
            latitude,
            longitude,
        });
    };

    const handleStatusChange = () => {
        if (!onStatusChange || !existingStore) return;
        const newStatus = existingStore.status_store === 1 ? 0 : 1;
        onStatusChange(existingStore.id_store, newStatus);
    };

    const clearForm = () => {
        setStoreName("");
        setStreet("");
        setExtNumber("");
        setColony("");
        setPostalCode("");
        setAddressReference("");
        setLatitude("");
        setLongitude("");
        setOwnerName("");
        setCellphone("");
    };

    return (
        <div className="bg-system-primary-background p-4 rounded-lg w-full max-w-xs flex flex-col gap-2">
            {/* Necessary fields section */}
            <h3 className="text-sm font-bold text-center">Campos necesarios</h3>

            <TextField
                fullWidth
                size="small"
                placeholder="Nombre de la tienda..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Calle..."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Número..."
                value={extNumber}
                onChange={(e) => setExtNumber(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Colonia..."
                value={colony}
                onChange={(e) => setColony(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Código postal..."
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Referencia de dirección..."
                value={addressReference}
                onChange={(e) => setAddressReference(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Latitude and Longitude side by side */}
            <div className="flex gap-2">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Latitud..."
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Longitud..."
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
            </div>

            {/* Divider */}
            <Divider className="my-2" />

            {/* Optional fields section */}
            <h3 className="text-sm font-bold text-center">Campos opcionales</h3>

            <TextField
                fullWidth
                size="small"
                placeholder="Nombre del dueño"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Teléfono"
                value={cellphone}
                onChange={(e) => setCellphone(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-2">
                {!isEditMode ? (
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCreate}
                        sx={{
                            backgroundColor: "#2ECC71",
                            "&:hover": { backgroundColor: "#27ae60" },
                            textTransform: "none",
                        }}
                    >
                        Crear
                    </Button>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleUpdate}
                                sx={{
                                    backgroundColor: "#007BFF",
                                    "&:hover": { backgroundColor: "#0056b3" },
                                    textTransform: "none",
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
                                backgroundColor: existingStore.status_store === 1 ? "#E74C3C" : "#2ECC71",
                                "&:hover": {
                                    backgroundColor: existingStore.status_store === 1 ? "#c0392b" : "#27ae60",
                                },
                                textTransform: "none",
                            }}
                        >
                            {existingStore.status_store === 1 ? "Desactivar" : "Activar"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
