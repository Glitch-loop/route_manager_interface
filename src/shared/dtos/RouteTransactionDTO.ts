import { PaymentMethodDTO } from "@/shared/dtos/PaymentMethodDTO";
import { PaymentSchemaDTO } from "@/shared/dtos/PaymentSchemaDTO";
import { RouteTransactionDescriptionDTO } from "@/shared/dtos/RouteTransactionDescriptionDTO";
import { TRANSACTION_STATUS_ENUM } from "@/shared/enums/routeStatusEnum";

export interface RouteTransactionDTO {
  id_route_transaction: string;
  cfdi: string | null;
  state: TRANSACTION_STATUS_ENUM;
  created_by: string;
  cash_received: number;
  id_invoice_concept: string | null;
  created_at: Date;
  latitude: string | null;
  longitude: string | null;
  id_work_day: string;
  id_location: string;
  id_client: string | null;
  payment_method: PaymentMethodDTO;
  payment_schema: PaymentSchemaDTO;
  transaction_description: RouteTransactionDescriptionDTO[];
}