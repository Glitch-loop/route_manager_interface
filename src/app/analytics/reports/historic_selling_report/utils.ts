import dayjs from "dayjs";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";
import { ProductDTO } from "@/shared/dtos/ProductDTO";

export interface ProductColumnHeader {
  id_product: string;
  label: string;
}

export interface TransactionRowSummary {
  id_route_transaction: string;
  dateStr: string;
  productQuantities: Record<string, string | number>;
  totalAmount: number;
}

export interface StoreDetailedReportSummary {
  position: number;
  storeName: string;
  address: string;
  rows: TransactionRowSummary[];
}

export interface ProcessedDetailedReportData {
  createdDate: string;
  routeName: string;
  dayName: string;
  productList: ProductColumnHeader[];
  stores: StoreDetailedReportSummary[];
}

export function processDetailedReportData(
  routeDay: RouteDayDTO,
  mapStores: Map<string, LocationDTO>,
  mapRouteTransactionByStore: Map<string, RouteTransactionDTO[]>,
  routesMap: Map<string, RouteDTO>,
  productsMap: Map<string, ProductDTO>
): ProcessedDetailedReportData {
  const route = routesMap.get(routeDay.id_route);
  const routeName = route?.route_name ?? "Ruta Desconocida";
  const dayName = routeDay.id_day ?? "";
  const createdDate = dayjs().format("DD/MM/YY HH:mm");

  // 1. Dynamic product headers
  const productList: ProductColumnHeader[] = Array.from(productsMap.values())
    .sort((a, b) => ((a as any).order_to_show ?? 0) - ((b as any).order_to_show ?? 0))
    .map((product) => ({
      id_product: product.id_product,
      label: (product as any).product_name ?? (product as any).name ?? "",
    }));

  // 2. Sort locations
  const sortedLocations = [...routeDay.locations].sort(
    (a, b) => a.position_in_route - b.position_in_route
  );

  const stores: StoreDetailedReportSummary[] = sortedLocations.map((loc) => {
    const storeInfo = mapStores.get(loc.id_location);
    const storeName = storeInfo?.location_name ?? "Tienda Desconocida";
    const address = storeInfo
      ? `${storeInfo.street || ""} ${storeInfo.ext_number || ""}, ${storeInfo.colony || ""}`.trim()
      : "Sin dirección";

    const rawTransactions = mapRouteTransactionByStore.get(loc.id_location) ?? [];

    // Deduplicate transactions by unique ID
    const uniqueTxMap = new Map<string, RouteTransactionDTO>();
    rawTransactions.forEach((tx) => {
      if (tx && tx.id_route_transaction) {
        uniqueTxMap.set(tx.id_route_transaction, tx);
      }
    });
    const transactions = Array.from(uniqueTxMap.values());

    const rows: TransactionRowSummary[] = transactions.map((tx) => {
      // Formatted with HH:mm timestamp
      const dateStr = dayjs(tx.created_at).format("DD/MM/YY HH:mm");
      const totalAmount = tx.cash_received ?? 0;

      const rawQuantities: Record<string, number> = {};

      tx.transaction_description?.forEach((desc: any) => {
        const productId = desc.id_product;
        const qty = desc.quantity ?? desc.qty ?? desc.units ?? 0;
        if (productId) {
          rawQuantities[productId] = (rawQuantities[productId] ?? 0) + Number(qty);
        }
      });

      const productQuantities: Record<string, string | number> = {};
      productList.forEach((prod) => {
        const qty = rawQuantities[prod.id_product];
        productQuantities[prod.id_product] = qty && qty > 0 ? qty : "";
      });

      return {
        id_route_transaction: tx.id_route_transaction,
        dateStr,
        productQuantities,
        totalAmount,
      };
    });

    return {
      position: loc.position_in_route,
      storeName,
      address,
      rows,
    };
  });

  return {
    createdDate,
    routeName,
    dayName,
    productList,
    stores,
  };
}