import { WorkDayNoteDTO } from "@/shared/dtos/WorkDayNoteDTO";

export interface WorkDayInformationDTO {
    id_work_day: string;
    start_date: string;
    start_petty_cash: number;
    id_route_day: string;
    id_user: string;
    notes: WorkDayNoteDTO[];
    finish_date: string | null;
    final_petty_cash: number | null;
    id_payment_stub: string | null;
}