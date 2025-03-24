
import { IProductInventory, IRoute, IRouteTransaction, IRouteTransactionOperation, IRouteTransactionOperationDescription } from '@/interfaces/interfaces';
import DAYS_OPERATIONS from '@/utils/dayOperations';
import { convertArrayInJsonUsingInterfaces } from '@/utils/generalUtils';
import { formatToCurrency, isRouteOperationDescriptionValid } from '@/utils/saleFunctionUtils';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const headerTitleTableStyle:string = 'h-32 w-28 flex flex-row justify-center items-center';
const headerRowTitleTableStyle:string = 'w-28 flex flex-row justify-center items-center';
const viewTagHeaderTableStyle:string = 'w-full flex flex-row justify-center items-center';
const textHeaderTableStyle:string = 'h-16 align-middle text-xl text-center text-black flex flex-row justify-center items-center';

const rowTableStyle:string = 'h-32';
const cellTableStyle:string = 'flex flex-row justify-center';
const cellTableStyleWithAmountOfProduct:string = 'flex flex-row justify-center bg-amber-100';
const viewTagRowTableStyle:string = 'w-full flex flex-row items-center justify-center';
const textRowTableStyle:string = 'text-lg text-center text-black flex flex-row justify-center';

const TableOfComissionOfTheDay = (  
{
    inventory,
    routeTransactionOfTheDay,
    routeTransactionOperationsOfTheDay,
    routeTransactionOperationDescriptionsOfTheDay,
}:{
    inventory:IProductInventory[],
    routeTransactionOfTheDay:IRouteTransaction[],
    routeTransactionOperationsOfTheDay:IRouteTransactionOperation[],
    routeTransactionOperationDescriptionsOfTheDay:IRouteTransactionOperationDescription[],
}
) => {

    const mapRouteTransaction:Record<string, IRouteTransaction> = convertArrayInJsonUsingInterfaces(routeTransactionOfTheDay);
    const mapRouteTransactionOperation:Record<string, IRouteTransactionOperation> = convertArrayInJsonUsingInterfaces(routeTransactionOperationsOfTheDay);
    

    const productsSoldByType:IRouteTransactionOperationDescription[] =
    routeTransactionOperationDescriptionsOfTheDay.reduce((
        productVariations:IRouteTransactionOperationDescription[], 
        operationDescription:IRouteTransactionOperationDescription) => {
            const isRouteDescriptionValid:boolean = isRouteOperationDescriptionValid(
                operationDescription,
                mapRouteTransactionOperation,
                DAYS_OPERATIONS.sales,
                mapRouteTransaction
            );
            const { id_product, price_at_moment, comission_at_moment, amount } = operationDescription;

            if (isRouteDescriptionValid) {
                const existsVariation:number =  productVariations.findIndex((variation:IRouteTransactionOperationDescription) => {
                    return variation.id_product === id_product && variation.price_at_moment === price_at_moment && variation.comission_at_moment === comission_at_moment;
                });
    
                if (existsVariation === -1) {
                    productVariations.push(operationDescription);
                } else {
                    productVariations[existsVariation] = {
                        ...productVariations[existsVariation],
                        amount: productVariations[existsVariation].amount + amount
                    }
                }
            }

            return productVariations;
    }, []);

    // Merge product inventory with route transaction operation description.
    const inventoryOfProductSoldDuringTheDay:(IProductInventory&IRouteTransactionOperationDescription)[] = productsSoldByType
        .reduce((
            inventoryConcept:(IProductInventory&IRouteTransactionOperationDescription)[],
            productVariant:IRouteTransactionOperationDescription,
        ) => {
            const { id_product } = productVariant;
            const index:number = inventory.findIndex((product:IProductInventory) => { return product.id_product === id_product});

            if (index !== -1) {
              inventoryConcept.push({...inventory[index], ...productVariant});
            }

            return inventoryConcept;
    }, []);

    inventoryOfProductSoldDuringTheDay.sort((a, b) => {
        let result:number = 0;
        if (a.order_to_show < b.order_to_show) {
            result = -1;
        } else if (a.order_to_show > b.order_to_show) {
            result = 1;
        } else {
            if (a.comission_at_moment < b.comission_at_moment) {
                result = -1;
            } else if (a.comission_at_moment > b.comission_at_moment) {
                result = 1;
            } else {
                result = 0;
            }
        } 

        return result
    });

    const totalComissionToPay:number = inventoryOfProductSoldDuringTheDay
        .reduce((acc:number, productConcept:IProductInventory&IRouteTransactionOperationDescription) => {
            const { amount, price_at_moment, comission_at_moment} = productConcept;
            return acc + (amount * price_at_moment) * comission_at_moment;
        }, 0)
    const totalSale:number = inventoryOfProductSoldDuringTheDay
        .reduce((acc:number, productConcept:IProductInventory&IRouteTransactionOperationDescription) => {
            const { amount, price_at_moment } = productConcept;
            return acc + (amount * price_at_moment);
        }, 0)

    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}}>
        {(inventory.length > 0) ?
          <div className={`w-full flex flex-col`}>
            <span className={`text-2xl`}>Total vendido: <span className={`font-bold`}>{formatToCurrency(totalSale)}</span></span>
            <span className={`text-2xl`}>Total comision a pagar: <span className={`font-bold`}>{formatToCurrency(totalComissionToPay)}</span></span>
            {/* Datatable for the information for each concept */}
            <TableContainer>
              <Table className={`w-full`}>
                {/* Header section */}
                <TableHead>
                  <TableRow>
                    {/* This field is never empty since it is necessary anytime */}
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Producto
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Total producto vendido
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Precio
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Subtotal
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          comisión
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Comisión a pagar por el producto
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* Body section */}
                <TableBody>
                  { (inventoryOfProductSoldDuringTheDay.length > 0) &&
                    inventoryOfProductSoldDuringTheDay.map((product) => {
                      const { id_product, amount, comission_at_moment, price_at_moment, product_name} = product  
                      
                        const totalSold = amount * price_at_moment;

                        const formattedComission = comission_at_moment * 100;

                        const comissionToPay = totalSold * comission_at_moment;

   
                      return (
                        <TableRow key={id_product} className={`${rowTableStyle}`}>
                          {/* This field is never empty since it is necessary anytime */}
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {product_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {amount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {formatToCurrency(price_at_moment)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {formatToCurrency(totalSold)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {formattedComission}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className={`${cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                              {formatToCurrency(comissionToPay)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </div> :
          <div className={`w-full my-3 flex flex-col justify-center`}>
            <span>No se ha podido recuperar los registros</span>
          </div>
      }
      </Paper>
    )
}

export default TableOfComissionOfTheDay;