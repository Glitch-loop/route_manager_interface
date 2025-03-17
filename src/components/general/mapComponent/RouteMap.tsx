"use client";
import { useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { IMapMarker } from "@/interfaces/interfaces";
import { createCustomMarker } from "@/utils/stylesUtils";


interface StoreMapProps {
  markers: IMapMarker[];
  temporalMarkers: IMapMarker[];
  onSelectStore: (store: IMapMarker) => void;
}


const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20.648043093256433, lng: -105.21612612535338 }; // Default: Mexico City
 
export default function RouteMap({ markers, temporalMarkers, onSelectStore }: StoreMapProps) {
  const [selectedStore, setSelectedStore] = useState<IMapMarker | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<IMapMarker | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseOver = (store: IMapMarker) => {
    // Set a timeout to delay the appearance of the InfoWindow
    const timer = setTimeout(() => {
      setHoveredPosition(store);
    }, 1000); // 3 seconds delay

    setHoverTimer(timer);
  };

  const handleMouseOut = () => {
    // Clear the timeout if the user moves the pointer before 3 seconds
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }

    setTimeout(() => {
      setHoveredPosition(null);
    }, 3000)
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <Map 
        style={containerStyle}
        defaultCenter={markers.length ? { lat: parseFloat(markers[0].latitude), lng: parseFloat(markers[0].longuitude) } : defaultCenter}
        defaultZoom={13}
      >
        {markers.map((marker) =>  {
          return (<Marker
            key={marker.id_marker}
            icon={createCustomMarker(marker.color_item)}
            position={{ lat: parseFloat(marker.latitude), lng: parseFloat(marker.longuitude) }}
            onClick={() => {
              setSelectedStore(marker);
              onSelectStore(marker);
              setHoveredPosition(null);
            }}
            onMouseOver={() => handleMouseOver(marker)}
            onMouseOut={() => handleMouseOut() }
          />
        )})}
        {temporalMarkers.map((marker) =>  {
          return (<Marker
            key={marker.id_item}
            icon={createCustomMarker(marker.color_item)}
            position={{ lat: parseFloat(marker.latitude), lng: parseFloat(marker.longuitude) }}
            onClick={() => {
              setSelectedStore(marker);
              onSelectStore(marker);
              setHoveredPosition(null);
            }}
            onMouseOver={() => handleMouseOver(marker)}
            onMouseOut={() => handleMouseOut() }
          />
        )})}
        {/* Hover Info */}
        {hoveredPosition && (
          <InfoWindow
            position={{ lat: parseFloat(hoveredPosition.latitude), lng: parseFloat(hoveredPosition.longuitude) }}
            onCloseClick={() => setHoveredPosition(null)}
          >
            {hoveredPosition.hoverComponent}
          </InfoWindow>
        )}
        {/* Show store info when clicked */}
        {selectedStore && (
          <InfoWindow
            position={{ lat: parseFloat(selectedStore.latitude), lng: parseFloat(selectedStore.longuitude) }}
            onCloseClick={() => setSelectedStore(null)}
          >
            {selectedStore.clickComponent}
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
