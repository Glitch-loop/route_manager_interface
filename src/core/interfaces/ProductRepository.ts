import { Product } from '@/core/entities/Product';

export abstract class ProductRepository {
  abstract insertProduct(product: Product): Promise<void>;
  abstract updateProduct(product: Product): Promise<void>;
  abstract retrieveAllProducts(status_product: boolean): Promise<Product[]>;
  abstract deleteProduct(product: Product): Promise<void>;
}