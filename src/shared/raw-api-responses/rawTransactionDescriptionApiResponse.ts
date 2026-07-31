export interface RawTransactionDescriptionApiResponse {
  id_transaction_description: string;
  price_at_moment: number;
  cost_at_moment: number;
  quantity: number;
  created_at: Date;
  id_transaction: string;
  id_transaction_operation_type: string;
  id_product: string;
}