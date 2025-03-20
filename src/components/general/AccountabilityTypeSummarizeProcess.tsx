'use client'

import { IAccountabilityItem } from "../../interfaces/interfaces"

function AccountabilityTypeSummarizeProcess({
        titleOfSummarize, 
        contentOfSummariaze
    }:{
        titleOfSummarize:string, 
        contentOfSummariaze:IAccountabilityItem[]
    }) {
    return (
        <div className=" w-full text-base flex flex-col items-center justify-center">
            <span className="w-full flex flex-row justify-start items-start font-bold text-xl">{titleOfSummarize}</span>
            { contentOfSummariaze.map((content:IAccountabilityItem, index) => {
                const {
                    message,
                    value,
                    isUnderline,
                    isBold,
                    isItalic,
                    isSeparateLine,
                } = content
                return (
                    <div key={index} className={`w-full h-full my-1 text-xl flex-col justify-center items-center`}>
                        <div className={`w-full h-full flex flex-row justify-center items-end text-wrap
                            ${isUnderline ? 'underline' : ''}
                            ${isBold ? 'font-bold' : ''}
                            ${isItalic ? 'italic' : ''}
                            `}>
                            <span className={`text-right mr-2 flex basis-3/4 justify-end`}>
                                {message}
                            </span>
                            <span className={`flex basis-1/4`}>
                                {value}
                            </span>
                        </div>
                        { isSeparateLine &&
                            <div className="w-full flex flex-row justify-center items-center">
                                <div className="w-11/12 bg-black py-px my-1"/>
                            </div>
                        }
                    </div>

                )})
            }
        </div>
    )
}

export default AccountabilityTypeSummarizeProcess