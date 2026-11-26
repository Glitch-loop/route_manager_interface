import React from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import NumericValueCard from '@/shared/components/Cards/NumericValueCard/NumericValueCard';
import { LocationDTO } from '@/shared/dtos/LocationDTO';
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { capitalizeFirstLetterOfEachWord } from '@/utils/generalUtils';
import { RemoveCircleOutline } from '@mui/icons-material';

type ItemType = {
    id: string,
    index: number,
    column: string
    locationData: LocationDTO|undefined,
    onSelectItem?: (routeDayId: string, routeDayLocationId: string) => void
    isDraggable?: boolean,
    isSelectable?: boolean,
    isSelected?: boolean,
}

export function Item({
  id, // Route day location id as id of the component.
  index, 
  column, // Route day id as id to determine to which column the component belongs.
  locationData,
  onSelectItem = () => null,
  isDraggable = true,
  isSelectable = false,
  isSelected = false,
}: ItemType) {
  const {ref, isDragging} = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: column
  });

  // Definitions
  const storeName: string = `${index + 1} - ` + 
    (locationData ? locationData.location_name : "No disponible");
  
  const storeAddress: string = locationData ? getAddressOfStore(locationData) : "Not found";
  
  // Handlers
  const handleSelect = (id_route_day:string, id_route_day_store: string) => {
    onSelectItem(id_route_day, id_route_day_store);
  };

  return (
    <div 
      onClick={() => {
        handleSelect(column, id);
      }}
      
      className="Item relative my-2 p-2" 
      ref={!isDraggable ? null : ref} 
      data-dragging={isDragging}>
      { isSelected &&
        <div className="absolute right-3 top-3 bg-red-600 w-6 h-6 text-slate-200 rounded-full flex items-center justify-center">
          <RemoveCircleOutline fontSize="small" />
        </div>
      }
      <NumericValueCard 
        cardName={capitalizeFirstLetterOfEachWord(storeName)}
        cardDetails={capitalizeFirstLetterOfEachWord(storeAddress)}
        numericValue={"$$$"}
      />
    </div>
  );
}