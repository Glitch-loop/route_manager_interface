

function CardRouteList({    
    firstColumn, 
    seconColumn, 
    descriptionSecondColumn, 
    thirdColumn, 
    fourthColumn,
    informationUpperCard,
    informationLowerCard
    }:{
    firstColumn:string, 
    seconColumn:string, 
    descriptionSecondColumn:string, 
    thirdColumn:string, 
    fourthColumn:string
    informationUpperCard?:string,
    informationLowerCard?:string
    }) {
    return (
    <div className="w-full flex flex-row max-h-16 mt-3">
        <div className="text-lg flex flex-row basis-4/5 justify-center items-center p-3 bg-orange-400 rounded-md">
            <span className="flex basis-1/6 justify-center">{firstColumn}</span>
            <div className="flex flex-col basis-4/6 justify-center">
                <span className="">{seconColumn}</span>
                <span className="text-sm">{descriptionSecondColumn}</span>
            </div>
            <span className="flex basis-1/6 justify-center">{thirdColumn}</span>
            <span className="flex basis-1/6 justify-center">{fourthColumn}</span>
        </div>
        <div className="relative flex flex-col basis-1/5 justify-start">
            { informationUpperCard !== undefined && informationUpperCard !== "" &&
                <div className="relative right-6 bottom-5 h-fit w-fit p-2 bg-green-500 rounded-md">
                    {informationUpperCard}
                </div>
            }
            { informationUpperCard !== undefined && informationUpperCard !== "" &&
                <div className="relative right-6 top-4 h-fit w-fit p-2 bg-red-500 rounded-md">
                    {informationLowerCard}
                </div>
            }
        </div>
    </div>
    )
}


export default CardRouteList;