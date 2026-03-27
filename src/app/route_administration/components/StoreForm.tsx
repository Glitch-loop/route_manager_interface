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


    const [store, setStore] = useState<StoreDTO>(
        existingStore ?? {
            id_store: "",
            store_name: null,
            street: "",
            ext_number: null,
            colony: "",
            postal_code: "",
            address_reference: null,
            latitude: "",
            longitude: "",
            status_store: 1,
            creation_date: new Date().toISOString(),
            is_new: 1,
        }
    );

    useEffect(() => {
        if (existingStore) {
            setStore(existingStore);
        }
    }, [existingStore]);


    const handleCreate = () => {
        if (!onCreate) return;
        const { id_store, creation_date, is_new, ...rest } = store;
        onCreate(rest as Omit<StoreDTO, "id_store" | "creation_date" | "is_new">);
    };

    const handleUpdate = () => {
        if (!onUpdate) return;
        onUpdate(store);
    };

    const handleActivate = () => {
        if (!onActivate || !store.id_store) return;
        onActivate(store.id_store);
    };

    const handleDesactivate = () => {
        if (!onDesactivate || !store.id_store) return;
        onDesactivate(store.id_store);
    };

    const clearForm = () => {
        setStore({
            id_store: "",
            store_name: null,
            street: "",
            ext_number: null,
            colony: "",
            postal_code: "",
            address_reference: null,
            latitude: "",
            longitude: "",
            status_store: 1,
            creation_date: new Date().toISOString(),
            is_new: 1,
        });
    };

    return (
        <div className="bg-system-primary-background p-4 rounded-lg w-full max-w-xs flex flex-col gap-2">
            {/* Necessary fields section */}
            <h3 className="text-sm font-bold text-center">Campos necesarios</h3>

            <TextField
                fullWidth
                size="small"
                placeholder="Nombre de la tienda..."
                value={store.store_name || ""}
                onChange={(e) => setStore({ ...store, store_name: e.target.value || null })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Calle..."
                value={store.street}
                onChange={(e) => setStore({ ...store, street: e.target.value })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Número..."
                value={store.ext_number || ""}
                onChange={(e) => setStore({ ...store, ext_number: e.target.value || null })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Colonia..."
                value={store.colony}
                onChange={(e) => setStore({ ...store, colony: e.target.value })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Código postal..."
                value={store.postal_code}
                onChange={(e) => setStore({ ...store, postal_code: e.target.value })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Referencia de dirección..."
                value={store.address_reference || ""}
                onChange={(e) => setStore({ ...store, address_reference: e.target.value || null })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Latitude and Longitude side by side */}
            <div className="flex gap-2">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Latitud..."
                    value={store.latitude}
                    onChange={(e) => setStore({ ...store, latitude: e.target.value })}
                    sx={{ backgroundColor: "white", borderRadius: 1 }}
                />
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Longitud..."
                    value={store.longitude}
                    onChange={(e) => setStore({ ...store, longitude: e.target.value })}
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
                value={store.owner_name || ""}
                onChange={(e) => setStore({ ...store, owner_name: e.target.value || null })}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            <TextField
                fullWidth
                size="small"
                placeholder="Teléfono"
                value={store.cellphone || ""}
                onChange={(e) => setStore({ ...store, cellphone: e.target.value || null })}
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
                        {store.status_store === 1 ? (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleDesactivate}
                                sx={{
                                    backgroundColor: "#E74C3C",
                                    "&:hover": { backgroundColor: "#c0392b" },
                                    textTransform: "none",
                                }}
                            >
                                Desactivar
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleActivate}
                                sx={{
                                    backgroundColor: "#2ECC71",
                                    "&:hover": { backgroundColor: "#27ae60" },
                                    textTransform: "none",
                                }}
                            >
                                Activar
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
