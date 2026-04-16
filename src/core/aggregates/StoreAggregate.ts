import { Store } from "../entities/Store";


export default class StoreAggregate {
    private store: Store|null = null;

    constructor(private readonly storeParam?: Store) {
        if (storeParam) {
            this.store = { ...storeParam };
        }
    }

    getStore(): Store {
        if (this.store === null) throw new Error("Store not initialized.");
        return this.store;
    }

    activateStore() {
        if (this.store === null) throw new Error("Store not initialized.");
        this.store = new Store(
            this.store.id_store,
            this.store.street,
            this.store.ext_number,
            this.store.colony,
            this.store.postal_code,
            this.store.address_reference,
            this.store.store_name,
            this.store.owner_name,
            this.store.cellphone,
            this.store.latitude,
            this.store.longitude,
            this.store.id_creator,
            this.store.creation_date,
            this.store.creation_context,
            1, // status_store: 1 for active
        );
    }

    desactivateStore() {
        if (this.store === null) throw new Error("Store not initialized.");
        this.store = new Store(
            this.store.id_store,
            this.store.street,
            this.store.ext_number,
            this.store.colony,
            this.store.postal_code,
            this.store.address_reference,
            this.store.store_name,
            this.store.owner_name,
            this.store.cellphone,
            this.store.latitude,
            this.store.longitude,
            this.store.id_creator,
            this.store.creation_date,
            this.store.creation_context,
            0, // status_store: 0 for inactive
        );
    }

    updateStore(updated: Partial<Store>) {
        if (this.store === null) throw new Error("Store not initialized.");
        this.store = new Store(
            this.store.id_store,
            updated.street !== undefined ? updated.street : this.store.street,
            updated.ext_number !== undefined ? updated.ext_number : this.store.ext_number,
            updated.colony !== undefined ? updated.colony : this.store.colony,
            updated.postal_code !== undefined ? updated.postal_code : this.store.postal_code,
            updated.address_reference !== undefined ? updated.address_reference : this.store.address_reference,
            updated.store_name !== undefined ? updated.store_name : this.store.store_name,
            updated.owner_name !== undefined ? updated.owner_name : this.store.owner_name,
            updated.cellphone !== undefined ? updated.cellphone : this.store.cellphone,
            updated.latitude !== undefined ? updated.latitude : this.store.latitude,
            updated.longitude !== undefined ? updated.longitude : this.store.longitude,
            this.store.id_creator,
            this.store.creation_date,
            this.store.creation_context,
            this.store.status_store,
        );
    }

    createStore(
        id_store: string,
        street: string,
        ext_number: string | null,
        colony: string,
        postal_code: string,
        address_reference: string | null,
        store_name: string | null,
        owner_name: string | null,
        cellphone: string | null,
        latitude: string,
        longitude: string,
    ) {
        this.store = new Store(
            id_store,
            street,
            ext_number,
            colony,
            postal_code,
            address_reference,
            store_name,
            owner_name,
            cellphone,
            latitude,
            longitude,
            "58eb6f1c-29fc-46dd-bf19-caece0950257", // TODO: When implementing log in system, replace with actual user ID
            new Date(),
            "On site",
            1,
        );
    }

}