import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

// Interfaces
import {
    IRouteDayStores,
    IStore,
    IDayGeneralInformation,
    IDay,
    IRouteDay,
    IRoute,
    IStoreStatusDay,
    IResponse,
    IUser,
} from '@/interfaces/interfaces';

// Components
import IconButtonWithNotification from "../general/IconButtonWithNotification";
import { FaChevronRight } from "react-icons/fa6";
import { cast_string_to_timestamp_standard_format } from "@/utils/dateUtils";
import { capitalizeFirstLetter, capitalizeFirstLetterOfEachWord } from "@/utils/generalUtils";


function TableSearchVisualizationWorkDay({
        workDays,
        vendors,
        routes,
        maxHeight,
        onSelectWorkDay,
    }:{
        workDays:(IRoute&IDayGeneralInformation&IDay&IRouteDay)[],
        vendors:IUser[],
        routes:IRoute[],
        maxHeight:number,
        onSelectWorkDay: (workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay) => void
    }) {
    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}}>
            <TableContainer sx={{ maxHeight: maxHeight }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Fecha de inicio
                            </TableCell>
                            <TableCell>
                                Fecha final
                            </TableCell>
                            <TableCell>
                                Ruta
                            </TableCell>
                            <TableCell>
                                Vendedor
                            </TableCell>
                            <TableCell>
                                Comision pagada
                            </TableCell>
                            <TableCell>
                                Consultar
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { workDays.map((workDay) => {
                            let vendorName:string = ""
                            let routeName:string = ""
                            let paidComission:string = ""
                            
                            const { id_work_day, start_date, finish_date, id_vendor, id_route, id_comission } = workDay
                            const indexVendor:number = vendors.findIndex((vendor) => { return id_vendor === vendor.id_vendor;});
                            const indexRoute:number = routes.findIndex((route) => { return id_route === route.id_route;});

                            if (indexVendor !== -1) {
                                vendorName = vendors[indexVendor].name;
                            } else {
                                vendorName = "No disponible";
                            }

                            if (indexRoute !== -1) {
                                routeName = routes[indexRoute].route_name;
                            } else {
                                routeName = "No disponible";
                            }

                            if (id_comission === null) {
                                paidComission = "No";
                            } else {
                                paidComission = "Si";
                            }

                            return (
                            <TableRow key={id_work_day}>
                                <TableCell>{cast_string_to_timestamp_standard_format(start_date)}</TableCell>
                                <TableCell>{cast_string_to_timestamp_standard_format(finish_date)}</TableCell>
                                <TableCell>{capitalizeFirstLetter(routeName)}</TableCell>
                                <TableCell>{capitalizeFirstLetterOfEachWord(vendorName)}</TableCell>
                                <TableCell>{paidComission}</TableCell>
                                <TableCell>
                                    <IconButtonWithNotification
                                        size="small"
                                        backGroundColor='info'
                                        onPress={() => { onSelectWorkDay(workDay) }}
                                        >
                                        <FaChevronRight />
                                    </IconButtonWithNotification>
                                </TableCell>
                            </TableRow>

                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

export default TableSearchVisualizationWorkDay;