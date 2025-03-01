'use client'
import { useEffect, useState } from "react";


import RouteList from "../components/routes/RouteList";
import IconButtonWithNotification from "../components/general/IconButtonWithNotification";
// import ButtonWithNotification from "./components/ButtonWithNotificaion";

import GroupsColorPallete from "../components/general/ColorGroupsPallete";
import { IColorOption, IConceptOption, IDay, IDayGeneralInformation, IRoute, IRouteDay } from "../interfaces/interfaces";
import TextTable from "../components/general/TextTable";
import SummarizeRouteTransaction from "../components/route_tranactions/SummarizeRouteTransacionsOfTheDay";


import OptionConcepts from "../components/general/OptionConcepts";

import { RepositoryFactory } from "@/repositories/RepositoryFactory";



import { supabase } from "@/lib/supabase";
import TABLES from "@/utils/tables";
import { getDataFromApiResponse } from "@/utils/responseUtils";
import { getOpenWorkDays } from "@/controllers/WorkDayController";

// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

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

const arrConceptOptions:IConceptOption[] = [
  {
    idConcept: "1",
    conceptName: "Ruta 1 - Miercoles",
    description: "Alexis",
    options: [
      {
        idOption: "1",
        optionName: "Mostrar ruta",
        selected: false
      },
      {
        idOption: "2",
        optionName: "Data",
        selected: true
      },
    ]
  }
]

export default function Home() {

  useEffect(() => {
    
    // const channelResponse = repository.suscribeTable('INSERT', TABLES.ROUTE_PATHS, 
    //   (payload) => { console.log("New coordinate: ", payload) }
    // )
    
    // const channel = getDataFromApiResponse(channelResponse);
    
    getOpenWorkDays()
    .then((data) => setOpenWorkDays(data));

    // const handleInsert = (payload) => {
    //       console.log("Something new: ", payload)
    //     }
    
    
    //     supabase
    //       .channel('sellings')
    //       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'route_paths'}, handleInsert)
    //       .subscribe()
    
  }, [])

  const [palleteColors, setPalleteColors] = useState<IColorOption[]>(colors)
  const [conceptOptions, setConceptOptions] = useState<IConceptOption[]>(arrConceptOptions)

  const [openWorkDays, setOpenWorkDays] = useState<(IRoute&IDayGeneralInformation&IDay&IRouteDay)[]|undefined>(undefined)

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
    <div className="h-auto w-auto flex flex-row justify-center items-center">
      <main className="h-auto w-full">
        <div className={`w-full flex flex-row justify-center`}>
          <div className="w-11/12">
            { openWorkDays !== undefined &&
              openWorkDays.map((workday) => {
                const { id_work_day } = workday;
                return <RouteList key={id_work_day} workDay={workday}/>
              })
            }
          </div>
        </div>
      </main>
    </div>
  );
}
