



function HeaderRouteList({
    firstColumn, 
    seconColumn, 
    thirdColumn, 
    fourthColumn
    }:{
    firstColumn:string, 
    seconColumn:string, 
    thirdColumn:string, 
    fourthColumn:string
    }) {
    return (
        <div className="text-xl w-full flex flex-row justify-center items-center p-3 bg-orange-400 rounded-md">
            <span className="flex basis-1/6 justify-center">{firstColumn}</span>
            <span className="flex basis-4/6 justify-center">{seconColumn}</span>
            <span className="flex basis-1/6 justify-center">{thirdColumn}</span>
            <span className="flex basis-1/6 justify-center">{fourthColumn}</span>
        </div>
    )
}

export default HeaderRouteList;
