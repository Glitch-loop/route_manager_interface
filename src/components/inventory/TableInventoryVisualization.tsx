// Libraries
import React from 'react';

// Interfaces
import {
  IInventoryOperation,
  IInventoryOperationDescription,
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
 } from '../../interfaces/interfaces';

// Utils
import { convertInventoryOperationDescriptionToProductInventoryInterface, findProductAmountInArray } from '@/utils/inventoryUtils';

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
//   headerRowTitleTableStyle,
// } from '@/styles/inventoryOperationTableStyles';
import { convertArrayInJsonUsingInterfaces } from '@/utils/generalUtils';
import DAYS_OPERATIONS from '@/utils/dayOperations';
import { isTypeIInventoryOperationDescription, isTypeIRouteTransactionOperation, isTypeIRouteTransactionOperationDescription } from '@/utils/guards';
import { getProductInventoryByInventoryOperationType, getProductInventoryOfInventoryOperationType, groupConceptsInTheirParentConcept } from '@/controllers/InventoryController';


const headerTitleTableStyle:string = 'h-32 w-28 flex flex-row justify-center items-center';
const headerRowTitleTableStyle:string = 'w-28 flex flex-row justify-center items-center';
const viewTagHeaderTableStyle:string = 'w-full flex flex-row justify-center items-center';
const textHeaderTableStyle:string = 'h-16 align-middle text-center text-black flex flex-row justify-center items-center';

const rowTableStyle:string = 'h-32';
const cellTableStyle:string = 'flex flex-row justify-center';
const cellTableStyleWithAmountOfProduct:string = 'flex flex-row justify-center bg-amber-100';
const viewTagRowTableStyle:string = 'w-full flex flex-row items-center justify-center';
const textRowTableStyle:string = 'text-sm text-center text-black flex flex-row justify-center';




// function getProductInventoryOfInventoryOperationType(
//   inventoryOperationType:string, 
//   inventoryOperations:IInventoryOperation[],
//   inventoryDescriptions:Map<string, IInventoryOperationDescription[]>,
//   inventory:IProductInventory[],
//   idInventoryOperation:string|undefined
// ):IProductInventory[] {
//   let productInventory:IProductInventory[];
//   const inventoryOftheOperation:IInventoryOperation|undefined = inventoryOperations.find((inventoryOperation) => { 
//     let isOperation:boolean = false;
//     const {state, id_inventory_operation, id_inventory_operation_type} = inventoryOperation;

//     if (idInventoryOperation === undefined) {
//       isOperation = (state === 1 && id_inventory_operation_type === inventoryOperationType); 
//     } else {
//       isOperation = (idInventoryOperation === id_inventory_operation && state === 1 && id_inventory_operation_type === inventoryOperationType); 
//     }

//     return isOperation;
//    })



//   if (inventoryOftheOperation === undefined) {
//     console.log("inventory operation wasn't found")
//     productInventory = [];
//   } else {
//     console.log("+++++++++++++++++inventory operation found")
//     const { id_inventory_operation } = inventoryOftheOperation;
//     const inventoyDescriptions:IInventoryOperationDescription[]|undefined = inventoryDescriptions.get(id_inventory_operation);
//     console.log("inventoyDescriptions: ", inventoyDescriptions?.length)
//     productInventory = convertInventoryOperationDescriptionToProductInventoryInterface(
//       inventoyDescriptions,
//       inventory
//     )
//   }

//   return productInventory;
// }

// function getProductInventoryByInventoryOperationType(
//   targetTypeOperation:string, 
//   routeTransactions:IRouteTransaction[],
//   routeTransactionOperations:Map<string, IRouteTransactionOperation[]>,
//   routeTransactionOperationDescriptions:Map<string, IRouteTransactionOperationDescription[]>,
//   inventory:IProductInventory[]):IProductInventory[] {
//   const resultInventory:IProductInventory[] = []
  
//   const newInventory = inventory.map((productInventory:IProductInventory) => {
//     return {...productInventory, amount: 0}
//   })

//   const productInventoryMap:Record<string, IProductInventory> = convertArrayInJsonUsingInterfaces(newInventory);  
  

//   for (const transaction of routeTransactions) {
//     const {id_route_transaction, state} = transaction;
//     if (state === 1) { // Verifying it is active
//       const arrTransactionOperations:IRouteTransactionOperation[]|undefined = routeTransactionOperations.get(id_route_transaction);

//       if (arrTransactionOperations) {
//         for (const transactionOperation of arrTransactionOperations) {
//           const { id_route_transaction_operation_type, id_route_transaction_operation } = transactionOperation;
//           if (id_route_transaction_operation_type === targetTypeOperation) {
//             const arrOperationDescriptions:IRouteTransactionOperationDescription[] |undefined = routeTransactionOperationDescriptions.get(id_route_transaction_operation);

