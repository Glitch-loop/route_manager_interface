import dayjs from "dayjs";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";
import { ProductDTO } from "@/shared/dtos/ProductDTO";
import { RouteTransactionDescriptionDTO } from "@/shared/dtos/RouteTransactionDescriptionDTO";
import DAY_OPERATIONS from "@/core/enums/DayOperations";
import { capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";
import { DAYS } from "@/core/constants/Days";

export interface ProductColumnHeader {
  id_product: string;
  label: string;
}

export type TableRowItem =
  | {
      type: "transaction";
      id: string;
      dateStr: string;
      productQuantities: Record<string, string | number>;
      totalAmount: number;
    }
  | {
      type: "store_footer";
      id: string;
      clientText: string;
    };

export interface ProcessedConsolidatedData {
  createdDate: string;
  routeName: string;
  dayName: string;
  dateRangeText: string;
  productList: ProductColumnHeader[];
  tableRows: TableRowItem[];
}

export function processConsolidatedReportData(
  routeDay: RouteDayDTO,
  mapStores: Map<string, LocationDTO>,
  mapRouteTransactionByStore: Map<string, RouteTransactionDTO[]>,
  routesMap: Map<string, RouteDTO>,
  productsMap: Map<string, ProductDTO>,
  transactionOperationType: DAY_OPERATIONS,
): ProcessedConsolidatedData {
  const route = routesMap.get(routeDay.id_route);
  const routeName = capitalizeFirstLetterOfEachWord(route?.route_name) ?? "Ruta Desconocida";
  const dayName = capitalizeFirstLetterOfEachWord(DAYS[routeDay.id_day].day_name) ?? "";
  const createdDate = dayjs().format("DD/MM/YY HH:mm");

  // 1. Dynamic product headers
  const productList: ProductColumnHeader[] = Array.from(productsMap.values())
    .sort((a, b) => ((a as ProductDTO).order_to_show ?? 0) - ((b as ProductDTO).order_to_show ?? 0))
    .map((product) => ({
      id_product: product.id_product,
      label: (product as ProductDTO).product_name,
    }));

  let minDate: dayjs.Dayjs | null = null;
  let maxDate: dayjs.Dayjs | null = null;

  // 2. Sort locations by position in route
  const sortedLocations = [...routeDay.locations].sort(
    (a, b) => a.position_in_route - b.position_in_route
  );

  const tableRows: TableRowItem[] = [];

  sortedLocations.forEach((loc) => {
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

    // Sort transactions oldest first
    const transactions = Array.from(uniqueTxMap.values()).sort(
      (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()
    );

    // Add transaction rows
    transactions.forEach((tx: RouteTransactionDTO) => {
      const { transaction_description } = tx;

      if (transaction_description.find((desc) =>  desc.id_transaction_operation_type === transactionOperationType)) {        
        const txDate = dayjs(tx.created_at);
        if (!minDate || txDate.isBefore(minDate)) minDate = txDate;
        if (!maxDate || txDate.isAfter(maxDate)) maxDate = txDate;
  
        const dateStr = txDate.format("DD/MM/YY HH:mm");
        let totalAmount = 0;
  
        const rawQuantities: Record<string, number> = {};
        transaction_description.forEach((desc: RouteTransactionDescriptionDTO) => {
          if (transactionOperationType === desc.id_transaction_operation_type) {
            const productId = desc.id_product;
            const qty = desc.quantity;
            totalAmount += qty * desc.price_at_moment;
            if (productId) {
              rawQuantities[productId] = (rawQuantities[productId] ?? 0) + Number(qty);
            }
          }
        });
  
        const productQuantities: Record<string, string | number> = {};
        productList.forEach((prod) => {
          const qty = rawQuantities[prod.id_product];
          productQuantities[prod.id_product] = qty && qty > 0 ? qty : "";
        });
  
        tableRows.push({
          type: "transaction",
          id: tx.id_route_transaction,
          dateStr,
          productQuantities,
          totalAmount,
        });
      }

    });

    // Add store details row directly after its transactions
    tableRows.push({
      type: "store_footer",
      id: `store-${loc.id_location}`,
      clientText: `${loc.position_in_route} - ${storeName} (${address})`,
    });
  });

  const dateRangeText =
    minDate === null || maxDate === null
      ? "Sin transacciones"
      : `Del ${minDate.format("DD/MM/YY")} al ${maxDate.format("DD/MM/YY")}`;

  return {
    createdDate,
    routeName,
    dayName,
    dateRangeText,
    productList,
    tableRows,
  };
}
