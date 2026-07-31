import { RawPaymentMethodApiResponse } from "@/shared/raw-api-responses/rawPaymentMethodApiResponse";
import { RawPaymentSchemaApiResponse } from "@/shared/raw-api-responses/rawPaymentSchemaApiResponse";
import { RawTransactionDescriptionApiResponse } from "@/shared/raw-api-responses/rawTransactionDescriptionApiResponse";

export interface RawTransactionApiResponse {
  id_transaction: string;
  cfdi: string | null;
  state: number;
  created_by: string;
  received_amount: number;
  id_invoice_concept: string | null;
  created_at: Date;
  latitude: string | null;
  longitude: string | null;
  id_location: string | null;
  id_client: string | null;
  id_work_day: string;
  payment_method: RawPaymentMethodApiResponse;
  payment_schema: RawPaymentSchemaApiResponse;
  transaction_descriptions: RawTransactionDescriptionApiResponse[];
}