import { RouteDTO } from '@/shared/dtos/RouteDTO';
import { RouteTransactionDTO } from '@/shared/dtos/RouteTransactionDTO';


export interface ProductDTO {
  id_product: string;
  product_name: string;
}

export interface WarehouseSupplyMatrixData {
  dayName: string;
  formattedDate: string;
  routes: { id_route: string; route_name: string }[];
  products: { id_product: string; product_name: string }[];
  /** matrix[id_product][id_route] = consolidated quantity (+10 buffer applied) */
  matrix: Record<string, Record<string, number>>;
}

export function consolidateWarehouseSupplyData(params: {
  transactions: RouteTransactionDTO[];
  productsMap: Map<string, ProductDTO> | Record<string, ProductDTO>;
  routes: RouteDTO[];
  date: Date | string;
  bufferQty?: number; // Defaults to +10
}): WarehouseSupplyMatrixData {
  const { transactions, productsMap, routes, date, bufferQty = 10 } = params;

  // 1. Build lookup map: id_route_day -> id_route
  const routeDayToRouteMap = new Map<string, string>();
  const activeRoutesMap = new Map<string, string>(); // id_route -> route_name

  for (const route of routes) {
    if (route.route_status === false) continue;
    activeRoutesMap.set(route.id_route, route.route_name);

    for (const routeDay of route.route_day || []) {
      routeDayToRouteMap.set(routeDay.id_route_day, route.id_route);
    }
  }

  // 2. Normalize Products Map
  const pEntries =
    productsMap instanceof Map
      ? Array.from(productsMap.entries())
      : Object.entries(productsMap);

  const productList = pEntries.map(([id, prod]) => ({
    id_product: id,
    product_name: prod.product_name || id,
  }));

  // 3. Initialize Raw Matrix Totals: matrix[id_product][id_route] = 0
  const rawTotals: Record<string, Record<string, number>> = {};
  for (const { id_product } of productList) {
    rawTotals[id_product] = {};
    activeRoutesMap.forEach((_, routeId) => {
      rawTotals[id_product][routeId] = 0;
    });
  }

  // 4. Aggregate transaction quantities by route
  for (const tx of transactions) {
    const parentRouteId = routeDayToRouteMap.get(tx.id_work_day);
    if (!parentRouteId) continue;

    const { transaction_description } = tx;
    for (const item of transaction_description || []) {
      if (
        rawTotals[item.id_product] &&
        rawTotals[item.id_product][parentRouteId] !== undefined
      ) {
        rawTotals[item.id_product][parentRouteId] += item.quantity;
      }
    }
  }

  // 5. Apply +10 Warehouse Buffer to totals
  const finalMatrix: Record<string, Record<string, number>> = {};
  for (const { id_product } of productList) {
    finalMatrix[id_product] = {};
    activeRoutesMap.forEach((_, routeId) => {
      const baseQty = rawTotals[id_product][routeId] || 0;
      // Add +10 buffer if product was sold/requested on the route
      finalMatrix[id_product][routeId] = baseQty > 0 ? baseQty + bufferQty : 0;
    });
  }

  // 6. Format Dates for Title & Subtitle
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayNameRaw = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayName = dayNameRaw.charAt(0).toUpperCase() + dayNameRaw.slice(1);
  const formattedDate = dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  const routeList = Array.from(activeRoutesMap.entries()).map(
    ([id_route, route_name]) => ({
      id_route,
      route_name,
    })
  );

  return {
    dayName,
    formattedDate,
    routes: routeList,
    products: productList,
    matrix: finalMatrix,
  };
}