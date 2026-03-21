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
    <div ref={ref} data-dragging={isDragging}>
      {children}
    </div>
  );
}