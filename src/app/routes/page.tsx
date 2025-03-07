"use client";
import { useState, useEffect } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import { 
    IRoute,
    IUser
 } from "@/interfaces/interfaces";

import { getAllRoutes, insertRoute, updateRoute, deleteRoute } from "@/controllers/RoutesController";
import { getAllVendors } from "@/controllers/VendorController";
import { capitalizeFirstLetter } from "@/utils/generalUtils";

export default function RoutesPage() {
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

  const handleInsert = async () => {
    await insertRoute(formData);
    fetchRoutes();
    handleCancel();
  };

  const handleUpdate = async () => {
    if (!selectedRoute) return;
    await updateRoute(formData);
    fetchRoutes();
    handleCancel();
  };

  const handleDelete = async () => {
    if (!selectedRoute) return;
    await deleteRoute(selectedRoute.id_route);
    fetchRoutes();
    handleCancel();
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
                <TableCell>Description</TableCell>
                <TableCell>Vendor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id_route} onDoubleClick={() => handleRowDoubleClick(route)} className="cursor-pointer">
                  <TableCell>{capitalizeFirstLetter(route.route_name)}</TableCell>
                  <TableCell>{capitalizeFirstLetter(route.description)}</TableCell>
                  <TableCell>{users.find((user) => user.id_vendor === route.id_vendor)?.name || "No asignado"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 basis-2/3 p-4 flex flex-col gap-4">
        <TextField label="Route Name" name="route_name" value={formData.route_name} onChange={handleInputTextChange} fullWidth />
        <TextField label="Description" name="description" value={formData.description} onChange={handleInputTextChange} fullWidth />
        
        {/* Route Status Switch */}
        <div className="flex items-center gap-4">
          <span>Route Status:</span>
          <Switch checked={formData.route_status === 1} onChange={handleSwitchChange} />
          <span>{formData.route_status === 1 ? "Active" : "Inactive"}</span>
        </div>

        {/* Vendor Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Vendor</InputLabel>
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
          <Button variant="contained" color="error" onClick={handleDelete} disabled={!selectedRoute}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}
