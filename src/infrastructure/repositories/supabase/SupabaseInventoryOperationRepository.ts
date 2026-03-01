// Libraries
import { injectable, inject } from 'tsyringe';

// Infrastructure
import { SupabaseDataSource } from '@/infrastructure/datasources/SupabaseDataSource'; 

// Models
import InventoryOperationModel from '@/infrastructure/persitence/model/InventoryOperationModel';
import InventoryOperationDescriptionModel from '@/infrastructure/persitence/model/InventoryOperationDescriptionModel';

// Utils
import { TOKENS } from '@/infrastructure/di/tokens';

@injectable()
export class SupabaseInventoryOperationRepository {
    constructor(@inject(TOKENS.SupabaseDataSource) private readonly dataSource: SupabaseDataSource) { }

    private get supabase() {
        return this.dataSource.getClient();
    }

}