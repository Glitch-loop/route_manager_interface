// Libraries
import React, { ReactNode, useState } from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {
  Autocomplete,
  Button,
  Collapse,
  Dialog,
  IconButton,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  LockOutline,
  LockOpen,
  VisibilityOff,
  Visibility,
  DeleteOutline,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

// Dtos
import { LocationDTO } from "@/shared/dtos/LocationDTO";

// Types
import { 
  RouteDayEffect, 
} from "@/shared/hooks/route-day-location-map/types/types";
import { 
  RouteDayActionStateType, 
  SortableLocationType 
} from '@/app/route_administration/components/SortableContainer/Types/types';

// Components
import ColorPicker from '@/shared/components/ColorPicker/ColorPicker';

// Utils
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord } from '@/utils/generalUtils';

type ColumnType = {
  children: ReactNode;
  id: string;
  routeName: string;
  clientsInRoute: SortableLocationType[],
  routeDayActionState: RouteDayActionStateType,
  routeDayEffect: RouteDayEffect,
  selectedRouteDayLocations: Set<string>,
  onChangeRouteDayEffect: (routeDayId: string, routeDayEffect: RouteDayEffect) => void,
  onChangeRouteDayActionState: (routeDayId: string, routeDayActionState: RouteDayActionStateType) => void,
  onSaveRouteModification: (idRouteDay: string) => void;
  onRemoveStores: (idRouteDay: string) => void; // Callback to remove stores from route day, receives list of id_route_day_store to remove
  onResetRouteModification: (idRouteDay: string) => void;
  onCancelRouteModification: (idRouteDay: string) => void;
  onSelectAll: (idRouteDay: string, isSelectAll: boolean) => void;
  onAddStore: (idRouteDay: string, idStore: string) => void; // Add new store to route day
  availableStores: Map<string, LocationDTO>; // Map of id_location to LocationDTO
  onHoverStore: (store: LocationDTO | null) => void; // Callback when hovering over store option
}

type RouteDayContainerActions = "reset" | "remove" | "save" | "close";



