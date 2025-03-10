"use client";
import { useState } from "react";
import { ICatalogItem } from "@/interfaces/interfaces";
import { Button, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Autocomplete } from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/general/dragAndDropComponent/SortableItem";
import DroppableContainer from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/DroppableContainer";
import { generateUUIDv4 } from "@/utils/generalUtils";

interface MultiContainerDragDropProps {
  catalogMatrix: ICatalogItem[][]; // Matrix of catalog items
  catalogTitles: string[]; // Titles for each container
  allItems: ICatalogItem[]; // All possible items for search
  onSave: (column:number) => void;
  onClose:(column: number) => void;
  onModifyCatalogMatrix: (updatedMatrix:ICatalogItem[][]) => void;
}

export default function MultiContainerDragDrop({ 
  catalogMatrix, 
  catalogTitles, 
  allItems, 
  onSave, 
  onClose,
  onModifyCatalogMatrix,
}: MultiContainerDragDropProps) {
  const [catalogs, setCatalogs] = useState<ICatalogItem[][]>(catalogMatrix);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{ item: ICatalogItem; fromIndex: number; toIndex: number } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // Handle Drag & Drop Movement
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = catalogMatrix.findIndex((list) => list.some((item) => item.id_item_in_container === active.id));
    const toIndex = catalogMatrix.findIndex((list) => list.some((item) => item.id_item_in_container === over.id));

    if (fromIndex !== toIndex) {
      const itemToMove = catalogMatrix[fromIndex].find((item) => item.id_item_in_container === active.id);
      if (!itemToMove) return;

      setPendingTransfer({ item: itemToMove, fromIndex, toIndex });
      setDialogOpen(true);
    } else {
      const updatedList = arrayMove(catalogMatrix[fromIndex], active.data.current.sortable.index, over.data.current.sortable.index)
        .map((item, index) => ({ ...item, order_to_show: index + 1 }));

      onModifyCatalogMatrix((prev) => {
        const newCatalogs = [...prev];
        newCatalogs[fromIndex] = updatedList;
        return newCatalogs;
      });
    }
  };

  // Confirm Transfer Between Containers
  const confirmTransfer = (keepOriginal: boolean) => {
    if (!pendingTransfer) return;

    const { item, fromIndex, toIndex } = pendingTransfer;

    onModifyCatalogMatrix((prev) => {
      const newCatalogs = [...prev];
      newCatalogs[toIndex] = [...newCatalogs[toIndex], { ...item, id_item_in_container: generateUUIDv4(), order_to_show: newCatalogs[toIndex].length + 1 }];
      if (!keepOriginal) {
        newCatalogs[fromIndex] = newCatalogs[fromIndex].filter((i) => i.id_item_in_container !== item.id_item_in_container);
      }
      return newCatalogs;
    });

    setDialogOpen(false);
    setPendingTransfer(null);
  };

  // Remove Item from Container
  const handleRemoveItem = (containerIndex: number, itemToDelete: ICatalogItem) => {
    console.log("Removing item")
    onModifyCatalogMatrix((prev) => {
      const newCatalogs = [...prev];
      newCatalogs[containerIndex] = newCatalogs[containerIndex].filter((item:ICatalogItem) => item.id_item_in_container !== itemToDelete.id_item_in_container);
      return newCatalogs;
    });
  };

  // Add New Item via Search
  const handleAddItem = (containerIndex: number, item: ICatalogItem | null) => {
    console.log("Adding item")
    if (!item) return
    onModifyCatalogMatrix((prev) => {
      const newCatalogs = [...prev];
      newCatalogs[containerIndex] = [...newCatalogs[containerIndex], { ...item, id_item_in_container: generateUUIDv4(), order_to_show: newCatalogs[containerIndex].length + 1 }];
      return newCatalogs;
    });
  };

  // Handle Container Save
  const handleSaveContainer = (index: number) => {
    onSave(index);
  };

  // Handle Close Without Saving
  const handleCloseWithoutSave = (index: number) => {
    onClose(index); // Reset to initial state
  };

  return (
    <div className="relative w-full p-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} 
      onDragOver={() => console.log("AAAAAAAA")}>
        <div className="w-full flex flex-row gap-4">
          {catalogMatrix.map((items, index) => (
            <DroppableContainer
              key={index}
              id={index.toString()}
              title={catalogTitles[index]}
              items={items}
              allItems={allItems}
              onSave={() => handleSaveContainer(index)}
              onClose={() => handleCloseWithoutSave(index)}
              onAddItem={(item) => handleAddItem(index, item)}
              onRemoveItem={(item) => handleRemoveItem(index, item)}
              />
          ))}
        </div>
      </DndContext>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Mover tienda</DialogTitle>
        <DialogContent>
          <p>¿Quiere convervar tambien la tienda en la ruta actual?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => confirmTransfer(true)} color="primary">
            Mantener tienda
          </Button>
          <Button onClick={() => confirmTransfer(false)} color="secondary">
            Borrarla de la ruta original
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
