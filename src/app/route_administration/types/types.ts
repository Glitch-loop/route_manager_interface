import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";

export type RouteDayEffect = {
    showStores: boolean;
    assignedColor: string;
}

// Extended type that adds 'id' property for dnd-kit compatibility
export type DraggableRouteDayStore = RouteDayStoreDTO & { id: string };

export type RangeOption = { label: string; value: number };