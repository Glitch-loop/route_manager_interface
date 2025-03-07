"use client";
import { useState } from "react";
import { ICatalogItem } from "@/interfaces/interfaces";
import { Button, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
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
  onSave: (updatedMatrix: ICatalogItem[][]) => void;
}

export default function MultiContainerDragDrop({ catalogMatrix, catalogTitles, onSave }: MultiContainerDragDropProps) {
  const [catalogs, setCatalogs] = useState<ICatalogItem[][]>(catalogMatrix);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{ item: ICatalogItem; fromIndex: number; toIndex: number } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const fromIndex = catalogs.findIndex((list) => list.some((item) => item.id_item_in_container === active.id));
    const toIndex = catalogs.findIndex((list) => list.some((item) => item.id_item_in_container === over.id));

    if (fromIndex !== toIndex) {
      const itemToMove = catalogs[fromIndex].find((item) => item.id_item_in_container === active.id);
      if (!itemToMove) return;

      setPendingTransfer({ item: itemToMove, fromIndex, toIndex });
      setDialogOpen(true);
    } else {
      // Reorder inside the same container
      const updatedList = arrayMove(catalogs[fromIndex], active.data.current.sortable.index, over.data.current.sortable.index)
        .map((item, index) => ({ ...item, order_to_show: index + 1 }));

      setCatalogs((prev) => {
        const newCatalogs = [...prev];
        newCatalogs[fromIndex] = updatedList;
        return newCatalogs;
      });
    }
  };

  const confirmTransfer = (keepOriginal: boolean) => {
    if (!pendingTransfer) return;

    const { item, fromIndex, toIndex } = pendingTransfer;

    setCatalogs((prev) => {
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

  return (
    <div className="relative w-full p-4">
      <div className="sticky top-0 z-10 bg-system-primary-background py-2 flex flex-row justify-around">
        <Button variant="contained" color="primary" className="mt-4" onClick={() => onSave(catalogs)}>
          Save Changes
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-row gap-4">
          {catalogs.map((items, index) => (
            <DroppableContainer key={index} id={index.toString()} title={catalogTitles[index]} items={items} />
          ))}
        </div>
      </DndContext>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Move Item</DialogTitle>
        <DialogContent>
          <p>Do you want to keep this item in the original list?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => confirmTransfer(true)} color="primary">
            Keep Original
          </Button>
          <Button onClick={() => confirmTransfer(false)} color="secondary">
            Remove from Original
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
