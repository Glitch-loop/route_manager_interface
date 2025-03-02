import { enumStoreStates } from "@/interfaces/enumStoreStates"
import { colorTypes, sizeTypes } from "../interfaces/typesSystem"
import { IStore, IStoreStatusDay } from "@/interfaces/interfaces"
import DAYS_OPERATIONS from "./dayOperations"

function deterimneIconSize(colorSelected:sizeTypes){
    let iconSize = ""
    switch(colorSelected) {
        case 'small':
            iconSize = "p-2 text-xl"
            break
        case 'base':
            iconSize = "p-3 text-3xl"
            break
        case 'big':
            iconSize = "p-4 text-4xl"
            break
        default:
            iconSize = "p-2 text-xl"
            break
    }
    return iconSize
}

function determineBackgroundColor(colorSelected:colorTypes){
    let backgroundColor = ""
    switch(colorSelected) {
        case 'info':
            backgroundColor = "bg-color-info-primary"
            break
        case 'warning-1':
            backgroundColor = "bg-color-warning-primary"
            break
        case 'warning-2':
            backgroundColor = "bg-color-warning-secondary"
            break
        case 'success-1':
            backgroundColor = "bg-color-success-primary"
            break
        case 'success-2':
            backgroundColor = "bg-color-success-secondary"
            break
        case 'danger-1':
            backgroundColor = "bg-color-danger-primary"
            break
        case 'danger-2':
            backgroundColor = "bg-color-danger-secondary"
            break
        default:
            backgroundColor = "bg-color-info-primary"
            break
    }
    return backgroundColor
}

// Related to store context
const determineStoreContextBackgroundColor = (store: IStore&IStoreStatusDay, currentOperation: boolean) => {
    if (currentOperation === true) {
      return "rgb(99, 102, 241)"; // Tailwind `bg-indigo-500`
    } else {
      switch (store.route_day_state) {
        case enumStoreStates.NEW_CLIENT:
          return "rgb(74, 222, 128)"; // Tailwind `bg-green-400`
        case enumStoreStates.SPECIAL_SALE:
          return "rgb(234, 88, 12)"; // Tailwind `bg-orange-600`
        case enumStoreStates.REQUEST_FOR_SELLING:
          return "rgb(245, 158, 11)"; // Tailwind `bg-amber-500`
        case enumStoreStates.SERVED:
          return "rgba(253, 230, 138, 0.75)"; // Tailwind `bg-amber-200/75` (with transparency)
        default:
          return "rgb(252, 211, 77)"; // Tailwind `bg-amber-300`
      }
    }
};
  
// Related to day operations
const determineDayOperationTypeBackgroundColor = (id_operation_type:string):string => {
    let backgroundColor:string = "rgb(242, 242, 242)";
    

    if (DAYS_OPERATIONS.start_shift_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.restock_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)"; 
    } else if (DAYS_OPERATIONS.end_shift_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.product_devolution_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.product_devolution === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else if (DAYS_OPERATIONS.sales === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else if (DAYS_OPERATIONS.product_reposition === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else {
        backgroundColor = "rgb(242, 242, 242)";
    }

    return backgroundColor;
}

export {
    deterimneIconSize,
    determineBackgroundColor,
    determineStoreContextBackgroundColor,
    determineDayOperationTypeBackgroundColor
}