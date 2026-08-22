import { ItemsPickerType } from "@/shared/components/ItemsPicker/types/types";
import { SellingGoalType } from "@/shared/components/SellingGoal/types/types";

export type RouteDayEffect = {
  showStores: boolean;
  assignedColor: string;
  selectedLocation?: string;
};

export type ApplyEffect = "showStore" | "assignColor";

export type routeDayFiltersType = "sellingGoal" | "pickItemsFilter";

export type RouteDayFilters = {
  sellingGoal: SellingGoalType | null;
  pickerProduct: ItemsPickerType | null;
}