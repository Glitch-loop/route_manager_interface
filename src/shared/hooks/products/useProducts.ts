// Libraries
import { useEffect, useState, useCallback, useMemo } from "react";

// DTOs
import { ProductDTO } from "@/shared/dtos/ProductDTO";

// Actions
import { retrieveAllProducts } from "@/shared/actions/productActions";

export function useProducts() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const productsMap = useMemo(() => {
    const map = new Map<string, ProductDTO>();

    products.forEach((product) => {
      map.set(product.id_product, product);
    });

    return map;
  }, [products]);

  useEffect(() => {
    let isMounted = true;

    async function initProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const allProducts: ProductDTO[] = await retrieveAllProducts(true);

        if (isMounted) {
          setProducts(allProducts);
        }
      } catch {
        if (isMounted) {
          setError("Error fetching products");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProducts = useCallback(async (status_product = true): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const allProducts: ProductDTO[] = await retrieveAllProducts(status_product);
      setProducts(allProducts);
    } catch {
      setError("Error fetching products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    productsMap,
    isLoading,
    error,
    fetchProducts,
  };
}

export function useProduct() {
  return useProducts();
}