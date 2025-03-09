import { capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";



export default function InfoStoreHover({store_name, position_in_route}:{store_name:string, position_in_route:string}) {
    return (
        <div className="flex flex-col">
            <span className="text-xl">Nombre: {capitalizeFirstLetterOfEachWord(store_name)}</span>
            <span className="text-lg font-bold">Posición de la tienda: {position_in_route}</span>
        </div>
    )
}