export function Column({
  children, 
  id, // The ID of the component is the same that the route day.
  routeName,
  clientsInRoute,
  routeDayActionState,
  routeDayEffect,
  selectedRouteDayLocations,
  onChangeRouteDayEffect,
  onChangeRouteDayActionState,
  onSaveRouteModification,
  onRemoveStores,
  onResetRouteModification,
  onCancelRouteModification,
  onSelectAll,
  onAddStore,
  availableStores,
  onHoverStore
}: ColumnType) {
  // --Custom hooks--
  const { ref } = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });

  // Get effect from map

  // --Use states--
  const [inputValue, setInputValue] = useState<string>("");
  const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("name");

  // Selected states
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // UI states
  const [dialogAction, setDialogAction] =
    useState<RouteDayContainerActions | null>(null);
  const [menuExpanded, setMenuExpanded] = useState<boolean>(true);


  // --Handlers--
  const handleSelectAll = () => {
    if (selectAll) {
      onSelectAll(id, false);
    } else {
      onSelectAll(id, true);
    }

    setSelectAll(!selectAll);
  };

  const handleResetRouteModification = () => {
    onResetRouteModification(id);
  };

  const handleSaveModifications = () => {
    onSaveRouteModification(id);
  };

  const handleCloseRouteModification = () => {
    onCancelRouteModification(id);
  };

  const handleOpenDialog = (actionType: RouteDayContainerActions) => {
    setDialogAction(actionType);
  };

  const handleCloseDeleteDialog = () => {
    setDialogAction(null);
  };

  const handleAcceptDialog = () => {
    if (dialogAction === "remove") {
      handleAcceptDeleteStores();
    } else if (dialogAction === "reset") {
      handleResetRouteModification();
    } else if (dialogAction === "save") {
      handleSaveModifications();
    } else if (dialogAction === "close") {
      handleCloseRouteModification();
    }

    setDialogAction(null);
  };

  const handleAddStore = (idRouteDay: string, idStore: string) => {
    if (!routeDayActionState.isEditable) return; // Do not allow add new clients if we are in edit mode
    onAddStore(idRouteDay, idStore);
    setInputValue("");
    onHoverStore(null); // Reset hover state after adding a store
  };

  // Handlers regarded to actions
  // Regarded to edit (only reorder) the route day.
  const handleChangeEditableState = (id: string, newState: boolean) => {
    onChangeRouteDayActionState(id, {...routeDayActionState, isEditable: newState});
  }

  // Regarded to delete mode.
  const handleStartDeleteMode = () => {
    onChangeRouteDayActionState(id, {...routeDayActionState, 
      isDeletedMode: true, isEditable: true});
    setSelectAll(false);
  };

  const handleCancelDeleteMode = () => {
    const { isDeletedMode } = routeDayActionState;
    if (isDeletedMode) {
      // Just exit delete mode without removing anything
      onChangeRouteDayActionState(id, {...routeDayActionState, 
        isDeletedMode: false, isEditable: false});
    }
    setSelectAll(false);
  };

  const handleAcceptDeleteStores = () => {
    const { isDeletedMode } = routeDayActionState;
    if (isDeletedMode) {
      // Remove selected stores
      if (selectedRouteDayLocations.size > 0) {
        onRemoveStores(id);
      }
      onChangeRouteDayActionState(id, {...routeDayActionState, 
        isDeletedMode: false, isEditable: false});
    }
    setSelectAll(false);
  };

  // Handlers regarded to effects
  const handleShowInformation = (id: string, newState: boolean) => {
    onChangeRouteDayEffect(id, { ...routeDayEffect, showStores: newState });
  }

  const handleSelectRouteDayColor = (id: string, selectedColor: string) => {
    onChangeRouteDayEffect(id, { ...routeDayEffect, assignedColor: selectedColor });
  }

  return (
    <div className="Column w-96 h-full flex flex-col shrink-0 overflow-auto  bg-system-primary-background rounded-lg" ref={ref}>
      <Dialog
        open={dialogAction !== null}
        onClose={() => handleCloseDeleteDialog()}
      >
        <div className="p-3 flex flex-col gap-2 justify-center items-center">
          <h3 className="text-center font-bold text-lg">
            ¿Estas seguro de hacer la acción?
          </h3>
          {dialogAction === "remove" && (
            <div className="flex flex-col justify-center items-center">
              <span className="text-center text-red-600 font-semibold">
                Se eliminarán {selectedRouteDayLocations.size} cliente(s) de este día de
                ruta.
              </span>
              <span className="text-center font-bold">
                Después aplica los cambios para que se guarden las
                modificaciones realizadas.
              </span>
            </div>
          )}
          {dialogAction === "save" && (
            <span className="text-center text-red-600 font-semibold">
              Se guardarán los cambios realizados en este día de ruta.
            </span>
          )}
          {dialogAction === "reset" && (
            <span className="text-center text-red-600 font-semibold">
              Se restablecerán los cambios realizados en este día de ruta hasta
              el último punto de guardado.
            </span>
          )}
          {dialogAction === "close" && (
            <span className="text-center text-red-600 font-semibold">
              Se cerrará la modificación de este día de ruta. Cualquier cambio
              no guardado se perderá.
            </span>
          )}

          <div className="flex flex-row gap-5 justify-center mt-5">
            <Button
              variant="contained"
              color="success"
              onClick={handleAcceptDialog}
            >
              Aceptar
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleCloseDeleteDialog}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog>
      <div className="p-2 flex flex-col">
        {/* Title and main actions */}
        <div className="flex flex-row justify-start items-center my-2">
          <div className="flex basis-1/2 gap-2 items-center">
            <h3 className="text-center align-middle font-bold text-lg">
              {capitalizeFirstLetterOfEachWord(routeName)}
            </h3>
            {/* Control if editable */}
            <Tooltip
              title={
                !routeDayActionState.isEditable
                  ? "Cambiar a modo edición"
                  : "Cambiar a modo solo vista"
              }
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#f5a623",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#e09620",
                  },
                  width: 40,
                  height: 40,
                }}
                onClick={() => handleChangeEditableState(id, !routeDayActionState.isEditable)}
                className="h-fit my-auto shadow-md"
                size="small"
              >
                {!routeDayActionState.isEditable ? <LockOutline /> : <LockOpen />}
              </IconButton>
            </Tooltip>
            {/* Control if visible */}
            <Tooltip
              title={
                routeDayEffect.showStores ? "Ocultar información" : "Mostrar información"
              }
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#f58220",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#e0741a",
                  },
                  width: 40,
                  height: 40,
                }}
                onClick={() =>
                  handleShowInformation(id, routeDayEffect.showStores)
                }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                {routeDayEffect.showStores ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
            {/* Control the color of the route day */}
            <Tooltip
              title={"Cambiar color del día de ruta"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <ColorPicker
                initialColor={routeDayEffect.assignedColor}
                onChange={(color) =>
                  handleSelectRouteDayColor(id, color)
                }
              />
            </Tooltip>
          </div>
          <div className="flex basis-1/2 justify-end mr-3">
            <Tooltip
              title={"Remover clientes de este día"}
              placement="top"
              enterDelay={300}
              arrow
            >
              <IconButton
                sx={{
                  backgroundColor: "#f3281a",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#c72418",
                  },
                  width: 40,
                  height: 40,
                }}
                onClick={() =>
                  routeDayActionState.isDeletedMode
                    ? handleCancelDeleteMode()
                    : handleStartDeleteMode()
                }
                className="h-fit my-auto shadow-md"
                size="small"
              >
                <DeleteOutline />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        {/* Menu toggle button */}
        <div
          className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
          onClick={() => setMenuExpanded(!menuExpanded)}
        >
          <span className="font-semibold text-sm text-gray-600">
            {routeDayActionState.isDeletedMode ? "Opciones de eliminación" : "Opciones de cliente"}
          </span>
          {menuExpanded ? <ExpandLess /> : <ExpandMore />}
        </div>
        {/* Menu - Collapsible */}
        <Collapse in={menuExpanded}>
          <div className="flex flex-row w-full justify-center items-center gap-2">
            {routeDayActionState.isDeletedMode ? (
              <div className="flex flex-row w-full justify-between">
                <h5 className="font-bold text-lg">Eliminar clientes</h5>
                <Button
                  onClick={handleSelectAll}
                  color="info"
                  variant="contained"
                >
                  {selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 w-full">
                <h5 className="font-bold text-lg">Agregar cliente</h5>
                <div className="flex flex-row">
                  <Switch
                    checked={searchStoreBy === "name"}
                    onChange={(e) =>
                      setSearchStoreBy(e.target.checked ? "name" : "address")
                    }
                    size="small"
                  />
                  <span className="text-sm">{`Buscar por ${searchStoreBy === "name" ? "nombre" : "dirección"}`}</span>
                </div>
                <div className="flex flex-row gap-3">
                  <div className="flex basis-4/5">
                    <Autocomplete
                      disabled={!routeDayActionState.isEditable}
                      options={Array.from(availableStores.values())}
                      className="w-full"
                      getOptionKey={(option) => option.id_location}
                      getOptionLabel={(option) =>
                        searchStoreBy === "name"
                          ? (option.location_name ?? "Nombre no disponible")
                          : getAddressOfStore(option)
                      }
                      value={null}
                      inputValue={inputValue}
                      onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleAddStore(id, newValue.id_location);
                        }
                      }}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          key={option.id_location}
                          onMouseEnter={() => onHoverStore(option)}
                          onMouseLeave={() => onHoverStore(null)}
                        >
                          <div className="flex flex-col">
                            <span>
                              {option.location_name ?? "Nombre no disponible"}
                            </span>
                            <span className="text-sm">
                              {getAddressOfStore(option)}
                            </span>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Add Item"
                        />
                      )}
                    />
                  </div>
                  <Tooltip
                    title={"Revierte los cambios al ultimo estado guardado"}
                    placement="top"
                    enterDelay={300}
                    arrow
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleOpenDialog("reset")}
                    >
                      Reset
                    </Button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </Collapse>
      </div>
      {/* Estimated total section */}
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total vendido entre el rango de fechas seleccionado:{" "}
        </span>
        <span className="font-bold text-lg text-black">
          {/* {formatNumberAsAccountingCurrency(
            calculateStoresGreatTotalSales(
              routeDayActionState.isDeletedMode ? storesToAttend.filter((storeToAttend) => !selectedStores.has(storeToAttend.id_location)) : storesToAttend,
              routeTransactionsMap
            )
          )} */}
        </span>
      </div>
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total clientes en día de ruta:{" "}
        </span>
        <span className="font-bold text-lg text-black"> {clientsInRoute.length} </span>
      </div>
      {/* Droppable container */}
      <div
        className="flex min-h-[500px] overflow-y-auto bg-system-secondary-background"
        style={{ scrollBehavior: "smooth" }}
      >
        {children}
      </div>
      {/* Actions buttons bar - Always visible */}
      <div className="bg-system-primary-background w-full flex flex-row gap-5 justify-center py-2 flex-shrink-0">
        {routeDayActionState.isDeletedMode ? (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleOpenDialog("remove")}
          >
            Aceptar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => handleOpenDialog("save")}
          >
            Guardar
          </Button>
        )}
        <Button
          variant="contained"
          color="warning"
          onClick={() =>
            routeDayActionState.isDeletedMode ? handleCancelDeleteMode() : handleOpenDialog("close")
          }
        >
          {routeDayActionState.isDeletedMode ? "Cancelar eliminación" : "Cerrar día de ruta"}
        </Button>
      </div>
    </div>
  );
}