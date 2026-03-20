import React from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';

export function Column({children, id}) {
  const {ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <div className="Column my-2 rounded-lg flex flex-col w-36 gap-2 bg-system-secondary-background p-4" ref={ref}>
      {children}
    </div>
  );
}