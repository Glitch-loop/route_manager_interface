export type ItemsPickerVisibilityType = "show_only_meet" | "show_only_not_meet";

export type ItemsPickerType = {
  selectedItems: string[];
  show: ItemsPickerVisibilityType;
}

export type PickerItemType = {
  id: string;
  itemName: string;
}