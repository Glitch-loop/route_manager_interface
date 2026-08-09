export type SellingGoalVisibilityType = "show_all" | "show_only_meet" | "show_only_not_meet";

export type SellingGoalType = {
  target: number | null;
  show: SellingGoalVisibilityType;
}