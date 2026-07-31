import { ProductPriceDTO } from "@/shared/dtos/ProductPriceDTO";

export interface ProductDTO {
  id_product: string;
  product_name: string;
  cost: number;
  product_status: number;
  quantity_presentation: number;
  order_to_show: number;
  id_measurement_unit: string;
  product_price: ProductPriceDTO[];
  barcode?: string;
}
