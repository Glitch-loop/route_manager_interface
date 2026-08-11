// Types
import { ItemsPickerType, PickerItemType } from "@/shared/components/ItemsPicker/types/types";
import { SellingGoalType } from "@/shared/components/SellingGoal/types/types";


export type DateRangeGroup = {
    label: string;
    amount_of_days: number; // This represents the amount of days that the range group represent.
}

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

export type { PickerItemType };