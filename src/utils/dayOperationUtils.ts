import DAYS_OPERATIONS from "./dayOperations";


export function getNameOfOperationType(id_operation_type:string):string {
    let nameOperationType:string = "";

    if (DAYS_OPERATIONS.start_shift_inventory === id_operation_type) {
        nameOperationType = "inventario inicial";
    } else if (DAYS_OPERATIONS.restock_inventory === id_operation_type) {
        nameOperationType = "restock de inventario"; 
    } else if (DAYS_OPERATIONS.end_shift_inventory === id_operation_type) {
        nameOperationType = "inventario final";
    } else if (DAYS_OPERATIONS.product_devolution_inventory === id_operation_type) {
        nameOperationType = "inventario de devolución de producto";
    } else if (DAYS_OPERATIONS.product_devolution === id_operation_type) {
        nameOperationType = "devolución de producto";
    } else if (DAYS_OPERATIONS.sales === id_operation_type) {
        nameOperationType = "venta";
    } else if (DAYS_OPERATIONS.product_reposition === id_operation_type) {
        nameOperationType = "reposición de producto";
    } else {
        nameOperationType = "indeterminado";
    }

    return nameOperationType;
}