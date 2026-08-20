"use client";

// Libraries
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

// Types
import { coordinates } from "@/shared/components/MarkerMap/types/types";

// Dtos
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { LocationTypeDTO } from "@/shared/dtos/LocationTypeDTO";

// Actions
import { LocationStatusEnum } from "@/shared/enums/locationStatusEnum";
import { LocationDeactivationType } from "@/shared/enums/locationDeactivationTypeEnum";

const DEACTIVATION_TYPE_LABELS: Record<LocationDeactivationType, string> = {
  [LocationDeactivationType.CLOSED]: "Cierre de actividad económica",
  [LocationDeactivationType.SHUTDOWN]: "Cierre temporal del negocio",
  [LocationDeactivationType.CHURNED]: "Cambio a otro proveedor",
};


const LOCATION_STATUS_LABELS: Record<LocationStatusEnum, string> = {
  [LocationStatusEnum.PROSPECT_OF_CLIENT]: "Cliente por confirmar",
  [LocationStatusEnum.CLIENT]: "Cliente confirmado",
  [LocationStatusEnum.CLOSED]: "Cierre de actividad económica",
  [LocationStatusEnum.SHUTDOWN]: "Cierre temporal del negocio",
  [LocationStatusEnum.CHURNED]: "Cambio a otro proveedor",
};

const LOCATION_STATUS_OPTIONS = Object.values(LocationStatusEnum).filter(
  (value): value is LocationStatusEnum => typeof value === "number",
);

interface StoreFormProps {
  locationTypes: LocationTypeDTO[],
  existingStore?: LocationDTO | null;
  selectedCoordinates?: coordinates | null;
  onCreate?: (storeData: LocationDTO) => void;
  onUpdate?: (storeData: LocationDTO) => void;
  onCancel?: () => void;
  onActivate?: (idStore: string) => void;
  onDesactivate?: (idStore: string, deactivationType: LocationDeactivationType) => void;
}

export default function StoreForm({
  locationTypes,
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
  const [deactivationDialogOpen, setDeactivationDialogOpen] = useState<boolean>(false);
  const [selectedDeactivationType, setSelectedDeactivationType] = useState<LocationDeactivationType | "">("");

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
      location_type: { id_location_type: "", location_type_name: "", created_at: new Date() },
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

  const handleOpenDeactivationDialog = () => {
    setSelectedDeactivationType("");
    setDeactivationDialogOpen(true);
  };

  const handleCloseDeactivationDialog = () => {
    setDeactivationDialogOpen(false);
    setSelectedDeactivationType("");
  };

  const handleConfirmDeactivate = async () => {
    if (onDesactivate === undefined || existingStore === null || selectedDeactivationType === "") return;
    await onDesactivate(store.id_location, selectedDeactivationType);
    setDeactivationDialogOpen(false);
    setSelectedDeactivationType("");
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
      location_type: { id_location_type: "", location_type_name: "", created_at: new Date() },
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

  const handleLocationTypeChange = (e: SelectChangeEvent) => {
    const selectedLocationType = locationTypes.find(
      (locationType) => locationType.id_location_type === e.target.value,
    );
    if (selectedLocationType) {
      setStore({ ...store, location_type: selectedLocationType });
    }
  };

  const handleLocationStatusChange = (e: SelectChangeEvent) => {
    const selectedStatusLocation = Number(e.target.value);
    setStore({ ...store, status_location: selectedStatusLocation });
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

      {/* Location type */}
      <FormControl fullWidth size="small" sx={{ backgroundColor: "white", borderRadius: 1 }}>
        <Select
          displayEmpty
          value={store.location_type.id_location_type}
          onChange={handleLocationTypeChange}
        >
          <MenuItem value="" disabled>
            Seleccionar
          </MenuItem>
          {locationTypes.map((locationType) => (
            <MenuItem
              key={locationType.id_location_type}
              value={locationType.id_location_type}
            >
              {locationType.location_type_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

      { 

      }
      {/* Status */}
      <FormControl fullWidth size="small" sx={{ backgroundColor: "white", borderRadius: 1 }}>
        <Select
          displayEmpty
          value={store.status_location ?? ""}
          onChange={handleLocationStatusChange}
        >
          <MenuItem value="" disabled>
            Seleccionar
          </MenuItem>
          {LOCATION_STATUS_OPTIONS.map((locationStatus) => (
            <MenuItem key={locationStatus} value={locationStatus}>
              {LOCATION_STATUS_LABELS[locationStatus]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
            {store.status_location !== 1 ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleOpenDeactivationDialog}
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

      <Dialog open={deactivationDialogOpen} onClose={handleCloseDeactivationDialog} fullWidth maxWidth="xs">
        <DialogTitle>Motivo de desactivación</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedDeactivationType}
            onChange={(e) =>
              setSelectedDeactivationType(e.target.value as LocationDeactivationType)
            }
          >
            {Object.values(LocationDeactivationType).map((deactivationType) => (
              <FormControlLabel
                key={deactivationType}
                value={deactivationType}
                control={<Radio />}
                label={DEACTIVATION_TYPE_LABELS[deactivationType]}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeactivationDialog}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={selectedDeactivationType === ""}
            onClick={handleConfirmDeactivate}
            sx={{
              backgroundColor: "#E74C3C",
              "&:hover": { backgroundColor: "#c0392b" },
              textTransform: "none",
            }}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
