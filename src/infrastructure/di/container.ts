import 'reflect-metadata';

// Libraries
import { container } from 'tsyringe'

// DataSources
import { SupabaseDataSource } from '@/infrastructure/datasources/SupabaseDataSource'

// Interfaces
// import { ProductRepository } from '@/core/interfaces/ProductRepository';
// import { ShiftOrganizationRepository } from "@/core/interfaces/ShiftOrganizationRepository";
// import { RouteTransactionRepository } from '@/core/interfaces/RouteTransactionRepository'
// import { IDService } from '@/core/interfaces/IDService'
// import { DateService as IDateService } from '@/core/interfaces/DateService'


// Interfaces
import { RouteRepository } from '@/core/interfaces/RouteRepository'
import { StoreRepository } from '@/core/interfaces/StoreRepository'
import { RouteTransactionRepository } from '@/core/interfaces/RouteTransactionRepository'

// Implementations - Supabase
import { SupabaseRouteRepository } from '@/infrastructure/repositories/supabase/SupabaseRouteRepository'
import { SupabaseStoreRepository } from '@/infrastructure/repositories/supabase/SupabaseStoreRepository'
import { SupabaseRouteTransactionRepository } from '@/infrastructure/repositories/supabase/SupabaseRouteTransactionRepository'
// import { SupabaseProductRepository } from '@/infrastructure/repositories/supabase/SupabaseProductRepository'
// import { SupabaseInventoryOperationRepository } from '@/infrastructure/repositories/supabase/SupabaseInventoryOperationRepository'
// import { SupabaseWorkdayInformationRepository } from '@/infrastructure/repositories/supabase/SupabaseWorkdayInformationRepository'

// Implementations - SQLite

// Services
// import { UUIDv4Service } from '@/infrastructure/services/UUIDv4Service'
// import { DateService } from '@/infrastructure/services/DateService'


// Utils
import { TOKENS } from '@/infrastructure/di/tokens'
import { MapperDTO } from '@/application/mappers/MapperDTO';



// Register DataSources as SINGLETON (one instance for entire app)
container.registerSingleton<SupabaseDataSource>(TOKENS.SupabaseDataSource, SupabaseDataSource);

// container.register<SQLiteDataSource>(TOKENS.SQLiteDataSource, 
//     { useClass: SQLiteDataSource },
//     { lifecycle: Lifecycle.Singleton }
// );

// =================== DTOs ====================
container.registerSingleton<MapperDTO>(MapperDTO, MapperDTO);

// =================== Services ====================
// container.registerSingleton<IDService>(TOKENS.IDService, UUIDv4Service);

// container.registerSingleton<IDateService>(TOKENS.DateService, DateService);

// =================== Implementation of repositories - Supabase ====================
container.register<StoreRepository>(TOKENS.SupabaseStoreRepository, {
    useClass: SupabaseStoreRepository
});

container.register<RouteRepository>(TOKENS.SupabaseRouteRepository, {
    useClass: SupabaseRouteRepository
});

container.register<RouteTransactionRepository>(TOKENS.SupabaseRouteTransactionRepository, {
    useClass: SupabaseRouteTransactionRepository
});

// container.register<ProductRepository>(TOKENS.SupabaseProductRepository, {
//     useClass: SupabaseProductRepository
// });

// =================== Implementation of repositories - SyncServer (Supabase) ====================
// container.register(TOKENS.SyncServerStoreRepository, {
//     useClass: SupabaseStoreRepository
// });
// container.register(TOKENS.SyncServerRouteTransactionRepository, {
//     useClass: SupabaseRouteTransactionRepository
// });
// container.register(TOKENS.SyncServerInventoryOperationRepository, {
//     useClass: SupabaseInventoryOperationRepository
// });
// container.register(TOKENS.SyncServerWorkdayInformationRepository, {
//     useClass: SupabaseWorkdayInformationRepository
// });

export { container as di_container }
