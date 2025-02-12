'use client'

import { IconBase, IconType } from "react-icons";
import { MdOutlineQuestionMark } from "react-icons/md";


function IconButtonWithNotification({children, notificationAlert}:{children:any, notificationAlert?:boolean}) {
    console.log(children)
    return (
        //absolute 
        <div className="relative w-auto">
            <div className="relative">
                { notificationAlert &&
                    <div className={`absolute left-9  bg-red-500 p-2 rounded-lg animate-ping`}/>
                }
                { notificationAlert &&
                    <div className={`absolute left-9 bg-red-500 p-2 rounded-lg`}/>
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