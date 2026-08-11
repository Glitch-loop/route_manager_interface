// Libraries
import { useEffect, useState, useCallback, useMemo } from "react";

// DTOs
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";

// Actions
import { listStores } from "@/shared/actions/locationActions";
import { listRouteTransactionsByStoreWithinDateRange } from "@/shared/actions/transactionActions";

export function useRouteLocation() {
  const [stores, setStores] = useState<LocationDTO[]>([]);
  const [mapRouteTransactionByStore, setMapRouteTransactionByStore] = useState<Map<string, RouteTransactionDTO[]>>(new Map());
  
  // 1. Expose async feedback states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2. DERIVED STATE: Use useMemo instead of a separate useState for mapStores
  const mapStores = useMemo(() => {
    const storeMap = new Map<string, LocationDTO>();
    stores.forEach((store) => storeMap.set(store.id_location, store));
    return storeMap;
  }, [stores]);

  // 3. INITIAL FETCH: Encapsulate mount-only fetching inside useEffect
  useEffect(() => {
    let isMounted = true;

    async function initStores() {
      setIsLoading(true);
      try {
        const allStores = await listStores();
        if (isMounted) setStores(allStores);
      } catch {
        if (isMounted) setError("Error fetching stores");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initStores();

    return () => {
      isMounted = false; // Prevents state updates if component unmounts mid-request
    };
  }, []);

  // 4. EXPOSED HANDLER: Wrap with useCallback
  const fetchRouteTransactions = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      idStores: string[]
    ): Promise<void> => {
      const uniqueStoreIds = [...new Set(idStores)].filter(Boolean);
      if (uniqueStoreIds.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const transactionsMap = await listRouteTransactionsByStoreWithinDateRange(
          uniqueStoreIds,
          startDate,
          endDate
        );

        setMapRouteTransactionByStore((previousMap) => {
          const nextMap = new Map(previousMap);
          transactionsMap.forEach((transactions, storeId) => {
            nextMap.set(storeId, transactions);
          });
          return nextMap;
        });
      } catch (err: unknown) {
        console.error("Error retrieving route transactions: ", err);
        setError("Error retrieving route transactions");
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependency array ensures reference stability
  );

  // 5. RETURN CONTRACT: Expose state, derived maps, and actions
  return {
    stores,
    mapStores,
    mapRouteTransactionByStore,
    isLoading,
    error,
    fetchRouteTransactions,
  };
}