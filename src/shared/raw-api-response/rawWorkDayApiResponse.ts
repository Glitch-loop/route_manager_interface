import { RawWorkDayNoteApiResponse } from "@/shared/raw-api-response/rawWorkDayNoteApiResponse";

export interface RawWorkDayApiResponse {
  id_work_day: string;
  start_date: string;
  start_petty_cash: number;
  id_route_day: string;
  id_user: string;
  notes: RawWorkDayNoteApiResponse[];
  finish_date: string | null;
  final_petty_cash: number | null;
  id_payment_stub: string | null;
}