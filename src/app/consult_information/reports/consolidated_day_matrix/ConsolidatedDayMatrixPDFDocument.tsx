import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ProcessedDayMatrixData } from "./consolidatedDayMatrixHelpers";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#1f2937",
  },
  headerContainer: {
    marginBottom: 6,
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
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    textAlign: "left",
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 18,
    alignItems: "center",
  },
  dayGroupHeaderRow: {
    backgroundColor: "#f3f4f6",
    fontFamily: "Helvetica-Bold",
    height: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  datesHeaderRow: {
    backgroundColor: "#f9fafb",
    fontFamily: "Helvetica-Bold",
    height: 60,
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
  },
  colProductHeader: {
    width: "8%",
    paddingLeft: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1.5,
    borderRightColor: "#000",
  },
  verticalHeaderCell: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  verticalText: {
    transform: "rotate(-90deg)",
    transformOrigin: "center center",
    width: 50,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "left",
  },
  totalHeaderCell: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRightWidth: 2,
    borderRightColor: "#000",
    backgroundColor: "#f3f4f6",
  },
  colProductData: {
    width: "8%",
    paddingLeft: 3,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1.5,
    borderRightColor: "#000",
  },
  dataCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    height: "100%",
    paddingVertical: 1,
  },
  totalDataCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 2,
    borderRightColor: "#000",
    backgroundColor: "#fafafa",
    height: "100%",
    paddingVertical: 1,
  },
  cellTextMain: {
    fontSize: 7.5,
    textAlign: "center",
  },
  cellTextSub: {
    fontSize: 7,
    color: "#4b5563",
    textAlign: "center",
  },
  cellTotalBold: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  productBlock: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#9ca3af",
  },
  diffRow: {
    backgroundColor: "#ffffff",
    minHeight: 20,
  },
  qtyRow: {
    backgroundColor: "#f9fafb",
    minHeight: 18,
  },
});

interface Props {
  data: ProcessedDayMatrixData;
}

export const ConsolidatedDayMatrixPDFDocument: React.FC<Props> = ({ data }) => {
  const totalSubColumns = data.dayHeaders.reduce(
    (acc, group) => acc + group.dates.length + 1,
    0
  );

  const colWidthPct = totalSubColumns > 0 ? 92 / totalSubColumns : 92;
  const colWidthStyle = `${colWidthPct}%`;

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* Document Header */}
        <View style={styles.headerContainer} fixed>
          <Text style={styles.createdDateText}>{data.createdDate}</Text>
          <View style={styles.titleCenter}>
            <Text style={styles.mainTitle}>Reporte consolidado de rutas</Text>
            <Text style={styles.subTitle}>- {data.operationTitle} -</Text>
          </View>
          <Text style={styles.dateRange}>{data.dateRangeText}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Rows */}
          <View fixed>
            {/* Row 1: Days */}
            <View style={[styles.tableRow, styles.dayGroupHeaderRow]}>
              <View style={styles.colProductHeader} />
              {data.dayHeaders.map((group) => {
                const groupSpanWidth = `${colWidthPct * (group.dates.length + 1)}%`;
                return (
                  <View
                    key={group.dayOrder}
                    style={{
                      width: groupSpanWidth,
                      textAlign: "center",
                      borderRightWidth: 2,
                      borderRightColor: "#000",
                    }}
                  >
                    <Text>{group.dayName}</Text>
                  </View>
                );
              })}
            </View>

            {/* Row 2: Fecha / Producto & Dates */}
            <View style={[styles.tableRow, styles.datesHeaderRow]}>
              <View style={styles.colProductHeader}>
                <Text style={{ marginBottom: 10 }}>Fecha</Text>
                <Text>Producto</Text>
              </View>

              {data.dayHeaders.map((group) => (
                <React.Fragment key={group.dayOrder}>
                  {group.dates.map((d) => (
                    <View
                      key={d.rawDate}
                      style={[styles.verticalHeaderCell, { width: colWidthStyle }]}
                    >
                      <Text style={styles.verticalText}>{d.formattedDate}</Text>
                    </View>
                  ))}
                  <View style={[styles.totalHeaderCell, { width: colWidthStyle }]}>
                    <Text style={styles.verticalText}>Total</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Product Rows */}
          {data.products.map((prod) => (
            <View key={prod.idProduct} style={styles.productBlock} wrap={false}>
              {/* Row 1: Differences (dn on top, dp% below) */}
              <View style={[styles.tableRow, styles.diffRow]}>
                <Text style={styles.colProductData} />

                {data.dayHeaders.map((group) => {
                  const dayGroupData = prod.dayGroups[group.dayOrder];
                  return (
                    <React.Fragment key={group.dayOrder}>
                      {dayGroupData?.cells.map((cell, idx) => (
                        <View
                          key={idx}
                          style={[styles.dataCell, { width: colWidthStyle }]}
                        >
                          <Text style={styles.cellTextMain}>{cell.dnText}</Text>
                          <Text style={styles.cellTextSub}>{cell.dpText}</Text>
                        </View>
                      ))}

                      {/* Total Column Diff Cell */}
                      <View
                        style={[styles.totalDataCell, { width: colWidthStyle }]}
                      >
                        <Text style={styles.cellTotalBold}>
                          {dayGroupData?.totalDnText ?? ""}
                        </Text>
                        <Text style={styles.cellTotalBold}>
                          {dayGroupData?.totalDpText ?? ""}
                        </Text>
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Row 2: Quantities (Sum on top, Avg below) */}
              <View style={[styles.tableRow, styles.qtyRow]}>
                <Text
                  style={styles.colProductData}
                  maxLines={1}
                  textOverflow="ellipsis"
                >
                  {prod.productName}
                </Text>

                {data.dayHeaders.map((group) => {
                  const dayGroupData = prod.dayGroups[group.dayOrder];
                  return (
                    <React.Fragment key={group.dayOrder}>
                      {dayGroupData?.cells.map((cell, idx) => (
                        <View
                          key={idx}
                          style={[styles.dataCell, { width: colWidthStyle }]}
                        >
                          <Text style={styles.cellTextMain}>
                            {cell.quantityStr}
                          </Text>
                        </View>
                      ))}

                      {/* Total Column Qty Cell */}
                      <View
                        style={[styles.totalDataCell, { width: colWidthStyle }]}
                      >
                        <Text style={styles.cellTotalBold}>
                          {dayGroupData?.totalSumQtyText ?? ""}
                        </Text>
                        <Text style={styles.cellTotalBold}>
                          {dayGroupData?.totalAvgQtyText ?? ""}
                        </Text>
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};