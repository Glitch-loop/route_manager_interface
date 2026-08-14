import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ProcessedConsolidatedData } from "@/app/analytics/reports/consoldate_historic_report/consolidatedReportHelpers";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
  },
  // Document header section (repeats on every page via 'fixed')
  headerContainer: {
    marginBottom: 10,
  },
  createdDateText: {
    textAlign: "right",
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 2,
  },
  titleCenter: {
    textAlign: "center",
  },
  mainTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  subTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 9.5,
    color: "#4b5563",
  },
  // Master Table
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
    minHeight: 18,
    alignItems: "center",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    fontFamily: "Helvetica-Bold",
    height: 95,
    alignItems: "center",
  },
  colClienteHeader: {
    width: "22%",
    paddingLeft: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  colTotalHeader: {
    width: "10%",
    textAlign: "right",
    paddingRight: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  productHeaderCell: {
    height: 95,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  verticalText: {
    transform: "rotate(-90deg)",
    transformOrigin: "center center",
    width: 85,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "left",
  },
  // Data Column Styles
  colCliente: {
    width: "22%",
    textAlign: "left",
    paddingLeft: 4,
    fontSize: 8.5,
  },
  colTotal: {
    width: "10%",
    textAlign: "right",
    paddingRight: 4,
    fontSize: 8.5,
  },
  productColData: {
    textAlign: "center",
    fontSize: 9,
  },
  // Store Label Row Style
  storeFooterRow: {
    backgroundColor: "#f3f4f6",
    fontFamily: "Helvetica-Bold",
  },
  storeFooterText: {
    width: "22%",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    paddingLeft: 4,
  },
});

interface Props {
  data: ProcessedConsolidatedData;
}

export const ConsolidatedRouteDayPDFDocument: React.FC<Props> = ({ data }) => {
  const productCount = data.productList.length;
  const productColWidth = productCount > 0 ? `${68 / productCount}%` : "68%";

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* Header Section: 'fixed' prop forces repetition on top of every page */}
        <View style={styles.headerContainer} fixed>
          <Text style={styles.createdDateText}>{data.createdDate}</Text>
          <View style={styles.titleCenter}>
            <Text style={styles.mainTitle}>Reporte ventas</Text>
            <Text style={styles.subTitle}>
              {data.routeName} - {data.dayName}
            </Text>
            <Text style={styles.dateRange}>{data.dateRangeText}</Text>
          </View>
        </View>

        {/* Master Consolidated Table */}
        <View style={styles.table}>
          {/* Table Header Row (repeats on every page right below the document header) */}
          <View style={[styles.tableRow, styles.tableHeaderRow]} fixed>
            <Text style={styles.colClienteHeader}>Cliente</Text>

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

          {/* Table Content Rows */}
          {data.tableRows.map((row) => {
            if (row.type === "transaction") {
              return (
                <View key={row.id} style={styles.tableRow} wrap={false}>
                  <Text style={styles.colCliente}>{row.dateStr}</Text>

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
              );
            }

            // Store Name Row
            return (
              <View
                key={row.id}
                style={[styles.tableRow, styles.storeFooterRow]}
                wrap={false}
              >
                <Text
                  style={styles.storeFooterText}
                  maxLines={1}
                  textOverflow="ellipsis"
                >
                  {row.clientText}
                </Text>

                {data.productList.map((prod) => (
                  <View
                    key={prod.id_product}
                    style={{ width: productColWidth }}
                  />
                ))}

                <View style={{ width: "10%" }} />
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};