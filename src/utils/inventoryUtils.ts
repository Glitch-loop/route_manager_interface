import { 
  IProduct,
    IProductInventory, 
    IRouteTransactionOperationDescription 
} from "@/interfaces/interfaces";


export function convertRouteTransactionOperationDescriptionToProductInventoryInterface(
  routeTransactionOperationDescription:IRouteTransactionOperationDescription[]|undefined,
  productInventory: IProductInventory[],
):IProductInventory[] {
  if (routeTransactionOperationDescription === undefined) {
    return [];
  } else {
    return routeTransactionOperationDescription.map((transactionDescription) => {
      /*
        Extracting infomration from the transaction:
        - Amount.
        - Price at moment of the operation.
      */
      const product:IProductInventory = {
        id_product: transactionDescription.id_product,
        product_name: '',
        barcode: '',
        weight: '',
        unit: '',
        comission: 0,
        price: transactionDescription.price_at_moment,
        product_status: 1,
        order_to_show: 0,
        amount: transactionDescription.amount,
      };

      /*
        Extracting information from the product itself.

        Information regarded to the description of the product.
      */
      const foundProduct = productInventory
        .find(currentProduct => { return currentProduct.id_product === transactionDescription.id_product;});

      /* Completing missing spaces */
      if (foundProduct === undefined) {
        /* Do nothing */
      } else {
        product.product_name =    foundProduct.product_name;
        product.barcode =         foundProduct.barcode;
        product.weight =          foundProduct.weight;
        product.unit =            foundProduct.unit;
        product.comission =       foundProduct.comission;
        product.product_status =  foundProduct.product_status;
        product.order_to_show =   foundProduct.order_to_show;
      }

      return product;
    });
  }
}


export function convertOperationDescriptionToProductInventoryInterface(
    routeTransactionOperationDescription:IRouteTransactionOperationDescription[]|undefined,
    productInventory: IProductInventory[],
  ):IProductInventory[] {
    if (routeTransactionOperationDescription === undefined) {
      return [];
    } else {
      return routeTransactionOperationDescription.map((transactionDescription) => {
        /*
          Extracting infomration from the transaction:
          - Amount.
          - Price at moment of the operation.
        */
        const product:IProductInventory = {
          id_product: transactionDescription.id_product,
          product_name: '',
          barcode: '',
          weight: '',
          unit: '',
          comission: 0,
          price: transactionDescription.price_at_moment,
          product_status: 1,
          order_to_show: 0,
          amount: transactionDescription.amount,
        };
  
        /*
          Extracting information from the product itself.
  
          Information regarded to the description of the product.
        */
        const foundProduct = productInventory
          .find(currentProduct => { return currentProduct.id_product === transactionDescription.id_product;});
  
        /* Completing missing spaces */
        if (foundProduct === undefined) {
          /* Do nothing */
        } else {
          product.product_name =    foundProduct.product_name;
          product.barcode =         foundProduct.barcode;
          product.weight =          foundProduct.weight;
          product.unit =            foundProduct.unit;
          product.comission =       foundProduct.comission;
          product.product_status =  foundProduct.product_status;
          product.order_to_show =   foundProduct.order_to_show;
        }
  
        return product;
      });
    }
  }
  

export function convertProductToProductInventoryInterface(arrProducts:IProduct[]):IProductInventory[] {
  return arrProducts.map((product) => {return {...product, amount: 0}})
}