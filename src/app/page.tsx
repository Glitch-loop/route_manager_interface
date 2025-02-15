'use client'
import { useState } from "react";


import RouteList from "./components/routes/RouteList";
import IconButtonWithNotification from "./components/general/IconButtonWithNotification";
// import ButtonWithNotification from "./components/ButtonWithNotificaion";

import GroupsColorPallete from "./components/general/GroupsColorPallete";
import { IColorOption } from "./interfaces/interfaces";
import TextTable from "./components/general/TextTable";
import SummarizeRouteTransaction from "./components/route_tranactions/SummarizeRouteTransaction";



const colors:IColorOption[] = [
  {
    idColorOption: '1',
    title: 'Hello world',
    description: 'This is a little description',
    color: '#fafaa'
  },
  {
    idColorOption: '2',
    title: 'Other colors',
    description: 'This is a little description',
    color: '#bababa'
  }
]

export default function Home() {

  const [palleteColors, setPalleteColors] = useState<IColorOption[]>(colors)

  const handlerChangeColor = (selectedOption:IColorOption) => {
      setPalleteColors(palleteColors.map((item:IColorOption) => {
        if (selectedOption.idColorOption === item.idColorOption) {
          return {...selectedOption};
        } else {
          return {...item};
        }
      }))
  }

  return (
    <div className="h-screen w-auto bg-slate-600  flex flex-row justify-center items-center">
      <main className="h-auto w-full">
        <div className={`w-full flex flex-row justify-center`}>
          <div className="w-11/12">
            {/* <RouteList /> */}
            <div className="w-1/2 bg-slate-300">
              <SummarizeRouteTransaction 
                arrayProducts={[]}
                totalSectionCaptionMessage=""/>
            </div>

              
          </div>

        </div>
      </main>
    </div>
  );
}
