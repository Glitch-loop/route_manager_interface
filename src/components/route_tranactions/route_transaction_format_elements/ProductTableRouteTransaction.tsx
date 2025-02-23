// Libraries
import React from 'react';

// Interfaces and utils
import { IProductInventory } from '../../../interfaces/interfaces';
import { getProductDevolutionBalanceWithoutNegativeNumber } from '@/utils/saleFunctionUtils';

// Components
import SubtotalLine from '@/components/route_tranactions/route_transaction_format_elements/SubtotalLine';

/*
  Although this component is more related to "transaction summrizing",
  it was decided to use the IProductInventory interface because it is more used than
  the transaction interfaces (so, in this way, it is expected that with this decisition
  this component be more reusable).
*/

const ProductTableRouteTransaction = ({
    arrayProducts,
    totalSectionCaptionMessage = 'Total: ',
    emptyMovementCaption = 'Ningún movimiento en la operación',
  }:{
    arrayProducts:IProductInventory[],
    totalSectionCaptionMessage?:string,
    emptyMovementCaption?: string,
  }) => {

  const styleRow:string = 'flex basis-1/4 justify-center text-center text-black';
  const styleHeader:string = 'flex basis-1/4 justify-center text-center text-black font-bold';

  return (
    <div className={`w-11/12 flex flex-col items-center`}>
      <div className={`w-full flex flex-row items-center`}>
        <span className={styleHeader}>Producto</span>
        <span className={styleHeader}>Precio</span>
        <span className={styleHeader}>Cantidad</span>
        <span className={styleHeader}>Valor</span>
      </div>
      { arrayProducts.length > 0 ? (
        arrayProducts.map(product => {
        return (
          <div key={product.id_product} className={`w-full my-1 flex flex-row items-center justify-center`}>
            <span className={styleRow}>{product.product_name}</span>
            <span className={styleRow}>${product.price}</span>
            <span className={styleRow}>{product.amount}</span>
            <span className={styleRow}>
              ${product.amount * product.price}
            </span>
          </div>
        );})
        ) : (
          <span className={`text-black text-xl text-center mt-3`}>
            {emptyMovementCaption}
          </span>
      )}
      {/* Getting subtotal product devolution */}
      { arrayProducts.length > 0 &&
        <SubtotalLine
          description={totalSectionCaptionMessage}
          total={getProductDevolutionBalanceWithoutNegativeNumber(arrayProducts,
                  []).toString()}
          fontclassName={'font-bold italic span-base'}/>
      }
    </div>
  );
};

export default ProductTableRouteTransaction;
