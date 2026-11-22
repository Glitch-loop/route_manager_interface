import React, { useState, useEffect, Dispatch } from 'react';
import { Dayjs } from "dayjs";
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';

// DTOs
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// Types
import { RouteDayEffect } from "@/app/route_administration/types/types";

// UI components
import { Button } from "@mui/material";
import {Column} from '@/app/route_administration/components/SortableContainer/Column';
import { Item } from '@/app/route_administration/components/SortableContainer/Item';
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";

// Utils
import { generateUUIDv4 } from "@/utils/generalUtils";
import { getNameOfRouteDay, getRouteDayFromRoutesList } from "@/shared/utils/routes/utils";
import { SortableLocation } from '@/app/route_administration/components/SortableContainer/Types/types';
import { RouteDayEffectAction } from '@/app/route_administration/types/routeDayEffectActions';

type RouteDayContainerProps = {
  selectedRouteDays:Map<string, RouteDayDTO>; // id route day, compact information of location for sorting.
  locationMap: Map<string, LocationDTO>; // id location, locationDTO.
  routes: RouteDTO[];
  routeDayEffects: Map<string, RouteDayEffect>,
  routeDayEffectDispatcher: Dispatch<RouteDayEffectAction>,
  onChangeRouteDayOrder: (newOrder: Map<string, RouteDayDTO>) => void;
};

export default function ColumnsContainer({
  selectedRouteDays,
  locationMap,
  routes,
  routeDayEffects,
  routeDayEffectDispatcher,
  onChangeRouteDayOrder,
  // onSaveRouteModification,
}: RouteDayContainerProps) {
  // --Use states--
  // Related to route organization
  const [routeDaysInModification, setRouteDaysInModification] = useState<Record<string, SortableLocation[]>>({});

  // Related to route transactions
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);


  // --Use effects
  // Synchronize the state from page
  useEffect(() => {
    setRouteDaysInModification((prev) => {
      const newRouteDay:Record<string, SortableLocation[]> = {};
      selectedRouteDays.values()
        .forEach((routeDay:RouteDayDTO) => {
          const {id_route_day, locations} = routeDay;
          if (prev[id_route_day] === undefined) {
            return newRouteDay[id_route_day] = locations.map((loc:RouteDayLocationDTO) => {
              return {
                ...loc,
                id: loc.id_route_day_store,
              }
            });
          }
      });
      return {...newRouteDay};
    })
  }, [selectedRouteDays]);

  // Synchronize internal state with page
  useEffect(() => {
    const newOrderOfSelectedRouteDays = new Map<string, RouteDayDTO>(selectedRouteDays);

    Object.entries(routeDaysInModification).forEach(([idRouteDay, routeDayLocations]) => {
      if(newOrderOfSelectedRouteDays.has(idRouteDay)) {
        const currentRouteDay: RouteDayDTO = newOrderOfSelectedRouteDays.get(idRouteDay)!;
        newOrderOfSelectedRouteDays.set(
          idRouteDay, 
          {
            ...currentRouteDay,
            locations: routeDayLocations as RouteDayLocationDTO[]
          }
        );
      }
    });
    onChangeRouteDayOrder(newOrderOfSelectedRouteDays);
  }, [setRouteDaysInModification]);


  // --Use handlers--
  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDateSelected(start);
    setEndDateSelected(end);
  };

  const handleApplyDateRange = (
    startDate: Dayjs | null,
    endDate: Dayjs | null,
  ) => {
    if (startDate && endDate) {
      // const allStoreIds = Object.values(routeDaysInModification)
      //   .flat()
      //   .map((store) => store.id_location);
      // onRequireRouteTransactions(
      //   startDate.toDate(),
      //   endDate.toDate(),
      //   allStoreIds,
      // );
    }
  };

    /**
   * Save route modification for a specific route day.
   */
  const handleSaveRouteModification = async (idRouteDay: string) => {
    const storesInRouteDay = routeDaysInModification[idRouteDay];
    // return
    if (!storesInRouteDay) return;

    const updatedStoresInRouteDay:SortableLocation[] = storesInRouteDay.map((store, index) => ({
      ...store,
      position_in_route: index,
    }));
    console.log("updatedStoresInRouteDay: ", updatedStoresInRouteDay)

    updatedStoresInRouteDay.forEach((store) => {
      console.log(locationMap.get(store.id_location)?.location_name)
    })
    // await onSaveRouteModification(idRouteDay, updatedStoresInRouteDay);
  };


  return (
  <div className="w-full h-full bg-system-secondary-background flex flex-row p-2">
    <div className="flex basis-1/5 items-center flex-col shrink-0  bg-system-third-background p-1 rounded-lg gap-2">
      <h2 className="text-lg md:text-xl font-bold mb-4">
        Administración de días en ruta
      </h2>
      <RangeDateSelection
        initialDirection="before"
        initialSelectedRange="0week"
        onRangeChange={handleDateRangeChange}
      />
      <div className="flex flex-col justify-center items-center w-full gap-2">
        <span className="text-base font-bold">Fechas seleccionadas:</span>
        <div className="flex flex-row justify-center">
          <span>
            {startDateSelected
              ? startDateSelected.format("DD/MM/YYYY")
              : "N/A"}
          </span>
          <span className="mx-2">-</span>
          <span>
            {endDateSelected ? endDateSelected.format("DD/MM/YYYY") : "N/A"}
          </span>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() =>
            handleApplyDateRange(startDateSelected, endDateSelected)
          }
        >
          Aplicar fechas
        </Button>
      </div>
    </div>
      <DragDropProvider
        onDragOver={(event) => {
          setRouteDaysInModification((items:Record<string, SortableLocation[]>) => 
            { return {...move(items, event)}; }
          );
        }}
        // onDragEnd={(event) => {
        //   console.log("Hello")
        //   const {source, target} = event.operation;
        //   console.log(source)
        //   if (event.canceled || source.type !== 'column') return;

        //   setColumnOrder((columns) => {
        //     const newColumns = move(columns, event)
        //     console.log("These are the columns after reordering: ", newColumns)
        //     return newColumns; 
        //   });
        // }}
      >
      <div className="Root overflow-auto ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">        
        {
          Object.entries(routeDaysInModification).map(([column, items]) => (
            <Column 
              key={column} 
              id={column} 
              routeName={ getNameOfRouteDay(routes, column) }
              onSaveRouteModification={handleSaveRouteModification}
              routeDayEffectsMap={routeDayEffects}
              routeDayEffectDispatcher={routeDayEffectDispatcher}
              >
            <div className="overflow-auto">
              {items.map((sortableItem, index) => {
                const { id_location } = sortableItem;
                const locationData = locationMap.get(id_location);
                return (
                  <Item 
                    key={sortableItem.id} 
                    id={sortableItem.id} 
                    index={index} 
                    column={column} 
                    locationData={locationData}
                  />
                )
              })}
            </div>
          </Column>
          ))
        }
      </div>
    </DragDropProvider>
  </div>
  );
}