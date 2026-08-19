import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { WarehouseSupplyMatrixData } from './consolidateWarehouseSupplyData';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 24,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#F5F5F5',
  },
  productColHeader: {
    width: '25%',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  routeColHeader: {
    flex: 1,
    padding: 6,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  productCell: {
    width: '25%',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  quantityCell: {
    flex: 1,
    padding: 6,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
});

interface Props {
  data: WarehouseSupplyMatrixData;
}

export const WarehouseSupplyMatrixPDFDocument: React.FC<Props> = ({ data }) => {
  const { dayName, formattedDate, routes, products, matrix } = data;

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ruta para surtir {dayName}</Text>
          <Text style={styles.subtitle}>
            Día de referencia {formattedDate}
          </Text>
        </View>

        {/* Matrix Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={styles.productColHeader}>Producto</Text>
            {routes.map((r, index) => (
              <Text
                key={r.id_route}
                style={[
                  styles.routeColHeader,
                  index === routes.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                {r.route_name}
              </Text>
            ))}
          </View>

          {/* Product Rows */}
          {products.map((p) => (
            <View key={p.id_product} style={styles.tableRow}>
              <Text style={styles.productCell}>{p.product_name}</Text>
              {routes.map((r, index) => {
                const qty = matrix[p.id_product]?.[r.id_route] ?? 0;
                return (
                  <Text
                    key={r.id_route}
                    style={[
                      styles.quantityCell,
                      index === routes.length - 1
                        ? { borderRightWidth: 0 }
                        : {},
                    ]}
                  >
                    {qty}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};