import { useState } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { DragDropProvider } from '@dnd-kit/react';


function Sortable({id, index}) {
  const {ref} = useSortable({id, index});

  return (
    <li ref={ref} className="item bg-red-300 p-2">Item {id}</li>
  );
}

function Droppable({id, children}) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{width: 300, height: 300}}>
      {children}
    </div>
  );
}

function Draggable() {
  const {ref} = useDraggable({
    id: 'draggable',
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}

export default function SortableList() {
  const [isDropped, setIsDropped] = useState(false);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const {target} = event.operation;
        setIsDropped(target?.id === 'droppable');
      }}
    >
      {!isDropped && <Draggable />}

      <Droppable id="droppable">
        {isDropped && <Draggable />}
      </Droppable>
    </DragDropProvider>
  ); 
}