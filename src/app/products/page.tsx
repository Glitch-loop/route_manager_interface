"use client";
import { useState, useEffect } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { IProduct } from "@/interfaces/interfaces";
import { getAllProducts, insertProduct, updateProduct, deleteProduct } from "@/controllers/ProductController";

import { getAllConceptOfProducts } from "@/controllers/InventoryController";

import DragDropProducts from "@/components/general/dragAndDropComponent/DragDropProducts";

export default function ProductPage() {
  const [products, setProducts] = useState<IProduct[]|undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState<IProduct & { comission_to_pay: number }>({
    id_product: "",
    product_name: "",
    barcode: "",
    weight: "",
    unit: "",
    comission: 0,
    price: 0,
    product_status: 1,
    order_to_show: 0,
    comission_to_pay: 0
  });


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getAllConceptOfProducts();
    setProducts(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    const newFormData:IProduct& { comission_to_pay: number } = { ...formData, [name]: value };
    const x = Number(value) || 0; // Ensure numeric values


    if (name === "price" || name === "comission") {
        newFormData.comission_to_pay = (newFormData.price * newFormData.comission) / 100;
      }
    
    if (name === "comission_to_pay") {
    if (formData.price > 0) {
        newFormData.comission = (x * 100) / formData.price; // Calculate comission
    } else if (formData.comission > 0) {        
        newFormData.price = (x * 100) / formData.comission; // Calculate price
    }
    }
    
    setFormData({ ...newFormData  });
  };

  const handleRowDoubleClick = (product: IProduct) => {
    setSelectedProduct(product);
    setFormData(product);
  };

  const handleInsert = async () => {
    await insertProduct(formData);
    fetchProducts();
    handleCancel();
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    await updateProduct(formData);
    fetchProducts();
    handleCancel();
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.id_product);
    fetchProducts();
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setFormData({
      id_product: "",
      product_name: "",
      barcode: "",
      weight: "",
      unit: "",
      comission: 0,
      price: 0,
      product_status: 1,
      order_to_show: 0,
      comission_to_pay: 0,
    });
  };

  return (
    <div className="w-full h-full flex  flex-col p-4">
        <div className="flex flex-row w-full">
            {/* Left Side - Table */}
            <div className="flex-1 basis-1/3 p-2 ">
                <Paper  sx={{width: '100%', overflow: 'hidden'}}>
                    <TableContainer component={Paper}  sx={{maxHeight: 337}}>
                    <Table stickyHeader>
                        <TableHead>
                        <TableRow>
                            <TableCell>Product Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Comission</TableCell>
                        </TableRow>
                        </TableHead>
                        { products &&
                            <TableBody>
                            {products.map((product) => (
                            <TableRow key={product.id_product} onDoubleClick={() => handleRowDoubleClick(product)} className="cursor-pointer">
                                <TableCell>{product.product_name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>{product.comission * 100}%</TableCell>
                            </TableRow>
                            ))}
                            </TableBody>
                        }
                    </Table>
                    </TableContainer>
                </Paper>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 basis-2/3 p-4 flex flex-col gap-4">
                <TextField label="Nombre de producto" name="product_name" value={formData.product_name} onChange={handleInputChange} fullWidth />
                <TextField label="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} fullWidth />
                
                <div className="flex flex-row justify-around">
                    <TextField 
                        label="Peso" name="weight" value={formData.weight} onChange={handleInputChange} />
                    <TextField label="Unidad" name="unit" value={formData.unit} onChange={handleInputChange}  />
                </div>
                <div className="flex flex-row justify-around">
                    <div className="flex flex-row items-center">
                        <span className="mr-2 text-2xl">$</span>
                        <TextField label="Precio" name="price" type="number" value={formData.price} onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-row items-center">
                        <TextField label="Comision" name="comission" type="number" value={formData.comission} onChange={handleInputChange} />
                        <span className="ml-2 text-2xl">%</span>
                    </div>
                    <div className="flex flex-row items-center">
                        <span className="mr-2 text-2xl">$</span>
                        <TextField label="Comision a pagar" name="comission_to_pay" type="number" value={formData.comission_to_pay} onChange={handleInputChange} />
                    </div>

                </div>
                {/* <TextField label="Order to Show" name="order_to_show" type="number" value={formData.order_to_show} onChange={handleInputChange} fullWidth /> */}

                {/* Buttons */}
                <div className="flex gap-4">
                <Button variant="contained" color="warning" onClick={handleCancel}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleInsert} disabled={!!selectedProduct}>Insert</Button>
                <Button variant="contained" color="secondary" onClick={handleUpdate} disabled={!selectedProduct}>Update</Button>
                <Button variant="contained" color="error" onClick={handleDelete} disabled={!selectedProduct}>Delete</Button>
                </div>
            </div>
        </div>
        <div>
            {products &&
                <DragDropProducts 
                products={products}
                onSave={(items) => {console.log(items)}}/>

            }
        </div>
    </div>
  );
}