//             if (arrOperationDescriptions) {
//               for (const transactionOperationDescription of arrOperationDescriptions) {
//                 const {id_product, amount} = transactionOperationDescription
//                 if (productInventoryMap[id_product] !== undefined) {
//                   productInventoryMap[id_product].amount += amount
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
  


//   for (const key in productInventoryMap) {
//     resultInventory.push(productInventoryMap[key]);
//   }

//   return resultInventory;
// }



/*
  To generalize as much as possible, this component was made to be capable of showing all the possible "inventory operations".

  At the moment of write this,  there are 4 possible operations:
  - Start inventory
  - Restock inventory
  - Product inventory
  - Final inventory

  Although each one impacts to the inventory in some way, all of them shares the same interface,
  so it was decided that the component will work as follows.

  The component recieves the following parameters:
    - suggestedInventory
    - currentInventory
    - operationInventory
    - enablingFinalInventory
    - setInventoryOperation

  With the combination of all of them is that we can make all the possible inventory operations.

  It is important to know that the pivotal prop is "operationInventory" that is the "state" that will
  store the input of the user, in this way "suggestedInventory", "currentInventoy" and
  "enablingFinalInventory" are auxiliar props that complements the information for the user.

  Another thing to take account is that to indicate that some prop is not needed (at least for
  "suggestedInventory" and "currentInventoy") for the inventory operations, the prop has to recieve
  an empty array, so in this way the component will know that that information is not needed.

  For example if I want to make an "start inventory", I'm going to pass a prop the state on which I will
  store the input of the user (in addition of its handler to manage the events) and in the other props
  I will pass an empty array "[]" and in the case of enablingFinalInventory I will pass "false".

  In the case of a "restock operation" on which I need all auxiliar oepration I will pass the array
  with the information according to the prop.

  Important note: Since productIventory is taken as the main array to display the table the other array
  may not be completed with all the products and it will work without problems.
*/

