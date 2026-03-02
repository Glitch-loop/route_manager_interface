export interface ICatalogItem {
    id_item: string,
    id_item_in_container: string,
    id_group: string,
    id_catalog: string,
    item_name: string,
    order_to_show: number,   
}

export interface ICatalog {
    id_catalog: string,
    catalog_name: string,
    catalog: ICatalogItem[],
}