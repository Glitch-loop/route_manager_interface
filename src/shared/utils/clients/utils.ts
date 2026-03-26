import StoreDTO from "@/application/dto/StoreDTO";
import { coordinates } from "@/shared/components/MarkerMap/types/types";

export function distanceBetweenTwoPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

export function findStoresAround(pivotLocation:coordinates, stores:StoreDTO[]|null, metersAround:number):StoreDTO[] {
    let storesToShow:StoreDTO[] = [];

    if (pivotLocation !== null && stores !== null) {
        const kmRange = metersAround / 1000; // Convert meters to kilometers
        
        storesToShow = stores.filter((store) => {
            // distanceBetweenTwoPoints returns distance in kilometers
            const distanceInKm:number = distanceBetweenTwoPoints(
                parseFloat(store.latitude),
                parseFloat(store.longitude),
                pivotLocation.Lat,
                pivotLocation.Lng
            );

            return distanceInKm <= kmRange;
        });
        
    } else {
        storesToShow = [];
    }

    return storesToShow;
}