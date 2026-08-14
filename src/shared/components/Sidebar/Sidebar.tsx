import ButtonWithNotification from "../../../components/general/ButtonWithNotificaion";

const Sidebar = () => {
    return (
        <aside className={`h-full w-full flex flex-col items-center 
            `}>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Menú principal"}
                        notificationAlert={true}
                        href={"/"}
                        prefetch={false}/>
                </div>
                <div className="my-2  w-11/12">
                    <ButtonWithNotification 
                        label={"Comisiones"}
                        href={"/comissions"}
                        prefetch={false}/>
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
                        href={"/consult_information"}
                        prefetch={false}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Administración de rutas"}
                        href={"/routes"}
                        prefetch={false}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Rutas"}
                        href={"/route_administration"}
                        prefetch={false}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Administración de productos"}
                        href={"/products"}
                        prefetch={false}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Administración de vendedores"}
                        href={"/vendors"}
                        prefetch={false}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Analiticas"}
                        href={"/analytics"}
                        prefetch={false}/>
                </div>
        </aside>
    )
}


export default Sidebar;