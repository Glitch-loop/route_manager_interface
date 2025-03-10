"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@mui/material";
import { FaTrash } from "react-icons/fa";

interface SortableItemProps {
  id: string;
  name: string;
  onRemove: () => void; // New remove function
}

export function SortableItem({ id, name, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      onClick={() => console.log("Hello world")}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-100 p-2 my-1 rounded flex justify-between items-center cursor-pointer"
    >
      <span>{name}</span>
      <Button size="small" color="error" onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("clicking")
        // onRemove()
        }}><FaTrash /></Button>
    </div>
  );
}
