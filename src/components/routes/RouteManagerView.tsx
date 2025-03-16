"use client";
// Libraries
import { useState, useEffect } from "react";

// Interfaces
import { 
  IResponse,
  IRoute,
  IUser
} from "@/interfaces/interfaces";

// Styles
import "react-toastify/dist/ReactToastify.css";

// Controllers
import { getAllRoutes, insertRoute, updateRoute, deleteRoute } from "@/controllers/RoutesController";
import { getAllVendors } from "@/controllers/VendorController";

// Utils
import { capitalizeFirstLetter } from "@/utils/generalUtils";

// Components
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import { apiResponseStatus } from "@/utils/responseUtils";
import { ToastContainer, toast } from "react-toastify";

export default function RouteManagerView() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);

  const [formData, setFormData] = useState<IRoute>({
    id_route: "",
    route_name: "",
    description: "",
    route_status: 1,
    id_vendor: "",
  });

  useEffect(() => {
    fetchRoutes();
    fetchUsers();
  }, []);

  const fetchRoutes = async () => {
    const data = await getAllRoutes();
    setRoutes(data);
  };

  const fetchUsers = async () => {
    const data = await getAllVendors();
    setUsers(data);
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = () => {
    setFormData((prev) => ({ ...prev, route_status: prev.route_status === 1 ? 0 : 1 }));
  };

  const handleRowDoubleClick = (route: IRoute) => {
    setSelectedRoute(route);
    setFormData(route);
  };

  const isRouteInputCorrect = (route:IRoute, showToast: boolean):boolean => {
    let toastMessage:string = '';
    let result:boolean = true;

    if (route.route_name === '') { toastMessage = "Debes proporcionar un nombre a la nueva ruta."; result = false; }
      
    if (route.id_vendor === '') {toastMessage = "Debes seleccionar un vendedor."; result = false;}

    const routeWithSameName:IRoute|undefined = routes.find((currentRoute) => currentRoute.route_name === route.route_name);
    if(routeWithSameName) {toastMessage = "El nombre de la ruta tiene que ser unico."; result = false;}

    if (showToast) toast.error(toastMessage, { position: 'top-right' });
    
    return result;
  }


  const handleInsert = async () => {
    if (!isRouteInputCorrect(formData, true)) return;

    const responseRoute:IResponse<IRoute> = await insertRoute(formData);

    if (apiResponseStatus(responseRoute, 201)) {
      toast.success("La ruta se a agregado correctamente.", { position: 'top-right' })
      fetchRoutes();
      handleCancel();
    } else {
      toast.error("Ha habido un error al momento de agregar la ruta. Intente nuevamente.", { position: 'top-right' })
    }
  };

  const handleUpdate = async () => {
    if (!selectedRoute || !isRouteInputCorrect(formData, true)) return;

    const responseRoute:IResponse<IRoute> = await updateRoute(formData);

    if (apiResponseStatus(responseRoute, 200)) {
      toast.success("Se ha actualizado la ruta correctamente.", { position: 'top-right' })
      fetchRoutes();
      handleCancel();
    } else {
      toast.error("Ha habido un error al momento de actualizar la ruta. Intente nuevamente.", { position: 'top-right' })
    }
  };

  const handleCancel = () => {
    setSelectedRoute(null);
    setFormData({
      id_route: "",
      route_name: "",
      description: "",
      route_status: 1,
      id_vendor: "",
    });
  };

  return (
    <div className="flex w-full h-full p-4">
      {/* Left Side - Table */}
      <div className="flex-1 basis-1/3 p-2">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre de ruta</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Estatus</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id_route} onDoubleClick={() => handleRowDoubleClick(route)} className="cursor-pointer">
                  <TableCell>{capitalizeFirstLetter(route.route_name)}</TableCell>
                  <TableCell>{capitalizeFirstLetter(route.description)}</TableCell>
                  <TableCell>{users.find((user) => user.id_vendor === route.id_vendor)?.name || "No asignado"}</TableCell>
                  <TableCell>{capitalizeFirstLetter(route.route_status ? 'activa' : 'inactiva')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 basis-2/3 p-4 flex flex-col gap-4">
        <TextField label="Nombre de la ruta" name="route_name" value={formData.route_name} onChange={handleInputTextChange} fullWidth />
        <TextField label="Descripción" name="description" value={formData.description} onChange={handleInputTextChange} fullWidth />
        
        {/* Route Status Switch */}
        <div className="flex items-center gap-4">
          <span>Estado de la ruta:</span>
          <Switch checked={formData.route_status === 1} onChange={handleSwitchChange} />
          <span>{formData.route_status === 1 ? "Activo" : "Inactivo"}</span>
        </div>

        {/* Vendor Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Vendedor</InputLabel>
          <Select name="id_vendor" value={formData.id_vendor} onChange={handleInputSelectChange}>
            {users.map((user) => (
              <MenuItem key={user.id_vendor} value={user.id_vendor}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button variant="contained" color="warning" onClick={handleCancel}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleInsert} disabled={!!selectedRoute}>Insertar</Button>
          <Button variant="contained" color="info" onClick={handleUpdate} disabled={!selectedRoute}>Actualizar</Button>
        </div>
      </div>
    </div>
  );
}
