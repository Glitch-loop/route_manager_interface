import Link from "next/link";
import ButtonWithNotification from "../general/ButtonWithNotificaion";




const Sidebar = () => {

    // const optionsMenu:any[] = [
    //     {
    //         optionName: 'Menú principal'
    //     },
    //     {
    //         optionName: 'Comisiones'
    //     },
    //     {
    //         optionName: 'Auditoria'
    //     },
    //     {
    //         optionName: 'Operaciones de inventario'
    //     },
    //     {
    //         optionName: 'Consultar informacion'
    //     },
    // ]

    return (
        <aside className={`h-full w-full
            bg-system-secondary-background
            flex flex-col items-center 
            `}>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Menú principal"}
                        notificationAlert={true}
                        href={"/"}/>
                </div>
                <div className="my-2  w-11/12">
                    <ButtonWithNotification 
                        label={"Comisiones"}
                        href={"/comissions"}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification label={"Auditoria"}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification label={"Operaciones de inventario"}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Consultar información"}
                        href={"/consult_information"}/>
                </div>

        </aside>
    )
}


export default Sidebar;