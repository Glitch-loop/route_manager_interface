"use client";
import { ICatalogItem } from "@/interfaces/interfaces";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Paper } from "@mui/material";
import { SortableItem } from "@/components/general/dragAndDropComponent/SortableItem";

interface DroppableContainerProps {
  id: string;
  title: string;
  items: ICatalogItem[];
}

export default function DroppableContainer({ id, title, items }: DroppableContainerProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <Paper ref={setNodeRef} className="w-1/2 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <SortableContext items={items.map((p) => p.id_item_in_container)} strategy={verticalListSortingStrategy}>
        {items.map((product) => (
          <SortableItem key={product.id_item_in_container} id={product.id_item_in_container} name={product.item_name} />
        ))}
      </SortableContext>
    </Paper>
  );
}