const TableInventoryVisualization = (
  {
    inventory,
    inventoryOperations,
    inventoryOperationDescriptions,
    routeTransactions,
    routeTransactionOperations,
    routeTransactionOperationDescriptions
  }:{
    inventory:IProductInventory[],
    inventoryOperations:IInventoryOperation[],
    inventoryOperationDescriptions:IInventoryOperationDescription[],
    routeTransactions:IRouteTransaction[],
    routeTransactionOperations:IRouteTransactionOperation[],
    routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[],
  }) => {
    const  suggestedInventory: IProductInventory[] = [];
    let  initialInventory:IProductInventory[] = []; // There is only "one" initial inventory operation
    let  restockInventories:IProductInventory[][] = []; // It could be many "restock" inventories
    let  soldOperations: IProductInventory[] = []; // Outflow in concept of selling
    let  repositionsOperations:IProductInventory[] = []; // Outflow in concept of repositions
    let  returnedInventory:IProductInventory[] = []; // There is only "one" final inventory operation
    let  inventoryWithdrawal:boolean = false;
    let  inventoryOutflow:boolean = false;
    let  finalOperation:boolean = false;
    let  issueInventory:boolean = false;


    // Related to inventory
    const inventoryOperationDescriptionByInventoryOperation:Map<string, IInventoryOperationDescription[]> = groupConceptsInTheirParentConcept<IInventoryOperationDescription>(inventoryOperationDescriptions);
    
    // Related to transactions
    const transactionOperationsByRouteTransactions:Map<string, IRouteTransactionOperation[]> = groupConceptsInTheirParentConcept<IRouteTransactionOperation>(routeTransactionOperations);
    const transactionDescriptionByTransactionOperation:Map<string, IRouteTransactionOperationDescription[]> = groupConceptsInTheirParentConcept<IRouteTransactionOperationDescription>(routeTransactionOperationDescriptions);

    // Determining inventory operations 
    initialInventory = getProductInventoryOfInventoryOperationType(
      DAYS_OPERATIONS.start_shift_inventory, 
      inventoryOperations, 
      inventoryOperationDescriptionByInventoryOperation, 
      inventory.map((product) => { return {...product, amount: 0}}), 
      undefined);

    returnedInventory = getProductInventoryOfInventoryOperationType(
      DAYS_OPERATIONS.end_shift_inventory, 
      inventoryOperations, 
      inventoryOperationDescriptionByInventoryOperation, 
      inventory.map((product) => { return {...product, amount: 0}}), 
      undefined);
  
    // Determining valid restock inventories
    const validRestockInventoryOperations:IInventoryOperation[] = inventoryOperations.filter((inventoryOperation:IInventoryOperation) => {
      const { state, id_inventory_operation_type } = inventoryOperation;
      return state === 1 && id_inventory_operation_type === DAYS_OPERATIONS.restock_inventory;
    })

    restockInventories = validRestockInventoryOperations.reduce((matrixProductInventory:IProductInventory[][], inventoryOperation:IInventoryOperation) => {
      const { id_inventory_operation } = inventoryOperation;
      matrixProductInventory.push(
        getProductInventoryOfInventoryOperationType(
          DAYS_OPERATIONS.restock_inventory, 
          validRestockInventoryOperations, 
          inventoryOperationDescriptionByInventoryOperation, 
          inventory.map((product) => { return {...product, amount: 0}}), 
          id_inventory_operation)
      )
      return matrixProductInventory;
    }, []);

    // Determining route trasnactions
    soldOperations = getProductInventoryByInventoryOperationType(DAYS_OPERATIONS.sales, routeTransactions, transactionOperationsByRouteTransactions, transactionDescriptionByTransactionOperation, inventory.map((product) => { return {...product, amount: 0}}));
    repositionsOperations = getProductInventoryByInventoryOperationType(DAYS_OPERATIONS.product_reposition, routeTransactions, transactionOperationsByRouteTransactions, transactionDescriptionByTransactionOperation, inventory.map((product) => { return {...product, amount: 0}}));



    // Determining auxiliar columns
    if (returnedInventory.length > 0) {
      inventoryWithdrawal = true;
      inventoryOutflow = true;
      finalOperation = true;
      issueInventory = true;
    }    

  return (
    <Paper sx={{width: '100%', overflow: 'hidden'}}>
      { (initialInventory.length > 0
      || returnedInventory.length > 0
      || restockInventories.length > 0) ?
        <div className={`flex flex-row`}>
          {/* Datatable for name of the products */}
          {/* <TableContainer className='flex basis-1/6'>
            <Table>
              <TableHead className={`${headerTitleTableStyle}`}>
                <TableRow className={`${headerRowTitleTableStyle}`}>
                  <TableCell className={`${viewTagHeaderTableStyle}`}>
                    <span className={`${textHeaderTableStyle}`}>
                      Producto
                    </span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { inventory.map((product) => {
                  return (
                    <TableRow key={product.id_product} className={`${rowTableStyle}`}>
                      <TableCell className={`${cellTableStyle}`}>
                        <div className={`${viewTagRowTableStyle}`}>
                          <span className={`${textRowTableStyle}`}>
                            {product.product_name}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );})
                }
              </TableBody>
            </Table>
          </TableContainer> */}
          {/* Datatable for the information for each concept */}
          <div className='flex basis-full overflow-x-hidden'>
            <TableContainer>
              <Table>
                {/* Header section */}
                <TableHead>
                  <TableRow>
                    <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle}`}>
                            Producto
                          </span>
                        </div>
                    </TableCell>
                    {/* This field is never empty since it is necessary anytime */}
                    { initialInventory.length > 0 &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle}`}>
                            Inventario inicial
                          </span>
                        </div>
                      </TableCell>
                    }
                    { restockInventories.length > 0 &&
                      restockInventories.map((currentInventory, index) => {
                        return (
                          <TableCell key={index} className={`${headerTitleTableStyle}`}>
                            <div className={`${viewTagHeaderTableStyle}`}>
                              <span className={`${textHeaderTableStyle}`}>
                                Re-stock
                              </span>
                            </div>
                          </TableCell>
                        );
                      })
                    }
                    {/*
                      This field is never empty since it is the reason of this component (inventory operation)
                    */}
                    { inventoryWithdrawal &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle} font-bold underline`}>
                            Salida total
                          </span>
                        </div>
                      </TableCell>
                    }
                    { soldOperations.length > 0 &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle}`}>
                            Venta
                          </span>
                        </div>
                      </TableCell>
                    }
                    { repositionsOperations.length > 0 &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle}`}>
                            Cambio
                          </span>
                        </div>
                      </TableCell>
                    }
                    { inventoryOutflow &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle} font-bold underline`}>
                            Total vendido y cambiado
                          </span>
                        </div>
                      </TableCell>
                    }
                    { finalOperation &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle}`}>
                            Inventario final
                          </span>
                        </div>
                      </TableCell>
                    }
                    { returnedInventory.length > 0 &&
                        <TableCell className={`${headerTitleTableStyle}`}>
                          <div className={`${viewTagHeaderTableStyle}`}>
                            <span className={`${textHeaderTableStyle}`}>
                              Inventario físico
                            </span>
                          </div>
                      </TableCell>
                    }
                    { issueInventory &&
                      <TableCell className={`${headerTitleTableStyle}`}>
                        <div className={`${viewTagHeaderTableStyle}`}>
                          <span className={`${textHeaderTableStyle} font-bold underline`}>
                            Problema con inventario
                          </span>
                        </div>
                      </TableCell>
                    }
                  </TableRow>
                </TableHead>
                {/* Body section */}
                <TableBody>
                  { (initialInventory.length > 0 || returnedInventory.length > 0 || restockInventories.length > 0) &&
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
                      const id_product = product.id_product;
                      const product_name = product.product_name;
                      
                      /* Declaring variables that will store the amount of product for each type of operation*/
                      let suggestedAmount = 0;
                      let initialInventoryOperationAmount = 0;
                      let returnedInventoryOperationAmount = 0;
                      const restockInventoryOperationAmount:number[] = [];
                      let soldInventoryOperationAmount = 0;
                      let repositionInventoryOperationAmount = 0;

                      // Special calculations variables
                      let withdrawalAmount = 0;
                      let inventoryOutflowAmount = 0;
                      let finalOperationAmount = 0;
                      let inventoryIssueAmount = 0;

                      // Searching the product in the inventory operations
                      suggestedAmount                   = findProductAmountInArray(suggestedInventory, id_product);
                      initialInventoryOperationAmount   = findProductAmountInArray(initialInventory, id_product);
                      returnedInventoryOperationAmount  = findProductAmountInArray(returnedInventory, id_product);
                      soldInventoryOperationAmount      = findProductAmountInArray(soldOperations, id_product);
                      repositionInventoryOperationAmount
                        = findProductAmountInArray(repositionsOperations, id_product);

                      restockInventories.forEach((restockInventory:IProductInventory[]) => {
                        const currentRestockProductAmount
                          = findProductAmountInArray(restockInventory, id_product);

                          withdrawalAmount += currentRestockProductAmount;
                        restockInventoryOperationAmount.push(currentRestockProductAmount);
                      });

                      // Special calculations
                      withdrawalAmount += initialInventoryOperationAmount;
                      inventoryOutflowAmount = soldInventoryOperationAmount + repositionInventoryOperationAmount;

                      finalOperationAmount = withdrawalAmount - inventoryOutflowAmount;

                      inventoryIssueAmount = finalOperationAmount - returnedInventoryOperationAmount;
                      return (
                        <TableRow className={`${rowTableStyle}`}
                        key={product.id_product}>
                            <TableCell className={`${suggestedAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                            <div className={`${viewTagRowTableStyle}`}>
                              <span className={`${textRowTableStyle}`}>
                                {product_name}
                              </span>
                            </div>
                          </TableCell>
                          {/* This field is never empty since it is necessary anytime */}
                          {/* Product (product identification) */}
                          {/* Suggested inventory */}
                          { suggestedInventory.length > 0 &&
                            <TableCell className={`${suggestedAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {suggestedAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Initial inventory */}
                          { initialInventory.length > 0 &&
                            <TableCell className={`${initialInventoryOperationAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {initialInventoryOperationAmount}
                                </span>
                              </div>
                          </TableCell>

                          }
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
                          { inventoryWithdrawal === true &&
                            <TableCell className={`${withdrawalAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {withdrawalAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Product sold */}
                          { soldOperations.length > 0 &&
                            <TableCell className={`${soldInventoryOperationAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {soldInventoryOperationAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Product reposition */}
                          { repositionsOperations.length > 0 &&
                            <TableCell className={`${repositionInventoryOperationAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {repositionInventoryOperationAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Outflow product */}
                          { inventoryOutflow === true &&
                            <TableCell className={`${inventoryOutflowAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {inventoryOutflowAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Final inventory */}
                          { finalOperation === true &&
                            <TableCell className={`${finalOperationAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {finalOperationAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Returned inventory */}
                          { returnedInventory.length > 0 &&
                            <TableCell className={`${returnedInventoryOperationAmount > 0 ? cellTableStyleWithAmountOfProduct : cellTableStyle}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {returnedInventoryOperationAmount}
                                </span>
                              </div>
                            </TableCell>
                          }
                          {/* Inventory problem */}
                          { issueInventory === true &&
                            <TableCell className={`${cellTableStyle} 
                              ${inventoryIssueAmount === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                              <div className={`${viewTagRowTableStyle}`}>
                                <span className={`${textRowTableStyle}`}>
                                  {inventoryIssueAmount}
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
          </div>
        </div> :
        <div className={`w-full flex flex-col justify-center`}>
          {/* <ActivityIndicator size={'large'} /> */}
          <span>No se ha podido recuperar los registros</span>
        </div>
      }
    </Paper>
  );
};

export default TableInventoryVisualization;
