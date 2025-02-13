'use client'

import { IconBase, IconType } from "react-icons";
import { MdOutlineQuestionMark } from "react-icons/md";


function IconButtonWithNotification({children, notificationAlert}:{children:any, notificationAlert?:boolean}) {
    console.log(children)
    return (
        //absolute 
        <div className="relative w-auto">
            <div className="relative left-9">
                { notificationAlert &&
                    <div className={`absolute w-0 h-0 p-2 rounded-lg  bg-red-500 animate-ping`}/>
                }
                { notificationAlert &&
                    <div className={`absolute w-0 h-0 p-2 rounded-lg bg-red-500`}/>
                }
            </div>
            { children === undefined ?
                <button className="bg-orange-500 text-3xl rounded-full p-3 hover:opacity-50 duration-200">
                    <MdOutlineQuestionMark/>
                </button>
                :
                <button className="bg-orange-500 text-3xl rounded-full p-3 hover:opacity-50 duration-200">   
                    {children}
                </button>
            }
        </div>
    )
}



export default IconButtonWithNotification