import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";

export type SortableLocationType = RouteDayLocationDTO & { id: string };

export type RouteDayActionStateType = {
  isEditable: boolean;
  isDeletedMode: boolean;
}