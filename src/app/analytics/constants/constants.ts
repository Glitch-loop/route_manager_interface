import { DateRangeGroup } from "../types/types";

// Consider the listed options must be unique
export const AMOUNT_OF_DAYS_RANGE_GROUPS: DateRangeGroup[] = [
    { label: "Semanal", amount_of_days: 7 },
    { label: "Quincenal", amount_of_days: 15 },
    { label: "Mensual", amount_of_days: 30 },
    { label: "Bimestral", amount_of_days: 60 },
    { label: "Trimestral", amount_of_days: 90 },
    { label: "Anual", amount_of_days: 365 },
];