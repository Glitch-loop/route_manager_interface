import React from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import NumericValueCard from '@/shared/components/Cards/NumericValueCard/NumericValueCard';
import { LocationDTO } from '@/shared/dtos/LocationDTO';
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord } from '@/utils/generalUtils';

type ItemType = {
    id: string,
    index: number,
    column: string
    locationData: LocationDTO|undefined
}

export function Item({id, index, column, locationData}: ItemType) {
  const {ref, isDragging} = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column
  });

  const storeName: string = `${index + 1} - ` + 
    (locationData ? locationData.location_name : "No disponible");
  
  const storeAddress: string = locationData ? getAddressOfStore(locationData) : "Not found";

  return (
    // <button className="Item" ref={ref} data-dragging={isDragging}>
    //   {id}
    // </button>
    <div className="Item my-2" ref={ref} data-dragging={isDragging}>
      <NumericValueCard 
        cardName={capitalizeFirstLetterOfEachWord(storeName)}
        cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
        numericValue={"$$$"}
      />
    </div>
  );
}