import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ProcessedDetailedReportData } from "@/app/analytics/reports/historic_selling_report/utils";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#1f2937",
  },
  headerContainer: {
    marginBottom: 12,
  },
  createdDateText: {
    textAlign: "right",
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  titleCenter: {
    textAlign: "center",
  },
  mainTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  storeBlock: {
    marginBottom: 12,
  },
  storeHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  storeAddress: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 16,
    alignItems: "center",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    fontFamily: "Helvetica-Bold",
    height: 85,
    alignItems: "center",
  },
  colFechaHeader: {
    width: "14%",
    paddingLeft: 4,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },
  colTotalHeader: {
    width: "10%",
    textAlign: "right",
    paddingRight: 4,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },
  productHeaderCell: {
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  verticalText: {
    transform: "rotate(-90deg)",
    transformOrigin: "center center",
    width: 75,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "left",
  },
  colFecha: {
    width: "14%",
    textAlign: "left",
    paddingLeft: 4,
    fontSize: 7.5,
  },
  colTotal: {
    width: "10%",
    textAlign: "right",
    paddingRight: 4,
    fontSize: 7.5,
  },
  productColData: {
    textAlign: "center",
    fontSize: 8,
  },
});

interface Props {
  data: ProcessedDetailedReportData;
}

export const DetailedRouteDayPDFDocument: React.FC<Props> = ({ data }) => {
  const productCount = data.productList.length;
  // 76% width distributed across dynamic products (14% Fecha + 10% Total = 24%)
  const productColWidth = productCount > 0 ? `${76 / productCount}%` : "76%";

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* Document Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.createdDateText}>{data.createdDate}</Text>
          <View style={styles.titleCenter}>
            <Text style={styles.mainTitle}>Reporte Detallado de Ventas</Text>
            <Text style={styles.subTitle}>
              {data.routeName} - {data.dayName}
            </Text>
          </View>
        </View>

        {/* Store Blocks: wrap={false} directly on JSX element forces unbroken tables */}
        {data.stores.map((store, index) => (
          <View key={index} style={styles.storeBlock} wrap={false}>
            <Text style={styles.storeHeader}>
              {store.position} - {store.storeName}
            </Text>
            <Text style={styles.storeAddress}>{store.address}</Text>

            <View style={styles.table}>
              {/* Header Row */}
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={styles.colFechaHeader}>Fecha</Text>

                {data.productList.map((prod) => (
                  <View
                    key={prod.id_product}
                    style={[styles.productHeaderCell, { width: productColWidth }]}
                  >
                    <Text
                      style={styles.verticalText}
                      maxLines={1}
                      textOverflow="ellipsis"
                    >
                      {prod.label}
                    </Text>
                  </View>
                ))}

                <Text style={styles.colTotalHeader}>Total</Text>
              </View>

              {/* Data Rows */}
              {store.rows.length > 0 ? (
                store.rows.map((row) => (
                  <View key={row.id_route_transaction} style={styles.tableRow}>
                    <Text style={styles.colFecha}>{row.dateStr}</Text>

                    {data.productList.map((prod) => (
                      <Text
                        key={prod.id_product}
                        style={[styles.productColData, { width: productColWidth }]}
                      >
                        {row.productQuantities[prod.id_product]}
                      </Text>
                    ))}

                    <Text style={styles.colTotal}>
                      ${row.totalAmount.toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text
                    style={[
                      styles.colFecha,
                      { width: "100%", paddingLeft: 4, color: "#9ca3af" },
                    ]}
                  >
                    Sin transacciones registradas
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};