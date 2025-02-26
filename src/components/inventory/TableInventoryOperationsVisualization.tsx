// Libraries
import React from 'react';

// Interfaces
import {
  IProductInventory,
 } from '../../interfaces/interfaces';

// Components
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Styles 
// import {
//   headerTitleTableStyle,
//   viewTagHeaderTableStyle,
//   textHeaderTableStyle,
//   rowTableStyle,
//   cellTableStyle,
//   viewTagRowTableStyle,
//   textRowTableStyle,
//   cellTableStyleWithAmountOfProduct,
//  } from '@/styles/inventoryOperationTableStyles';

import { findProductAmountInArray } from '@/utils/inventoryUtils';


const headerTitleTableStyle:string = 'h-32 w-28 flex flex-row justify-center items-center';
const headerRowTitleTableStyle:string = 'w-28 flex flex-row justify-center items-center';
const viewTagHeaderTableStyle:string = 'w-full flex flex-row justify-center items-center';
const textHeaderTableStyle:string = 'h-16 align-middle text-center text-black flex flex-row justify-center items-center';

const rowTableStyle:string = 'h-32';
const cellTableStyle:string = 'flex flex-row justify-center';
const cellTableStyleWithAmountOfProduct:string = 'flex flex-row justify-center bg-amber-100';
const viewTagRowTableStyle:string = 'w-full flex flex-row items-center justify-center';
const textRowTableStyle:string = 'text-sm text-center text-black flex flex-row justify-center';



/*
 This component is an abstraction from "TableInventoryVisualization" component, here, what is in the "props"
 is what will be displayed, so the order of how the information is stored in the arrays will influence in
 how the information will be displayed.

 The intention of this component is to provide a component for display information around a "concept" like:
 - Stores
 - Movements
 - Products

 Rather than displaying the information of the route as in the main workflow.
*/

const TableInventoryOperationsVisualization = (
  {
    inventory,
    titleColumns,
    productInventories,
    calculateTotal = false,
  }:{
    inventory:IProductInventory[],
    titleColumns: string[],
    productInventories:IProductInventory[][],
    calculateTotal:boolean
  }) => {

  return (
    <Paper sx={{width: '100%', overflow: 'hidden'}}>
      {(productInventories.length > 0) ?
        <div className={`w-full flex flex-row`}>
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
                  { titleColumns.map((titleColumn, index) => {
                      return (
                        <TableCell key={index} className={`${headerTitleTableStyle}`}>
                          <div className={`${viewTagHeaderTableStyle}`}>
                            <span className={`${textHeaderTableStyle}`}>
                              {titleColumn}
                            </span>
                          </div>
                      </TableCell>
                      );
                    })
                  }
                  { calculateTotal &&
                    <TableCell className={`${headerTitleTableStyle}`}>
                      <div className={`${viewTagHeaderTableStyle}`}>
                        <span className={`${textHeaderTableStyle}`}>
                          Total
                        </span>
                      </div>
                    </TableCell>
                  }
                </TableRow>
              </TableHead>
              {/* Body section */}
              <TableBody>
                { (productInventories.length > 0) &&
                  inventory.map((product) => {
                    /*
                      To keep an order of how to print the inventory operations, it is used the variable "inventory" which has
                      all the products (and the current amount for each product).

                      "Inventory" is used has the reference of what to print in the "current iteration", so it is going to depend
                      on the current product that it is going to be searched that particular product in the other arrays that store
                      the information of the "product inventory"

                      Since the inventory operations only store if a product had a movement, if there is not find the product of the
                      current operation, it is going to be diplayed with a value of "0" (indicating that it was not a
                      movement of that particular product).
                    */

                    // Propierties that are always going to be present.
                    const { id_product, amount} = product
                    // let id_product = product.id_product;
                    // let amount = product.amount;


                    /* Declaring variables that will store the amount of product for each type of operation*/
                    const restockInventoryOperationAmount:number[] = [];

                    // Special calculations variables
                    let totalOfTable = 0;

                    // Searching the product in the inventory operations
                    productInventories.forEach((restockInventory:IProductInventory[]) => {
                      const currentProductInventoryAmount
                        = findProductAmountInArray(restockInventory, id_product);

                      totalOfTable += currentProductInventoryAmount;
                      restockInventoryOperationAmount.push(currentProductInventoryAmount);
                    });

                    return (
                      <TableRow key={product.id_product} className={`${rowTableStyle}`}>
                        {/* This field is never empty since it is necessary anytime */}
                        <TableCell className={`${cellTableStyle}`}>
                          <div className={`${viewTagRowTableStyle}`}>
                            <span className={`${textRowTableStyle}`}>
                              {product.product_name}
                            </span>
                          </div>
                        </TableCell>
                        {/* Restock of product */}
                        { restockInventoryOperationAmount.length > 0 &&
                          restockInventoryOperationAmount.map((productAmount, index) => {
                            return (
                              <TableCell key={index} className={`${productAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                                <div className={`${viewTagRowTableStyle}`}>
                                  <span className={`${textRowTableStyle}`}>
                                    {productAmount}
                                  </span>
                                </div>
                              </TableCell>
                            );
                          })
                        }
                        {/* Inflow product */}
                        { calculateTotal === true &&
                          <TableCell className={`${totalOfTable > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {totalOfTable}
                              </span>
                            </div>
                          </TableCell>
                        }
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
  );
};

export default TableInventoryOperationsVisualization;
