"use client";
import { useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { IStore } from "@/interfaces/interfaces";
import { createCustomMarker, getGradientColor } from "@/utils/stylesUtils";


interface StoreMapProps {
  stores: IStore[];
  onSelectStore: (store: IStore) => void;
}


const containerStyle = { width: "100%", height: "500px" };
const defaultCenter = { lat: 20.648043093256433, lng: -105.21612612535338 }; // Default: Mexico City
 
export default function RouteMap({ stores, onSelectStore }: StoreMapProps) {
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<IStore | null>(null);


  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <Map 
        style={containerStyle}
        defaultCenter={stores.length ? { lat: parseFloat(stores[0].latitude), lng: parseFloat(stores[0].longuitude) } : defaultCenter}
        defaultZoom={13}
      >
        {stores.map((store, index) =>  {
           const color = getGradientColor("#64C8FF", index, stores.length);
          return (<Marker
            key={store.id_store}
            icon={createCustomMarker(color)}
            position={{ lat: parseFloat(store.latitude), lng: parseFloat(store.longuitude) }}
            onClick={() => {
              setSelectedStore(store);
              onSelectStore(store);
            }}
            onMouseOver={() => {
              console.log("showing something")
              setHoveredPosition(store)}}
            onMouseOut={() => 
              setTimeout(() => {
                setHoveredPosition(null)
              }, 10000)

            }
          />
        )})}
          {/* Hover Info */}
          {hoveredPosition && (
          <InfoWindow
            position={{ lat: parseFloat(hoveredPosition.latitude), lng: parseFloat(hoveredPosition.longuitude) }}
            onCloseClick={() => setHoveredPosition(null)}
          >
            <div>
              <p><strong>Store Position:</strong> 1
              {stores.find(s => s.id_store === hoveredPosition.id_store)?.store_name}
              </p>
            </div>
          </InfoWindow>
        )}
        {/* Show store info when clicked */}
        {selectedStore && (
        <InfoWindow
          position={{ lat: parseFloat(selectedStore.latitude), lng: parseFloat(selectedStore.longuitude) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div>
            <h3>{selectedStore.store_name}</h3>
            <p><strong>Address:</strong> {selectedStore.street}, {selectedStore.colony}</p>
            <p><strong>Owner:</strong> {selectedStore.owner_name || "N/A"}</p>
            {/* <p><strong>Position in Route:</strong> {stores.find(s => s.id_store === selectedStore.id_store)?.position_in_route}</p> */}
          </div>
        </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
