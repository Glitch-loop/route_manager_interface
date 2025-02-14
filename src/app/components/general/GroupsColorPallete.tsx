'use client'

import { useState } from 'react';
import { SketchPicker } from 'react-color';
import { colors, Dialog } from '@mui/material';
import IconButtonWithNotification from './IconButtonWithNotification';
import { MdCancel } from "react-icons/md";
import { IColorOption } from '@/app/interfaces/interfaces';

function GroupsColorPallete({
    palleteTitle,
    itemsColor,
    onChangeColor,
}:{
    palleteTitle:string
    itemsColor:IColorOption[],
    onChangeColor:any,
}) {
    const [showDialog, setShowDialog] = useState<boolean>(false);

    const [currentColor, setCurrentColor]  = useState<IColorOption|undefined>()
    const [newColor, setNewColor]  = useState<string>('#fff')
    
    const handleOnConfirmPickedColor = () => {
        setShowDialog(!showDialog);
        if (currentColor !== undefined) {
            currentColor.color = newColor;
            onChangeColor(currentColor)
        }
    };

    const handlerOnSelectColor = (selectedColor:IColorOption) => {
        setShowDialog(!showDialog);
        setCurrentColor(selectedColor);
    }

    const handlerCancelColorselection = () => {
        setShowDialog(!showDialog);
        setCurrentColor(undefined);
    }

    const handlerPickColor = (color:any) => {
        setNewColor(color.hex);
    }

    return (
        <div className="relative w-64 flex flex-col bg-system-secondary-background p-2 rounded-md">
            <Dialog className='mt-28 flex flex-col' open={showDialog}>
                <div className='flex justify-end my-1 mr-1'>
                    <IconButtonWithNotification
                        onPress={() => handlerCancelColorselection()}
                        notificationAlert={false}
                        size={'small'}
                        backGroundColor={'danger-2'}>
                        <MdCancel />
                    </IconButtonWithNotification>
                </div>
                <SketchPicker
                    color={ newColor }
                    onChangeComplete={ handlerPickColor }
                />
                <div className='w-full flex flex-row'>
                    <button 
                        onClick={() => handleOnConfirmPickedColor()}
                        className=' bg-slate-200 hover:bg-slate-300  flex basis-1/2 justify-center'>
                            Aceptar
                    </button>
                    <button 
                        onClick={() => handlerCancelColorselection()}
                        className='bg-slate-200 hover:bg-slate-300 flex basis-1/2 justify-center'>
                            Cancelar
                    </button>
                </div>
            </Dialog>
            <span className="text-2xl">{palleteTitle}</span>
            { itemsColor.length > 0 &&
                <div className="flex flex-row">
                    <div className="flex basis-3/4"></div>
                    <div className="flex basis-1/4 justify-center text-lg font-bold">Color</div>
                </div>
            }
            { itemsColor.length > 0 ?
            <div>
                { itemsColor.map((item:IColorOption) => {
                    return (
                        <div key={item.idColorOption} className="flex flex-row">
                            <div className="flex flex-col basis-3/4">
                                <span className='text-lg'>{item.title}</span>
                                { item.description !== undefined &&
                                    <span className='text-sm'>{item.description}</span>
                                }
                            </div>
                            <div className="flex basis-1/4 justify-center items-center">
                                <button
                                    onClick={() => handlerOnSelectColor(item)}
                                    className=' border-solid border-2 border-black p-3 rounded-md' style={{background: `${item.color}`}}></button>
                            </div>
                        </div> 
                    )
                })}
            </div>
                :
            <div>No hay opciones para mostrar</div>

            }
        </div>
    )
}

export default GroupsColorPallete;
