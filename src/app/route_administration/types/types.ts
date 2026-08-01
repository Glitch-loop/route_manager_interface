import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";

export type RouteDayEffect = {
  showStores: boolean;
  assignedColor: string;
};

// Extended type that adds 'id' property for dnd-kit compatibility
export type DraggableRouteDayStore = RouteDayLocationDTO & { id: string };

export type RangeOption = { label: string; value: number };

export type MarkerGroup =
  | "pivot-coord-search"
  | "store-found-by-coords"
  | "searchbar-hovered-coord"
  | "searchbar-searched-store";
