'use client'
import { Button } from "@mui/material";



function ButtonWithNotification({label, notificationAlert}:{label:string, notificationAlert?:boolean}) {
    const handler = () => {

    }
    return (
        <div className="w-full relative">
            { notificationAlert &&
                <div className={`absolute right-1 mt-1 bg-red-500 p-1.5 rounded-lg animate-ping`}/>
            }
            { notificationAlert &&
                <div className={`absolute right-1 mt-1 bg-red-500 p-1.5 rounded-lg`}/>
            }
            <button
            onClick={handler}
            className={`w-full bg-system-third-background p-3 rounded-md
            hover:opacity-75 duration-200`}>
                {label}
            </button>

        </div>
        // <p>This is a button</p>
    )
}


export default ButtonWithNotification;