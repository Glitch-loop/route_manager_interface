import { enumStoreStates } from "@/interfaces/enumStoreStates";
import { IStore, IStoreStatusDay } from "@/interfaces/interfaces";
import { getColorDependingOnTheDifferenceOfDates } from "@/utils/dateUtils";
import { determineBackgroundColor, 
    // getColorContextOfStore 
} from "@/utils/stylesUtils";




function CardRouteList({    
    firstColumn, 
    seconColumn, 
    descriptionSecondColumn, 
    thirdColumn, 
    fourthColumn,
    cardColorStyle,
    informationUpperCard,
    informationLowerCard,
    rateOfDifferenceUpperCard,
    rateOfDifferenceLowerCard,
    }:{
    firstColumn:string, 
    seconColumn:string, 
    descriptionSecondColumn:string, 
    thirdColumn:string, 
    fourthColumn:string,
    cardColorStyle:string,
    informationUpperCard?:string,
    informationLowerCard?:string,
    rateOfDifferenceUpperCard?:number,
    rateOfDifferenceLowerCard?:number,
    }) {
        let colorUpperCard = '';
        let colorLowerCard = '';

        if (rateOfDifferenceUpperCard === undefined) {
            colorUpperCard = determineBackgroundColor('info');
        } else {
            colorUpperCard = getColorDependingOnTheDifferenceOfDates(rateOfDifferenceUpperCard)
        }


        if (rateOfDifferenceLowerCard === undefined) {
            colorLowerCard = determineBackgroundColor('info');
        } else {
            colorLowerCard = getColorDependingOnTheDifferenceOfDates(rateOfDifferenceLowerCard)
        }

    return (
    <div className="w-full h-full flex flex-row mt-3">
        <div 
            className={"text-lg flex flex-row basis-4/5 justify-center items-center p-3 rounded-md"}
            style={{backgroundColor: cardColorStyle}} 
            >
            <span className="flex basis-1/6 justify-center">{firstColumn}</span>
            <div className="flex flex-col basis-4/6 justify-center">
                <span className="">{seconColumn}</span>
                <span className="text-sm">{descriptionSecondColumn}</span>
            </div>
            <span className="flex basis-1/6 justify-center">{thirdColumn}</span>
            <span className="flex basis-1/6 justify-center ml-1">{fourthColumn}</span>
        </div>
        <div className="h-auto items-center flex basis-1/5 flex-col justify-between">
            { informationUpperCard !== undefined && informationUpperCard !== "" ?
                <div
                    style={{backgroundColor: colorUpperCard}} 
                    className={`relative right-6 bottom-7 h-fit w-fit p-2 rounded-md`}>
                        {informationUpperCard}
                </div>
                :
                <div
                    style={{backgroundColor: 'transparent'}} 
                    className={`relative right-6 bottom-7 h-fit w-fit p-2 rounded-md`}>
                </div>
            }
            { informationLowerCard !== undefined && informationLowerCard !== "" ?                
                <div 
                    style={{backgroundColor: colorLowerCard}} 
                    className={`relative right-6 top-6 h-fit w-fit p-2 rounded-md`}>
                    {informationLowerCard}
                </div> 
                :
                <div 
                    style={{backgroundColor: 'transparent'}} 
                    className={`relative right-6 top-6 h-fit w-fit p-2 rounded-md`}>
                </div> 
            }
        </div>
    </div>
    )
}


export default CardRouteList;