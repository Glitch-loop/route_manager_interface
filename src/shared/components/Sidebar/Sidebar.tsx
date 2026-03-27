import ButtonWithNotification from "../../../components/general/ButtonWithNotificaion";
import Link from 'next/link'

const Sidebar = () => {
    return (
        <aside className={`h-full w-full flex flex-col items-center 
            `}>
                <div className="my-2 w-11/12">
                    <Link href="/">Menú principal</Link>
                    {/* <ButtonWithNotification 
                        label={"Menú principal"}
                        notificationAlert={true}
                        href={"/"}/> */}
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
                <div className="my-2 w-11/12">
                    <Link href="/routes">Administración de rutas</Link>
                    {/* <ButtonWithNotification 
                        label={"Administración de rutas"}
                        href={"/routes"}/> */}
                </div>
                <div className="my-2 w-11/12">
                    <Link href="/route_administration">Rutas</Link>
                    {/* <ButtonWithNotification 
                        label={"Rutas"}
                        href={"/route_administration"}/> */}
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Administración de productos"}
                        href={"/products"}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Administración de vendedores"}
                        href={"/vendors"}/>
                </div>
                <div className="my-2 w-11/12">
                    <ButtonWithNotification 
                        label={"Analiticas"}
                        href={"/analytics"}/>
                </div>
        </aside>
    )
}


export default Sidebar;