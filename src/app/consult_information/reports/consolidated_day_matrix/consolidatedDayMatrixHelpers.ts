import dayjs from "dayjs";
import "dayjs/locale/es";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";
import { ProductDTO } from "@/shared/dtos/ProductDTO";
import { DAY_OPERATIONS } from "@/core/enums/DayOperations";

dayjs.locale("es");

export interface DateHeaderInfo {
  rawDate: string; // YYYY-MM-DD
  formattedDate: string; // DD/MM/YY
}

export interface DayGroupHeader {
  dayName: string;
  dayOrder: number;
  dates: DateHeaderInfo[];
}

export interface ProductCellData {
  dnText: string;
  dpText: string;
  quantityStr: string | number;
}

export interface ProductDayGroupData {
  cells: ProductCellData[];
  totalDnText: string;
  totalDpText: string;
  totalSumQtyText: string; // Plain sum string
  totalAvgQtyText: string; // Plain avg string
}

export interface ProductMatrixRow {
  idProduct: string;
  productName: string;
  dayGroups: Record<number, ProductDayGroupData>;
}

export interface ProcessedDayMatrixData {
  createdDate: string;
  operationTitle: string;
  dateRangeText: string;
  dayHeaders: DayGroupHeader[];
  products: ProductMatrixRow[];
}

const SPANISH_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const OPERATION_LABELS: Record<string, string> = {
  [DAY_OPERATIONS.sales]: "Venta",
  [DAY_OPERATIONS.product_devolution]: "Devolución de Producto",
  [DAY_OPERATIONS.product_reposition]: "Reposición de Producto",
};

export function processConsolidatedDayMatrixData(
  transactions: RouteTransactionDTO[],
  productsMap: Map<string, ProductDTO>,
  operationType: DAY_OPERATIONS,
  fromDate: Date | string,
  toDate: Date | string
): ProcessedDayMatrixData {
  const createdDate = dayjs().format("DD/MM/YY HH:mm");
  const operationTitle = OPERATION_LABELS[operationType] ?? "Operaciones";
  const dateRangeText = `Consolidado de rutas del ${dayjs(fromDate).format("DD/MM/YY")} al ${dayjs(toDate).format("DD/MM/YY")}`;

  const qtyByDateAndProduct: Record<string, Record<string, number>> = {};
  const activeDatesSet = new Set<string>();

  transactions.forEach((tx) => {
    const txDateStr = dayjs(tx.created_at).format("YYYY-MM-DD");

    tx.transaction_description?.forEach((desc) => {
      if (desc.id_transaction_operation_type === operationType && desc.id_product) {
        activeDatesSet.add(txDateStr);
        if (!qtyByDateAndProduct[txDateStr]) {
          qtyByDateAndProduct[txDateStr] = {};
        }
        const currentQty = qtyByDateAndProduct[txDateStr][desc.id_product] ?? 0;
        qtyByDateAndProduct[txDateStr][desc.id_product] = currentQty + (desc.quantity ?? 0);
      }
    });
  });

  const dayGroupsMap: Record<number, DateHeaderInfo[]> = {};

  Array.from(activeDatesSet)
    .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
    .forEach((rawDate) => {
      const d = dayjs(rawDate);
      const dayOrder = d.day() === 0 ? 7 : d.day();

      if (!dayGroupsMap[dayOrder]) {
        dayGroupsMap[dayOrder] = [];
      }
      dayGroupsMap[dayOrder].push({
        rawDate,
        formattedDate: d.format("DD/MM/YY"),
      });
    });

  const dayHeaders: DayGroupHeader[] = Object.keys(dayGroupsMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((dayOrder) => ({
      dayName: SPANISH_DAYS[dayOrder - 1],
      dayOrder,
      dates: dayGroupsMap[dayOrder],
    }));

  const sortedProducts = Array.from(productsMap.values()).sort(
    (a, b) => (a.order_to_show ?? 0) - (b.order_to_show ?? 0)
  );

  const products: ProductMatrixRow[] = sortedProducts.map((prod) => {
    const dayGroups: Record<number, ProductDayGroupData> = {};

    dayHeaders.forEach((group) => {
      const dateCells: ProductCellData[] = [];
      const dnList: number[] = [];
      const dpList: number[] = [];
      const qtyList: number[] = [];

      const baseDate = group.dates[0];
      const baseQty = baseDate
        ? (qtyByDateAndProduct[baseDate.rawDate]?.[prod.id_product] ?? 0)
        : 0;

      group.dates.forEach((dateInfo, index) => {
        const qty = qtyByDateAndProduct[dateInfo.rawDate]?.[prod.id_product] ?? 0;
        qtyList.push(qty);

        if (index === 0) {
          dateCells.push({
            dnText: "",
            dpText: "",
            quantityStr: qty > 0 ? qty : "",
          });
        } else {
          const dn = qty - baseQty;
          const dp =
            baseQty > 0
              ? Math.ceil((dn / baseQty) * 100)
              : qty > 0
              ? 100
              : 0;

          dnList.push(dn);
          dpList.push(dp);

          dateCells.push({
            dnText: `${dn}`,
            dpText: `${dp}%`,
            quantityStr: qty > 0 ? qty : "",
          });
        }
      });

      let totalDnText = "";
      let totalDpText = "";
      if (dnList.length > 0) {
        const avgDn = Math.ceil(
          dnList.reduce((acc, v) => acc + v, 0) / dnList.length
        );
        const avgDp = Math.ceil(
          dpList.reduce((acc, v) => acc + v, 0) / dpList.length
        );
        totalDnText = `${avgDn}`;
        totalDpText = `${avgDp}%`;
      }

      const sumQty = qtyList.reduce((acc, v) => acc + v, 0);
      const avgQty = qtyList.length > 0 ? Math.ceil(sumQty / qtyList.length) : 0;

      dayGroups[group.dayOrder] = {
        cells: dateCells,
        totalDnText,
        totalDpText,
        totalSumQtyText: sumQty > 0 ? `${sumQty}` : "",
        totalAvgQtyText: qtyList.length > 0 ? `${avgQty}` : "",
      };
    });

    return {
      idProduct: prod.id_product,
      productName: prod.product_name,
      dayGroups,
    };
  });

  return {
    createdDate,
    operationTitle,
    dateRangeText,
    dayHeaders,
    products,
  };
}