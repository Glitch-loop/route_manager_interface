import { RawProductPriceApiResponse } from "@/shared/raw-api-responses/rawProductPriceApiResponse";

export interface RawProductApiResponse {
  id_product: string;
  product_name: string;
  cost: number;
  product_status: number;
  quantity_presentation: number;
  order_to_show: number;
  id_measurement_unit: string;
  product_price: RawProductPriceApiResponse[];
  barcode?: string;
}
