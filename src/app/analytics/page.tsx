"use client";
import 'reflect-metadata';

// Libraries
import { useEffect, useState } from "react";
import { Dayjs, Dayjs } from "dayjs";

// Components
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import { Button, List, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup } from "@mui/material";

// Constants
import { AMOUNT_OF_DAYS_RANGE_GROUPS } from "./constants/constants";

// Injection Container
import { di_container } from '@/infrastructure/di/container';
import ProductDTO from '@/application/dto/ProductDTO';
import ListAllProductsQuery from '@/application/queries/ListAllProductsQuery';
import ListRouteTransactionsQuery from '@/application/queries/ListRouteTransactionQuery';
import RouteTransactionDTO from '@/application/dto/RouteTransactionDTO';
import DAY_OPERATIONS from '@/core/enums/DayOperations';


type ProductAmount = { 
  id_product: string;
  amount: number;
}

export default function Page() {
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);
  const [mapProducts, setMapProducts] = useState<Map<string, ProductDTO>>(new Map());
  const [selectedRangeForGrouping, setSelectedRangeForGrouping] = useState<number>(AMOUNT_OF_DAYS_RANGE_GROUPS[3].amount_of_days);
  const [consultedRouteTransactions, setConsultedRouteTransactions] = useState<RouteTransactionDTO[]|null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [totalSoldInRange, setTotalSoldInRange] = useState<Map<string, ProductAmount>>(new Map());

  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
      setStartDateSelected(start);
      setEndDateSelected(end);
  }


  useEffect(() => {
    fetchPageInformation();
  }, []);
  
  // Auxiliar functions
  const fetchPageInformation = async () => {
    const listAllProductsQuery = di_container.resolve<ListAllProductsQuery>(ListAllProductsQuery);

    const products: ProductDTO[] = await listAllProductsQuery.execute(true);
    const productsMap = new Map<string, ProductDTO>();
    products.forEach(product => {
      productsMap.set(product.id_product, product);
    });
    setMapProducts(productsMap);
    setProducts(products);
  }

  // Hanlders
  const handleSearchRouteTransactions = async (startDate: Dayjs | null, endDate: Dayjs | null) => {
    const retrieveRouteTransactionsByDateRangeQuery = di_container.resolve<ListRouteTransactionsQuery>(ListRouteTransactionsQuery);
    console.log("Data: ", retrieveRouteTransactionsByDateRangeQuery)
    const productSold = new Map<string, ProductAmount>();
    if (startDate !== null && endDate !== null) {
      const routeTransaction: RouteTransactionDTO[] = await retrieveRouteTransactionsByDateRangeQuery.execute(startDate.toDate(), endDate.toDate());
      setConsultedRouteTransactions(routeTransaction);
      
      routeTransaction.forEach(transaction => {
        const { transaction_description } = transaction;
        transaction_description.forEach(item => {
          const { id_product, amount, id_transaction_operation_type } = item;

          if (id_transaction_operation_type === DAY_OPERATIONS.sales) {
            // Only consider sales for the total amount sold
            const currentAmount = productSold.get(id_product)?.amount ?? 0;
            productSold.set(id_product, {
              id_product,
              amount: currentAmount + amount
            });
          }
        });
      });
      setTotalSoldInRange(productSold);
    }
  }

  return (
  <aside className='w-full h-full flex flex-col gap-4 p-4'>
    <h1>Analytics</h1>
      <div className="flex flex-row gap-2">
        <div className='flex flex-col gap-1'>
          <h3>Selecciona rango de fechas</h3>
          <RangeDateSelection 
              initialDirection="before"
              initialSelectedRange="1month"
              onRangeChange={handleDateRangeChange}
          />
          <Button variant="contained" size="small" onClick={() => handleSearchRouteTransactions(startDateSelected, endDateSelected)}>Buscar</Button>
        </div>
        <div className='flex flex-col gap-1'>
          <h3>Selecciona rango de agrupación</h3>
          <ToggleButtonGroup
            value={selectedRangeForGrouping}
            exclusive
            onChange={(_, val) => val && setSelectedRangeForGrouping(val)}
            size="small"
          >
            {AMOUNT_OF_DAYS_RANGE_GROUPS.map(opt => (
              <ToggleButton key={opt.amount_of_days} value={opt.amount_of_days}>{opt.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </div>
      { startDateSelected !== null && endDateSelected !== null &&
        <div className='w-full h-full overflow-y-auto'>
          <h2>Total vendido en el lapso de {startDateSelected?.format("DD/MM/YYYY")} a {endDateSelected?.format("DD/MM/YYYY")}:</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Total venta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => {
                  const { id_product } = product;
                  const totalSold: ProductAmount | undefined = totalSoldInRange.get(id_product);
                  
                  if (totalSold === undefined) {
                    return (
                      <TableRow key={product.id_product}>
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell align="right">No disponible</TableCell>
                      </TableRow>
                    )
                  } else {
                    const { amount } = totalSold;
                    return (
                      <TableRow key={product.id_product}>
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell align="right">{amount}</TableCell>
                      </TableRow>
                    )
                  }
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      }
  </aside>
  )
}