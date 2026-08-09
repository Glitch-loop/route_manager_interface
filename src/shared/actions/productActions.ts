'use server'

// DTOs
import { ProductDTO } from '@/shared/dtos/ProductDTO';

// Raw API Responses
import { RawProductApiResponse } from '@/shared/raw-api-responses/rawProductApiResponse';

// Mapper
import { rawApiResponseToDTOMapper } from '@/shared/mappers/rawApiResponseToDTOMapper';

// DataSources
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

interface PaginatedProductsResponseInterface {
  items?: RawProductApiResponse[];
  data?: RawProductApiResponse[];
  collection?: RawProductApiResponse[];
  products?: RawProductApiResponse[];
}

export async function  insertProduct(): Promise<void> {
  // Note (06-18-26): Vendor's app must not perform this operation.
  return;
}

export async function updateProduct(): Promise<void> {
  // Note (06-18-26): Vendor's app must not perform this operation.
  return;
}

export async function retrieveAllProducts(status_product = true): Promise<ProductDTO[]> {
  try {
    const allProducts: RawProductApiResponse[] = await recursiveListProducts(undefined);
    /*
      Note (06-25-26):

      Backend doesn't provide a param to list only active ones, so this repo will filter 
      the products to let only active or inactive ones.

      Active product: product_status = 1
    */
    
    const products: ProductDTO[] = allProducts
      .filter((product) => (status_product ? product.product_status === 1 : product.product_status === 0));

    return products.map((product) => rawApiResponseToDTOMapper.toDTO(product));
  } catch (error) {
    throw new Error('Error fetching products: ' + error);
  }
}

export async function deleteProduct(): Promise<void> {
  // Note (06-18-26): Vendor's app must not perform this operation.
  return;
}

export async function recursiveListProducts(next_item: string | undefined): Promise<RawProductApiResponse[]> {
  const allProducts: RawProductApiResponse[] = [];
  let nextItem: string | undefined = next_item;

  try {
    do {
      const urlToRequest = nextItem 
        ? `/products?limit=100&next_item=${nextItem}`
        : `/products?limit=100`;

      const response = await apiClient.get<RawProductApiResponse[]>(urlToRequest);

      // Accumulate items from the current page
      if (response.data && response.data.length > 0) {
        allProducts.push(...response.data);
      }

      // Check if another page exists
      if (!response.meta || !response.meta.has_next_page) {
        break;
      }

      nextItem = response.meta.next_item;

    } while (nextItem);

    return allProducts;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list products: ${message}`);
  }
}
