import { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {move} from '@dnd-kit/helpers';
import { Column } from "./components/DroppableColumn";
import { Item } from "./components/DraggableItem";
import { DndContext } from "@dnd-kit/core";

const DragAndDropContainer = () => {
const [items, setItems] = useState({
    A: ['A0', 'A1', 'A2'],
    B: ['B0', 'B1'],
    C: [],
    D: [],
  });

  
  return (
    <div className="w-full flex flex-row justify-center gap-2 bg-system-third-background rounded-lg">
      <DragDropProvider
       onDragOver={(event) => {
        setItems((items) => move(items, event));
      }}>
        {Object.entries(items).map(([column, items]) => (
            <Column key={column} id={column}>
            {items.map((id, index) => (
                <Item key={id} id={id} index={index} column={column} />
            ))}
            </Column>
        ))}        
      </DragDropProvider>
    </div>
  );
}

export default DragAndDropContainer;