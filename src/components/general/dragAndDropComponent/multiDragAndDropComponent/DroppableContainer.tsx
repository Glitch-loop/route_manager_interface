"use client";
import { useState, useEffect } from "react";
import { ICatalogItem } from "@/interfaces/interfaces";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Paper, Button, Autocomplete, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { SortableItem } from "@/components/general/dragAndDropComponent/SortableItem";

interface DroppableContainerProps {
  id: string;
  title: string;
  items: ICatalogItem[];
  allItems: ICatalogItem[];
  onSave: () => void;
  onClose: () => void;
  onAddItem: (item: ICatalogItem | null) => void;
  onHoverOption: (item: ICatalogItem | null) => void;
}

export default function DroppableContainer({ id, title, items, allItems, onAddItem, onSave, onClose, onHoverOption }: DroppableContainerProps) {
  const { setNodeRef } = useDroppable({ id });
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);

  //Handlers for verifying if it is needed the dialog
  const handleClose = () => {
    setIsSave(false);
    if (items.length > 0) {
      setConfirmDialog(true); // Ask for confirmation if there are items
    } else {
      onClose(); // Directly close if empty
    }
  }

  // Handle Save with validation
  const handleSave = () => {
    setIsSave(true);
    if (items.length > 0) {
      setConfirmDialog(true); // Ask for confirmation if there are items
    } else {
      onClose(); // Directly close if empty
    }
  };


  // Handle Confirmed validation
  const handleConfirm = () => {
    setConfirmDialog(false);
    setIsSave(true);
    if(isSave) {
      onSave();
    } else {
      onClose();
    }
  }

  const handleCancel = () => {
    setConfirmDialog(false);
  }

  return (
    <Paper ref={setNodeRef} className="w-1/3 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex justify-between my-4">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Guardar
        </Button>
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </div>


      {/* Search & Add New Items */}
      <Autocomplete
        options={allItems.map((item) => { return { id: item.id_item_in_container, ...item }})}
        getOptionKey={(option) => option.id_item_in_container}
        getOptionLabel={(option) => option.item_name}
        onChange={(event, newValue) => { onAddItem(newValue) }}
        renderOption={(props, option) => (
          <li
            {...props}
            onMouseEnter={() => onHoverOption(option)} // Detect hover
            onMouseLeave={() => onHoverOption(null)} // Detect hover
          >
            {option.item_name}
          </li>
        )}

        renderInput={(params) => <TextField {...params} label="Add Item" />}
      />

      <SortableContext items={items.map((p) => p.id_item_in_container)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem 
            key={item.id_item_in_container} 
            id={item.id_item_in_container} 
            name={item.item_name}
          />
        ))}
      </SortableContext>

      {/* Close Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          { isSave ?
            <p>¿Seugro que quieres guardar los cambios?</p>
            :
            <p>Hay elementos en esta lista. ¿Estás seguro de que quieres cerrar sin guardar?</p>
          }
        </DialogContent>
        { isSave ?
          <DialogActions>
            <Button onClick={handleConfirm} color="primary">Guardar</Button>
            <Button onClick={handleCancel} color="secondary">Cancelar</Button>
          </DialogActions>:
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">Cancelar</Button>
            <Button onClick={handleConfirm} color="primary">Cerrar sin Guardar</Button>
          </DialogActions>
        }
      </Dialog>
    </Paper>
  );
}
