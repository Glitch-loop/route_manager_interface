"use client";
// Libraries
import { useState, useEffect } from "react";
import { generateUUIDv4 } from "@/utils/generalUtils";
import "react-toastify/dist/ReactToastify.css";

// Interfaces
import { ICatalogItem, IProduct, IResponse } from "@/interfaces/interfaces";

// Controllers
import { insertProduct, updateProduct, deleteProduct, getAllConceptOfProducts } from "@/controllers/ProductController";

// Components
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment } from "@mui/material";
import DragDropCatalogItems from "@/components/general/dragAndDropComponent/DragDropCatalogItems";
import { ToastContainer, toast } from "react-toastify";
import { apiResponseStatus } from "@/utils/responseUtils";


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
    const comission:number = product.comission * 100
    const comissionToPay:number = (product.price * comission) / 100;
    setFormData({...product, comission: comission, comission_to_pay: comissionToPay});
  };

    const validateCorrectProductInputs = (product:IProduct & { comission_to_pay: number }):void => {
        if (product.product_name === "") toast.error("El 'nombre del producto' no puede ir vacío.", { position: 'top-right' });
        if (product.comission < 0) toast.error("La comisión a pagar no puede ser negativa.", { position: 'top-right' });
        if (product.price < 0) toast.error("El precio a pagar no puede ser negativo.", { position: 'top-right' });
    }

    const isProductInputCorrect = (product:IProduct & { comission_to_pay: number }):boolean => {
        let result:boolean = true;
        if (product.product_name === "") result = false;
        if (product.comission < 0) result = false;
        if (product.price < 0) result = false;

        return result;
    }


  const handleInsert = async () => {

    validateCorrectProductInputs(formData);

    if (isProductInputCorrect(formData)) {
        let lastPosition:number = 0;
    
        if (products === undefined) {
            lastPosition = 0;
        } else {
            products.forEach((product:IProduct) => {
                if (product.order_to_show > lastPosition) {
                    lastPosition = product.order_to_show
                }
            })
    
            lastPosition += 1;
        }
    
        const response:IResponse<IProduct> = await insertProduct({...formData, order_to_show: lastPosition, comission: formData.comission / 100});

        if (apiResponseStatus(response, 201)) {
            toast.success("El producto se a agregado correctamente", { position: 'top-right' })
        } else {
            toast.error("Hubo un error al momento de agregar el producto. Intente nuevamente", { position: 'top-right' })
        }

        fetchProducts();
        handleCancel();
    } else {
        /* Do nothing */
    }
  };

  const handleUpdate = async () => {
    console.log("UPDATE")
    if (!selectedProduct) return;
    console.log("validate")
    validateCorrectProductInputs(formData);

    if (isProductInputCorrect(formData)) {
        const responseUpdate:IResponse<IProduct> = await updateProduct({...formData, comission: formData.comission / 100});

        if (apiResponseStatus(responseUpdate, 201)) {
            toast.success("El producto se a agregado correctamente", { position: 'top-right' })
        } else {
            toast.error("Hubo un error al momento de agregar el producto. Intente nuevamente", { position: 'top-right' })
        }

        fetchProducts();
        handleCancel();
    } else {
        /* Do nothing */
    }

  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct);
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

  const handleUpdateOrder = async (items:ICatalogItem[]) => {
    for (let i = 0; i < items.length; i++) {
        const currentProduct:ICatalogItem = items[i];
        const { id_item, order_to_show} = currentProduct;
        if (products !== undefined) {
            const productFound:IProduct|undefined = products.find((candidateProduct:IProduct) => { return candidateProduct.id_product === id_item;})
    
            if(productFound) {
                if(productFound.order_to_show === currentProduct.order_to_show) {
                    /* Do nothing */
                } else {
                    await updateProduct({
                        ...productFound,
                        order_to_show: order_to_show 
                    });
                }
            } else {
                    /* Product wasn't found. Do nothing*/
            }
        }
    }

    fetchProducts();
  }

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-hidden">
        <ToastContainer />
        <div className="w-full flex flex-row">
            {/* Left Side - Table */}
            <div className="flex-1 basis-1/3 p-2 ">
                <Paper  sx={{width: '100%', overflow: 'hidden'}}>
                    <TableContainer component={Paper}  sx={{maxHeight: 337}}>
                    <Table stickyHeader>
                        <TableHead>
                        <TableRow>
                            <TableCell>Nombre del producto</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Comisión</TableCell>
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
                <TextField label="Nombre de producto" name="product_name" value={formData.product_name || ""} onChange={handleInputChange} fullWidth />
                <TextField label="Barcode" name="barcode" value={formData.barcode || ""} onChange={handleInputChange} fullWidth />
                
                <div className="flex flex-row justify-around">
                    <TextField 
                        label="Peso" 
                        name="weight" 
                        type="number" 
                        value={formData.weight || 0} 
                        onChange={handleInputChange} 
                        slotProps={{input: { endAdornment: <InputAdornment position="start"></InputAdornment>}}}/>
                    <TextField label="Unidad" name="unit" value={formData.unit || ""} onChange={handleInputChange}  />
                </div>
                <div className="flex flex-row justify-around">
                    <TextField 
                        label="Precio" 
                        name="price" 
                        type="number"  
                        value={formData.price || 0} 
                        onChange={handleInputChange} 
                        slotProps={{input: { startAdornment: <InputAdornment position="start">$</InputAdornment>}}} />
                    <TextField 
                        label="Comision" 
                        name="comission" 
                        type="number" 
                        value={formData.comission || 0} 
                        onChange={handleInputChange} 
                        slotProps={{input: { endAdornment: <InputAdornment position="start">%</InputAdornment>}}} />
                    <TextField 
                        label="Comision a pagar" 
                        name="comission_to_pay" 
                        type="number" 
                        value={formData.comission_to_pay || 0} 
                        onChange={handleInputChange} 
                        slotProps={{input: { startAdornment: <InputAdornment position="start">$</InputAdornment>}}}/>
                </div>
                {/* <TextField label="Order to Show" name="order_to_show" type="number" value={formData.order_to_show} onChange={handleInputChange} fullWidth /> */}

                {/* Buttons */}
                <div className="flex gap-4">
                <Button variant="contained" color="warning" onClick={handleCancel}>Cancelar</Button>
                <Button variant="contained" color="success" onClick={handleInsert} disabled={!!selectedProduct}>Insertar</Button>
                <Button variant="contained" color="info" onClick={handleUpdate} disabled={!selectedProduct}>Actualizar</Button>
                <Button variant="contained" color="error" onClick={handleDelete} disabled={!selectedProduct}>Eliminar</Button>
                </div>
            </div>
        </div>
        <div className="w-1/2 flex flex-row basis-1/2 overflow-y-auto">
        {products &&
            <DragDropCatalogItems 
            title={"En este orden apareceran los productos"}
            catalogItems={products.map((product:IProduct) => { return {
                id_item: product.id_product, 
                id_item_in_container: generateUUIDv4(), 
                id_group: '0', 
                item_name: product.product_name, 
                order_to_show: product.order_to_show
            }})}
            onSave={(items:ICatalogItem[]) => {handleUpdateOrder(items)}}/>
        }
        </div>
    </div>
  );
}
