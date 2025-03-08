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

import RouteDayManagerView  from "@/components/routes/RouteDayManagerView"

export default function RoutesPage() {


  return (
    <div className="flex w-full h-full p-4">
        <RouteDayManagerView/>
    </div>
  );
}
