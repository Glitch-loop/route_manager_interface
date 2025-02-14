import { colorTypes, sizeTypes } from "../interfaces/typesSystem"

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


export {
    deterimneIconSize,
    determineBackgroundColor
}