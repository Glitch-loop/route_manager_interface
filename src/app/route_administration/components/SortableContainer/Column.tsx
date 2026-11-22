import React, { Dispatch, ReactNode, useState } from 'react';
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
  RemoveCircleOutline,
} from "@mui/icons-material";
import { capitalizeFirstLetterOfEachWord } from '@/utils/generalUtils';
import ColorPicker from '@/shared/components/ColorPicker/ColorPicker';

import { 
  RouteDayEffect, 
} from "@/shared/hooks/route-day-location-map/types/types";
import { getRouteDayEffect } from "@/shared/hooks/route-day-location-map/utils/utils";
import { RouteDayActionStateType } from '@/app/route_administration/components/SortableContainer/Types/types';

type ColumnType = {
  children: ReactNode;
  id: string;
  routeName: string;
  numberOfClientsInRoute: number
  routeDayActionState: RouteDayActionStateType,
  routeDayEffect: RouteDayEffect,
  onChangeRouteDayEffect: (routeDayId: string, routeDayEffect: RouteDayEffect) => void,
  onChangeRouteDayActionState: (routeDayId: string, routeDayActionState: RouteDayActionStateType) => void,
  onSaveRouteModification: (idRouteDay: string) => void;
  onRemoveStores: (idRouteDay: string, idsRouteDayStore: string[]) => void; // Callback to remove stores from route day, receives list of id_route_day_store to remove
}

type RouteDayContainerActions = "reset" | "remove" | "save" | "close";



export function Column({
  children, 
  id, // The ID of the component is the same that the route day.
  routeName,
  numberOfClientsInRoute,
  routeDayActionState,
  onChangeRouteDayActionState,
  routeDayEffect,
  onChangeRouteDayEffect,
  onSaveRouteModification,
  onRemoveStores
}: ColumnType) {
  // --Custom hooks--
  const {isDropTarget, ref} = useDroppable({
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
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set()); // Track selected stores for deletion
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // Delete mode states
  const [deleteMode, setDeleteMode] = useState<boolean>(false);

  // UI states
  const [dialogAction, setDialogAction] =
    useState<RouteDayContainerActions | null>(null);
  const [menuExpanded, setMenuExpanded] = useState<boolean>(true);


  // --Handlers--
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStores(new Set());
    } else {
      const allStoreIds = storesToAttend.map(
        (store) => store.id_route_day_store,
      );
      setSelectedStores(new Set(allStoreIds));
    }

    setSelectAll(!selectAll);
  };

  // const handleResetRouteModification = () => {
  //   onResetRouteModification(id);
  // };

  const handleSaveModifications = () => {
    onSaveRouteModification(id);
  };

  // const handleCloseRouteModification = () => {
  //   onCancelRouteModification(id);
  // };

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
      // handleResetRouteModification();
    } else if (dialogAction === "save") {
      handleSaveModifications();
    } else if (dialogAction === "close") {
      // handleCloseRouteModification();
    }

    setDialogAction(null);
  };

  // const handleAddStore = (idRouteDay: string, idStore: string) => {
  //   if (onlyViewMode) return; // Do not allow add new clients if we are in view mode
  //   onAddStore(idRouteDay, idStore);
  //   setInputValue("");
  //   onHoverAutocompleteOption(null); // Reset hover state after adding a store
  // };

  // Handlers regarded to actions
  // Regarded to edit (only reorder) the route day.
  const handleChangeEditableState = (id: string, newState: boolean) => {
    onChangeRouteDayActionState(id, {...routeDayActionState, isEditable: newState});
  }

  // Regarded to delete mode.
  const handleStartDeleteMode = () => {
    onChangeRouteDayActionState(id, {...routeDayActionState, 
      isDeletedMode: true, isEditable: true});
  };

  const handleCancelDeleteMode = () => {
    const { isDeletedMode } = routeDayActionState;
    if (isDeletedMode) {
      // Just exit delete mode without removing anything
      setSelectedStores(new Set());
      onChangeRouteDayActionState(id, {...routeDayActionState, 
        isDeletedMode: false, isEditable: false});
    }
  };

  const handleAcceptDeleteStores = () => {
    const { isDeletedMode } = routeDayActionState;
    if (isDeletedMode) {
      // Remove selected stores
      if (selectedStores.size > 0) {
        onRemoveStores(id, Array.from(selectedStores));
      }
      onChangeRouteDayActionState(id, {...routeDayActionState, 
        isDeletedMode: false, isEditable: false});
      setSelectedStores(new Set());
    }
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
                Se eliminarán {selectedStores.size} cliente(s) de este día de
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
                deleteMode
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
      {/* Estimated total section */}
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total vendido entre el rango de fechas seleccionado:{" "}
        </span>
        <span className="font-bold text-lg text-black">
          {/* {formatNumberAsAccountingCurrency(
            calculateStoresGreatTotalSales(
              deleteMode ? storesToAttend.filter((storeToAttend) => !selectedStores.has(storeToAttend.id_location)) : storesToAttend,
              routeTransactionsMap
            )
          )} */}
        </span>
      </div>
      <div className="flex flex-row justify-end items-center px-4 py-2 ">
        <span className="font-bold text-lg mr-2">
          Total clientes en día de ruta:{" "}
        </span>
        <span className="font-bold text-lg text-black"> {numberOfClientsInRoute} </span>
      </div>
      {children}
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
            deleteMode ? handleCancelDeleteMode() : handleOpenDialog("close")
          }
        >
          {deleteMode ? "Cancelar eliminación" : "Cerrar día de ruta"}
        </Button>
      </div>
    </div>
  );
}