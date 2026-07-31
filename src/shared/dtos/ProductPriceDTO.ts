export interface ProductPriceDTO {
  id_product_price: string;
  price: number;
  created_at: Date;
  id_client?: string;
  id_location?: string;
  id_route_day?: string;
}
