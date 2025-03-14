"use client";
import { useState } from "react";
import { ICatalogItem } from "@/interfaces/interfaces";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
} from "@dnd-kit/sortable";

import DroppableContainer from "@/components/general/dragAndDropComponent/multiDragAndDropComponent/DroppableContainer";
import { generateUUIDv4 } from "@/utils/generalUtils";
// import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import ConfirmDialog from "../../ConfirmDialog";

interface MultiContainerDragDropProps {
  catalogMatrix: ICatalogItem[][]; // Matrix of catalog items
  catalogTitles: ICatalogItem[]; // Titles for each container
  allItems: ICatalogItem[]; // All possible items for search
  onSave: (column:number, catalogItem:ICatalogItem) => void;
  onClose:(column: number) => void;
  onModifyCatalogMatrix: (updatedMatrix:ICatalogItem[][]) => void;
  onHoverOption: (item: ICatalogItem | null) => void;
  onSelectExistingItem: (selectedItem: ICatalogItem) => void;
}

export default function MultiContainerDragDrop({ 
  catalogMatrix, 
  catalogTitles, 
  allItems, 
  onSave, 
  onClose,
  onModifyCatalogMatrix,
  onHoverOption,
  onSelectExistingItem,
}: MultiContainerDragDropProps) {
  const [catalogs, setCatalogs] = useState<ICatalogItem[][]>(catalogMatrix);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{ item: ICatalogItem; fromIndex: number; toIndex: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<string|null>(null);
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState<boolean>(false);

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


        onModifyCatalogMatrix(catalogMatrix.map((catalog, index) => 
          index === fromIndex ? updatedList : catalog
        ));
    }

    handleCleanDeleteItemsStates();
  };

  // Confirm Transfer Between Containers
  const confirmTransfer = (keepOriginal: boolean) => {
    if (!pendingTransfer) return;

    const { item, fromIndex, toIndex } = pendingTransfer;

    onModifyCatalogMatrix(catalogMatrix.map((catalog, index) => {
      if (index === toIndex) {
        return [...catalog, { ...item, id_item_in_container: generateUUIDv4(), order_to_show: catalog.length + 1 }];
      }
      if (!keepOriginal && index === fromIndex) {
        return catalog.filter((i) => i.id_item_in_container !== item.id_item_in_container);
      }
      return catalog;
    }));

    setDialogOpen(false);
    setPendingTransfer(null);
  };

  // Remove Item from Container
  const handleCleanDeleteItemsStates = () => {
    setSelectedItem(null);
    setShowDialogDeleteItem(false);
  }
  const handlerSelectItem = (idItem:string) => {
    if(selectedItem === null) { // First time the user selects an item
      setSelectedItem(idItem);
      setShowDialogDeleteItem(false);
    } else {
      if (selectedItem === idItem) { // Second time the user selects an item
        setShowDialogDeleteItem(true);
      } else {
        handleCleanDeleteItemsStates();
      }
    }
  }

  const handleRemoveItem = (id_item_container_to_delete:string|null) => {    
    onModifyCatalogMatrix(catalogMatrix.map((catalog) =>
      catalog.filter((item) => item.id_item_in_container !== id_item_container_to_delete)
    ));

    handleCleanDeleteItemsStates();
    
  };

  // Add New Item via Search
  const handleAddItem = (containerIndex: number, item: ICatalogItem | null, catalogThatBelongs: ICatalogItem) => {
    if (!item) return
    onModifyCatalogMatrix(catalogMatrix.map((catalog, index) =>
      index === containerIndex
        ? [...catalog, { ...item, id_item_in_container: generateUUIDv4(), order_to_show: catalog.length + 1, id_group: catalogThatBelongs.id_item }]
        : catalog
    ));
  };

  const handlerSelectingExistingItem = (idItemInContinaer:string) => {
    const catalogItem: ICatalogItem | undefined = catalogMatrix
    .find((catalog) => catalog.some((item) => item.id_item_in_container === idItemInContinaer))
    ?.find((item) => item.id_item_in_container === idItemInContinaer);
    if (catalogItem) {
      onSelectExistingItem(catalogItem)
    }
  }

  // Handle Container Save
  const handleSaveContainer = (index: number, catalogItem:ICatalogItem) => {
    onSave(index, catalogItem);
  };

  // Handle Close Without Saving
  const handleCloseWithoutSave = (index: number) => {
    onClose(index); // Reset to initial state
  };

  return (
    <div className="relative w-full p-4">
      <DndContext sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd} 
        onDragOver={(event) => handlerSelectingExistingItem(event.active.id.toString())}
        onDragStart={(event) => { handlerSelectItem(event.active.id.toString()); }}>
        <div className="w-full flex flex-row gap-4">
          {catalogMatrix.map((items, index) => (
            <DroppableContainer
              key={index}
              id={index.toString()}
              title={catalogTitles[index].item_name}
              items={items}
              allItems={allItems}
              onSave={() => handleSaveContainer(index, catalogTitles[index])}
              onClose={() => handleCloseWithoutSave(index)}
              onAddItem={(item) => handleAddItem(index, item, catalogTitles[index])}
              onHoverOption={(item) => onHoverOption(item)}
              // onRemoveItem={(item) => handleRemoveItem(index, item)}
              />
          ))}
        </div>
      </DndContext>

      {/* Confirmation Dialog */}

      <ConfirmDialog 
        open={dialogOpen}
        title={"Mover tienda"}
        question={"¿Quieres conservar tambien la tienda en la ruta actual?"}
        leftText={"Mantener tienda"}
        rightText={"Borrarla de la ruta original"}
        onLeftClick={() => confirmTransfer(true)} 
        onRightClick={() => confirmTransfer(false)} 
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog 
        open={showDialogDeleteItem}
        title={"Eliminar tienda"}
        question={"¿Quieres eliminar la tienda de la ruta actual?"}
        leftText={"Mantener tienda"}
        rightText={"Borrar tienda"}
        onLeftClick={() => handleCleanDeleteItemsStates()} 
        onRightClick={() => handleRemoveItem(selectedItem)} 
        onClose={() => handleCleanDeleteItemsStates() }
      />
      
    </div>
  );
}
