"use client";
import { useState } from "react";
import { ICatalogItem } from "@/interfaces/interfaces";
import { Button, Paper } from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface DragDropCatalogItemsProps {
  catalogItems: ICatalogItem[];
  onSave: (updatedCatalogItems: ICatalogItem[]) => void;
  title:  string;
}

export default function DragDropCatalogItems({ catalogItems, onSave, title }: DragDropCatalogItemsProps) {
  const [orderedCatalogItems, setOrderedCatalogItems] = useState<ICatalogItem[]>(catalogItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCatalogItems.findIndex((p) => p.id_item === active.id);
    const newIndex = orderedCatalogItems.findIndex((p) => p.id_item === over.id);

    const updatedList = arrayMove(orderedCatalogItems, oldIndex, newIndex).map((product, index) => ({
      ...product,
      order_to_show: index + 1,
    }));

    setOrderedCatalogItems(updatedList);
  };

  const handleSave = () => {
    onSave(orderedCatalogItems);
  };

  return (
    <div className="relative w-full p-4">
      <div className="sticky top-0 z-10 bg-system-primary-background py-2 flex flex-row justify-around">
        <span className="text-center align-middle flex items-center">{title}</span>
        <div>
          <Button variant="contained" color="primary" className="mt-4" onClick={handleSave}>
            Guardar orden
          </Button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedCatalogItems.map((p) => p.id_item)} strategy={verticalListSortingStrategy}>
          <Paper className="p-4 overflow-y-auto">
            {orderedCatalogItems.map((product) => (
              <SortableItem key={product.id_item} id={product.id_item} name={product.item_name} />
            ))}
          </Paper>
        </SortableContext>
      </DndContext>


    </div>
  );
}
