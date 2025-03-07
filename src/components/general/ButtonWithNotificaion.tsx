'use client'
import Link from "next/link";

function ButtonWithNotification(
    {
        label, 
        href,
        notificationAlert,
        handlerPress,
    }:{
        label:string,
        href?:string,
        notificationAlert?:boolean
        handlerPress?: () => void
    }) {

    return (
        <div className="w-full relative">
            { notificationAlert &&
                <div className={`absolute right-1 mt-1 bg-red-500 p-1.5 rounded-lg animate-ping`}/>
            }
            { notificationAlert &&
                <div className={`absolute right-1 mt-1 bg-red-500 p-1.5 rounded-lg`}/>
            }
            { href === undefined ?
                <button
                onClick={handlerPress}
                className={`w-full bg-system-third-background text-center p-3 rounded-md hover:opacity-75 duration-200`}>
                    <span>{label}</span>
                </button> :
                <Link
                    className={`w-full flex basis-full justify-center bg-system-third-background text-center p-3 rounded-md hover:opacity-75 duration-200`}
                    href={href}>
                        {label}
                </Link>
            }
        </div>

    )
}


export default ButtonWithNotification;