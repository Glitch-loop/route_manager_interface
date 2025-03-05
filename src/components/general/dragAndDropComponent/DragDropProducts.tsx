"use client";
import { useState } from "react";
import { IProduct } from "@/interfaces/interfaces";
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

interface DragDropProductsProps {
  products: IProduct[];
  onSave: (updatedProducts: IProduct[]) => void;
}

export default function DragDropProducts({ products, onSave }: DragDropProductsProps) {
  const [orderedProducts, setOrderedProducts] = useState<IProduct[]>(products);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedProducts.findIndex((p) => p.id_product === active.id);
    const newIndex = orderedProducts.findIndex((p) => p.id_product === over.id);

    const updatedList = arrayMove(orderedProducts, oldIndex, newIndex).map((product, index) => ({
      ...product,
      order_to_show: index + 1,
    }));

    setOrderedProducts(updatedList);
  };

  const handleSave = () => {
    onSave(orderedProducts);
  };

  return (
    <div className="w-full p-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedProducts.map((p) => p.id_product)} strategy={verticalListSortingStrategy}>
          <Paper className="p-4">
            {orderedProducts.map((product) => (
              <SortableItem key={product.id_product} id={product.id_product} name={product.product_name} />
            ))}
          </Paper>
        </SortableContext>
      </DndContext>

      <Button variant="contained" color="primary" className="mt-4" onClick={handleSave}>
        Save Order
      </Button>
    </div>
  );
}
