"use client";
import { useState, useEffect } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { IUser } from "@/interfaces/interfaces";
import { getAllUsers, insertUser, updateUser, deleteUser } from "@/controllers/VendorController";

export default function UserPage() {
  const [users, setUsers] = useState<IUser[]|undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<IUser>({
    id_vendor: "",
    cellphone: "",
    name: "",
    password: "",
    status: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRowDoubleClick = (user: IUser) => {
    setSelectedUser(user);
    setFormData(user);
  };

  const handleInsert = async () => {
    await insertUser(formData);
    fetchUsers();
    handleCancel();
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    await updateUser(formData);
    fetchUsers();
    handleCancel();
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.id_vendor);
    fetchUsers();
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setFormData({
      id_vendor: "",
      cellphone: "",
      name: "",
      password: "",
      status: 1,
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
                <TableCell>Name</TableCell>
                <TableCell>Cellphone</TableCell>
              </TableRow>
            </TableHead>
            { users &&
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id_vendor} onDoubleClick={() => handleRowDoubleClick(user)} className="cursor-pointer">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.cellphone}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            }
          </Table>
        </TableContainer>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 basis-2/3 p-4 flex flex-col gap-4">
        <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} fullWidth />
        <TextField label="Cellphone" name="cellphone" value={formData.cellphone} onChange={handleInputChange} fullWidth />
        <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} fullWidth />

        {/* Buttons */}
        <div className="flex gap-4">
          <Button variant="contained" color="warning" onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleInsert} disabled={!!selectedUser}>Insert</Button>
          <Button variant="contained" color="secondary" onClick={handleUpdate} disabled={!selectedUser}>Update</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={!selectedUser}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
