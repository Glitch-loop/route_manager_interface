'use client'

import { deterimneIconSize, determineBackgroundColor } from "@/utils/stylesUtils";
import { MdOutlineQuestionMark } from "react-icons/md";

import { colorTypes, sizeTypes } from "@/interfaces/typesSystem";


function IconButtonWithNotification(
    {
        children,
        onPress,
        notificationAlert,
        backGroundColor,
        size 
    }:{
        children:any,
        onPress:any
        notificationAlert?:boolean,
        backGroundColor:colorTypes
        size:sizeTypes
    }) {

        const bgColor:string = determineBackgroundColor(backGroundColor)
        const iconSize = deterimneIconSize(size);
    return (
        <div className="relative w-auto">
            <div className="relative flex justify-end">
                { notificationAlert &&
                    <div className={`absolute w-0 h-0 p-2 rounded-lg  bg-red-500 animate-ping`}/>
                }
                { notificationAlert &&
                    <div className={`absolute w-0 h-0 p-2 rounded-lg bg-red-500`}/>
                }
            </div>
            { children === undefined ?
                <button 
                    onClick={onPress}
                    className={`${bgColor} ${iconSize} rounded-full hover:opacity-50 duration-200`}>
                    <MdOutlineQuestionMark/>
                </button>
                :
                <button 
                    onClick={onPress}
                    className={`${bgColor} ${iconSize} rounded-full hover:opacity-50 duration-200`}>   
                    {children}
                </button>
            }
        </div>
    )
}



export default IconButtonWithNotification