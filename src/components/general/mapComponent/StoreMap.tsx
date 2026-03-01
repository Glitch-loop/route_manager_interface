"use client";
import { IStore } from "@/interfaces/interfaces";
import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { LatLng } from "leaflet";

interface StoreMapProps {
  stores: IStore[];
  onSelectStore: (store: IStore) => void;
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 19.432608, lng: -99.133209 }; // Default to Mexico City

export default function StoreMap({ stores, onSelectStore }: StoreMapProps) {
  console.log("Stores in StoreMap:", stores);
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // Store key in .env.local
  });

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  // const pinBackGround = new PinElement({
  //   background: '#FBBC04',    
  // })

  return (
    <GoogleMap 
        mapContainerStyle={containerStyle} center={stores[0] ? { lat: parseFloat(stores[0].latitude), lng: parseFloat(stores[0].longuitude) } : defaultCenter} zoom={12}>
      {stores.map((store) => 
      {
        console.log("store", store.store_name, " - ")
        console.log(parseFloat(store.longitude))
        if (store.latitude === undefined || store.longitude === undefined || store.latitude === null || store.longitude === null || store.latitude === '' || store.longitude === '') {
          // console.log("Store in map: ", store.latitude, "- ", store.longitude);
          return null;
        }
        return (
          <Marker
            key={store.id_store}
            position={{ lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) }}
            onClick={() => {
              setSelectedStore(store);
              onSelectStore(store);
            }}
            
          />
        )
      }
      )}
    </GoogleMap>
  );
}
