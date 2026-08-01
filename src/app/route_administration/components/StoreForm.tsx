"use client";

// Libraries
import { useState, useEffect } from "react";
import { TextField, Button, Divider } from "@mui/material";

// Types
import { coordinates } from "@/shared/components/MarkerMap/types/types";

// Dtos
import { LocationDTO } from "@/shared/dtos/LocationDTO";

interface StoreFormProps {
  existingStore?: LocationDTO | null;
  selectedCoordinates?: coordinates | null;
  onCreate?: (storeData: LocationDTO) => void;
  onUpdate?: (storeData: LocationDTO) => void;
  onCancel?: () => void;
  onActivate?: (idStore: string) => void;
  onDesactivate?: (idStore: string) => void;
}

export default function StoreForm({
  existingStore,
  selectedCoordinates,
  onCreate,
  onUpdate,
  onCancel,
  onActivate,
  onDesactivate,
}: StoreFormProps) {
  const isEditMode = existingStore !== undefined && existingStore !== null;

  const [selectCoordinates, setSelectCoordinates] = useState<boolean>(false);

  const [store, setStore] = useState<LocationDTO>(
    existingStore ?? {
      id_location: "",
      street: "",
      ext_number: "",
      colony: "",
      postal_code: "",
      location_name: "",
      latitude: "",
      longitude: "",
      status_location: -1,
      id_creator: "",
      id_client: "",
      id_location_type: "",
      created_at: new Date(),
      updated_at: new Date(),
      notes: [],
      address_reference: null,
    },
  );

  const [originalCoordinates, setOriginalCoordinates] = useState<{
    latitude: string;
    longitude: string;
  }>({
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (existingStore) {
      setStore(existingStore);
      setOriginalCoordinates({
        latitude: existingStore.latitude,
        longitude: existingStore.longitude,
      });
    }
  }, [existingStore]);

  useEffect(() => {
    if (
      selectCoordinates &&
      selectedCoordinates != null &&
      selectedCoordinates != undefined
    ) {
      setStore({
        ...store,
        latitude: selectedCoordinates.Lat.toString(),
        longitude: selectedCoordinates.Lng.toString(),
      });
    }
  }, [selectCoordinates, selectedCoordinates]);

  const handleCreate = async () => {
    if (!onCreate) return;
    await onCreate(store);
    setSelectCoordinates(false);
    clearForm();
  };

  const handleUpdate = async () => {
    if (onUpdate === undefined || existingStore === null) return;
    await onUpdate(store);
    setSelectCoordinates(false);
    clearForm();
  };

  const handleActivate = async () => {
    if (onActivate === undefined || existingStore === null) return;
    await onActivate(store.id_location);
    setSelectCoordinates(false);
    clearForm();
  };

  const handleDesactivate = async () => {
    if (onDesactivate === undefined || existingStore === null) return;
    await onDesactivate(store.id_location);
    setSelectCoordinates(false);
    clearForm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setSelectCoordinates(false);
    clearForm();
  };

  const clearForm = () => {
    setStore({
      id_location: "",
      street: "",
      ext_number: "",
      colony: "",
      postal_code: "",
      location_name: "",
      latitude: "",
      longitude: "",
      status_location: -1,
      id_creator: "",
      id_client: "",
      id_location_type: "",
      created_at: new Date(),
      updated_at: new Date(),
      notes: [],
      address_reference: null,
    });
  };

  const handleClickSelectCoordinates = (selectCoordinates: boolean) => {
    const newState = !selectCoordinates;

    if (newState) {
      setOriginalCoordinates({
        latitude: store.latitude,
        longitude: store.longitude,
      });
    }
    setSelectCoordinates(newState);
  };

  return (
    <div className="bg-system-primary-background p-4 rounded-lg w-full max-w-xs flex flex-col gap-2">
      {/* Necessary fields section */}
      <h3 className="text-sm font-bold text-center">Campos necesarios</h3>

      <TextField
        fullWidth
        size="small"
        placeholder="Nombre de la tienda..."
        value={store.location_name || ""}
        onChange={(e) =>
          setStore({ ...store, location_name: e.target.value || "" })
        }
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
        onChange={(e) =>
          setStore({ ...store, ext_number: e.target.value || "" })
        }
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
        onChange={(e) =>
          setStore({ ...store, address_reference: e.target.value || null })
        }
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
      <Button
        variant="contained"
        onClick={() => handleClickSelectCoordinates(selectCoordinates)}
      >
        {selectCoordinates ? "Cancelar selección" : "Seleccionar coordenadas"}
      </Button>
      {selectCoordinates && (
        <span className="text-sm italic text-center">
          Haz click en el mapa para seleccionar las coordenadas de la tienda.
        </span>
      )}

      {/* Divider */}
      <Divider className="my-2" />

      {/* Optional fields section */}
      <h3 className="text-sm font-bold text-center">Campos opcionales</h3>

      {/* <TextField
        fullWidth
        size="small"
        placeholder="Nombre del dueño"
        value={store.owner_name || ""}
        onChange={(e) =>
          setStore({ ...store, owner_name: e.target.value || null })
        }
        sx={{ backgroundColor: "white", borderRadius: 1 }}
      /> */}

      {/* <TextField
        fullWidth
        size="small"
        placeholder="Teléfono"
        value={store.cellphone || ""}
        onChange={(e) =>
          setStore({ ...store, cellphone: e.target.value || null })
        }
        sx={{ backgroundColor: "white", borderRadius: 1 }}
      /> */}

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
                onClick={handleCancel}
                sx={{
                  backgroundColor: "#FF851B",
                  "&:hover": { backgroundColor: "#e67600" },
                  textTransform: "none",
                }}
              >
                Cancelar
              </Button>
            </div>
            {store.status_location === 1 ? (
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
