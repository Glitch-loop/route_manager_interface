// Libraries
import { useEffect, useState, useCallback, useMemo } from "react";


import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteDayLocationDTO } from "@/shared/dtos/RouteDayLocationDTO";
import { listRoutes } from "@/shared/actions/routeActions";

export function useRoute() {
  const [routes, setRoutes] = useState<RouteDTO[]>([]); // Source of truth for route days.

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const routesMap = useMemo(() => {
    const routesMap = new Map<string, RouteDTO>();
    routes.forEach((route) => routesMap.set(route.id_route, route));
    return routesMap;
  }, [routes]);

  useEffect(() => {
    let isMounted = true;

    async function initRoutes() {
      setIsLoading(true);
      try {
        const allStores = await listRoutes();
        if (isMounted) setRoutes(allStores);
      } catch {
        if (isMounted) setError("Error fetching stores");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }    

    initRoutes();

    return () => {
      isMounted = false; // Prevents state updates if component unmounts mid-request
    };
  }, []);


  return {
    routes,
    routesMap,
    isLoading,
    error
  }

}
