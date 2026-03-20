import React from 'react';
import {useSortable} from '@dnd-kit/react/sortable';

export default function DraggableItem({children, id, index, column}) {
  const {ref, isDragging} = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column
  });

  return (
    <button className="bg-blue-500 text-white p-2 rounded w-90" ref={ref} data-dragging={isDragging}>
      {children}
    </button>
  );
}