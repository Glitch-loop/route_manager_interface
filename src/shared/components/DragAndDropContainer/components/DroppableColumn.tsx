import React from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';

export default function DroppableColumn({children, id}) {
  const {ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <div className="Column my-2 rounded-lg h-full flex flex-col w-full gap-1 p-2" ref={ref}>
      {children}
    </div>
  );
}