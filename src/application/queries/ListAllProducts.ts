import { inject, injectable } from "tsyringe";

// Interfaces
import { ProductRepository } from "@/core/interfaces/ProductRepository";

// DTOs
import ProductDTO from "../dto/ProductDTO";

// Utils
import { TOKENS} from "@/infrastructure/di/tokens";
import { Product } from "@/core/entities/Product";
import { MapperDTO } from "../mappers/MapperDTO";

@injectable()
export default class ListAllProducts {
    constructor(
        @inject(TOKENS.SupabaseProductRepository) private readonly productRepository: ProductRepository,
        private readonly mapperDTO: MapperDTO
    ) {}

    async execute(status_product: boolean): Promise<ProductDTO[]> {
        const products:Product[] = await this.productRepository.retrieveAllProducts(status_product);
        return products.map((p) => this.mapperDTO.toDTO(p));   
    }
}