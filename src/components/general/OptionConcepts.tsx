'use client'

import { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Checkbox, Dialog, Switch } from '@mui/material';
import IconButtonWithNotification from './IconButtonWithNotification';
import { MdCancel } from "react-icons/md";
import { IColorOption, IConceptOption } from '@/interfaces/interfaces';
import ButtonWithNotification from './ButtonWithNotificaion';

interface IConcept {
    idConcept:string, 
    activated: boolean,
}

function deterimneExistingConcepts(arrConcepts:IConceptOption[]):IConcept[] {
    return arrConcepts.map((concept) => {return { idConcept: concept.idConcept, activated: false} })
} 


function determineExistingOptions(arrConcepts:IConceptOption[]):IConcept[] { 

}

function OptionConcepts({
    layoutTitle,
    conceptsToConfigure,
    setConceptsToConfigure,
}:{
    layoutTitle:string
    conceptsToConfigure:IConceptOption[],
    setConceptsToConfigure:(changedConcepts:IConceptOption[]) => void,
}) {

    const [existingConcepts, setExistingConcepts] = useState<IConcept[]>(deterimneExistingConcepts(conceptsToConfigure))

    // Function to activate a single option of a particular concept.
    const handlerChangeConfiguration = (idConceptToChange:string, idConfigurationToChange:string) => {
        let isAllOptionFromSectionActive:boolean = true;

        // Configuring the option in the section
        setConceptsToConfigure(
            conceptsToConfigure.map((concept:IConceptOption) => {
                const { idConcept, conceptName, description, options } = concept;

                if (idConceptToChange === idConcept) {
                    return { 
                        idConcept: idConcept, 
                        conceptName: conceptName, 
                        description: description,
                        options: options.map((option) => {
                            const { idOption, optionName, selected } = option;
                            
                            if (idOption === idConfigurationToChange) {
                                const finalState = !selected;
                                
                                if (finalState === false) {
                                    isAllOptionFromSectionActive = false;
                                } else { /* Do nothing */}
                                return {
                                    idOption: idOption,
                                    optionName: optionName,
                                    selected: finalState
                                }
                            } else {
                                if (selected === false) {
                                    isAllOptionFromSectionActive = false;
                                } else { /* Do nothing */}
                                return { ...option }
                            }
                        })
                     }

                } else {
                    return { ...concept }
                }
            })
        )

        // Desactivating the select checkbox of the section
        setExistingConcepts(existingConcepts.map((concept:IConcept) => {
            const { idConcept } = concept;
            if (idConceptToChange === idConcept) {
                return {
                    idConcept: idConcept,
                    activated: isAllOptionFromSectionActive
                };
            } else {
                return { ...concept };
            }
        }))
    }

    // Function to activate all the option of a particular group
    const handlerActionOverSection = (idConceptToChange:string) => {
        let isConceptGroupActivated:boolean = false;

        // Update to active concept checkbox
        setExistingConcepts(existingConcepts.map((concept:IConcept) => {
            const { idConcept, activated } = concept;
            if (idConceptToChange === idConcept) {
                isConceptGroupActivated = !activated;
                return {
                    idConcept: idConcept,
                    activated: !activated
                };
            } else {
                return { ...concept };
            }
        }))

        // Update the concepts
        setConceptsToConfigure(
            conceptsToConfigure.map((concept:IConceptOption) => {            
                const { idConcept, conceptName, description, options } = concept;
    
                if (idConceptToChange === idConcept) {
                    return { 
                        idConcept: idConcept, 
                        conceptName: conceptName, 
                        description: description,
                        options: options.map((option) => {
                            const { idOption, optionName } = option;
                            return {
                                idOption: idOption,
                                optionName: optionName,
                                selected: isConceptGroupActivated
                            }
                        })
                     }
    
                } else {
                    return { ...concept }
                }
            })
        )
    }

    // Function to activate by type of actions


    return (
        <div className="relative w-64 flex flex-col bg-system-secondary-background p-2 rounded-md">
            <span className="text-2xl">{layoutTitle}</span>
            <div className='w-full flex flex-row justify-around'>
                <ButtonWithNotification 
                    label={'Activar todo'}
                    notificationAlert={false}/>
                <ButtonWithNotification 
                    label={'Desactivar todo'}
                    notificationAlert={false}/>
            </div>
            { conceptsToConfigure.length > 0 &&
                <div className="flex flex-row">
                    <div className="flex basis-3/4"></div>
                    <div className="flex basis-1/4 justify-center text-lg text-center font-bold">Activar todo</div>
                </div>
            }
            { conceptsToConfigure.length > 0 ?
            <div>
                { conceptsToConfigure.map((concept:IConceptOption) => {
                    const {idConcept, conceptName, description} = concept;

                    const existingConceptFound:IConcept|undefined = existingConcepts
                        .find((existingConcept) => {return existingConcept.idConcept === idConcept});

                    return (
                        <div key={idConcept} className="flex flex-col">
                            <div className='w-full flex flex-row'>
                                <div className="flex flex-col basis-3/4">
                                    <span className='text-lg'>{conceptName}</span>
                                    { concept.description !== undefined &&
                                        <span className='text-sm'>{description}</span>
                                    }
                                </div>
                                { existingConceptFound !== undefined &&
                                    <div className='flex basis-1/4 justify-center items-center'>
                                        <Checkbox 
                                            onClick={() => { handlerActionOverSection(idConcept) }}
                                            checked={existingConceptFound.activated}/>
                                    </div>
                                }
                            </div>
                            <div className="justify-center items-center flex basis-1/4 flex-col">
                                { concept.options.length > 0 &&
                                    concept.options.map((option) => {
                                        const { idOption, optionName, selected} = option;
                                        return (
                                            <div key={idOption} className={'w-full flex flex-row'}>
                                                <div className='flex basis-1/2 items-center'>
                                                    <span>{optionName}</span>
                                                </div>
                                                <div className='flex basis-1/2 items-center'>
                                                    <Switch
                                                        onClick={() => { handlerChangeConfiguration(idConcept, idOption) }}
                                                        checked={selected}/>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
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

export default OptionConcepts;
