import { RepositoryFactory } from "@/repositories/RepositoryFactory";

// Interfaces
import {
    IProduct,
    IResponse,
} from '@/interfaces/interfaces';

// Utils
import {
  getDataFromApiResponse,
} from '@/utils/responseUtils';


// Initializing database repository.
const repository = RepositoryFactory.createRepository('supabase');

export async function insertProduct(product:IProduct):Promise<IResponse<IProduct>> {
    const productToAdd:IProduct = {
        ...product,
        product_status: 1
    }
    return await repository.insertProduct(productToAdd);
};

export async function updateProduct(product:IProduct):Promise<IResponse<IProduct>> {
    const productToUpdate:IProduct = {
        ...product,
    }
    return await repository.updateProduct(productToUpdate);
}; 

export async function deleteProduct(product:IProduct):Promise<IResponse<IProduct>> {
    const productToDelete:IProduct = {...product, product_status: 0 };
    return await repository.updateProduct(productToDelete);
};


export async function getAllConceptOfProducts(excludeInactiveProducts:boolean):Promise<IProduct[]> {
    let products:IProduct[] = []
    const allConceptOfProductsResponse:IResponse<IProduct[]> = await repository.getAllProducts();
    const allConceptOfProducts:IProduct[] = getDataFromApiResponse(allConceptOfProductsResponse);

    if (excludeInactiveProducts) {
        products = allConceptOfProducts.filter((item:IProduct) => item.product_status !== 0);
    } else {
        products = allConceptOfProducts.map((item:IProduct) => item)
    }
    return products;
}