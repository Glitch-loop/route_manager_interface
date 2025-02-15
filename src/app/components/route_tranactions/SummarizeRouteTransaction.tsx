
import { IProductInventory } from "@/app/interfaces/interfaces";

import { getProductDevolutionBalanceWithoutNegativeNumber } from "@/app/utils/saleFunctionUtils";
import AccountabilityTypeSummarizeProcess from "../general/AccountabilityTypeSummarizeProcess";

function SummarizeRouteTransaction({
    arrayProducts,
    totalSectionCaptionMessage = 'Total: ',
    emptyMovementCaption = 'Ningún movimiento en la operación',
  }:{
    arrayProducts:IProductInventory[],
    totalSectionCaptionMessage?:string,
    emptyMovementCaption?: string,
  }) {


    return (
        <div className={`w-11/12 flex flex-col items-center`}>
        <div className={`w-full flex flex-row items-center`}>
          <span className={`flex basis-1/4 font-bold span-center span-black`}>Producto</span>
          <span className={`flex basis-1/4 font-bold span-center span-black`}>Precio</span>
          <span className={`flex basis-1/4 font-bold span-center span-black`}>Cantidad</span>
          <span className={`flex basis-1/4 font-bold span-center span-black`}>Valor</span>
        </div>
        { arrayProducts.length > 0 ? (
          arrayProducts.map(product => {
          return (
            <div key={product.id_product} className={`w-full my-1 flex flex-row items-center`}>
              <span className={`flex basis-1/4 span-center span-black`}>
                {product.product_name}
              </span>
              <span className={`flex basis-1/4 span-center span-black`}>${product.price}</span>
              <span className={`flex basis-1/4 span-center span-black`}>{product.amount}</span>
              <span className={`flex basis-1/4 span-center span-black`}>
                ${product.amount * product.price}
              </span>
            </div>
          );})
          ) : (
            <span className={`span-black span-xl span-center mt-3`}>
              {emptyMovementCaption}
            </span>
        )}
        {/* Getting subtotal product devolution */}
        { arrayProducts.length > 0 &&
          <AccountabilityTypeSummarizeProcess 
            titleOfSummarize={""}
            contentOfSummariaze={[
                {
                    message: "Total",
                    value: "$" + getProductDevolutionBalanceWithoutNegativeNumber(arrayProducts,[]).toString(),
                    isUnderline: false,
                    isBold: false,
                    isItalic: false,
                    isSeparateLine: false
                }
            ]}
            />
        }
      </div>
    )
}


export default SummarizeRouteTransaction;