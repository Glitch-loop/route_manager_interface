"use client";
import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, Marker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { IMapMarker } from "./interfaces/interfaces";
import { coordinates } from "./types/types";
import { createCustomMarker } from "@/utils/stylesUtils";


interface MarkerMapProps {
  markers: IMapMarker[];
  selectedMarker: IMapMarker | null;
  coordSelected: (coords: coordinates) => void;
}

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20.648043093256433, lng: -105.21612612535338 }; // Default: Mexico City
const MAP_ID = "marker-map";

// Inner component that has access to the map instance
function MapContent({ markers, selectedMarker, coordSelected }: MarkerMapProps) {
  const map = useMap(MAP_ID);
  const [clickedMarker, setClickedMarker] = useState<IMapMarker | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<IMapMarker | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideHoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Center map when selectedMarker prop changes
  useEffect(() => {
    if (selectedMarker && map) {
      const lat = parseFloat(selectedMarker.latitude);
      const lng = parseFloat(selectedMarker.longitude);
      map.panTo({ lat, lng });
    }
  }, [selectedMarker, map]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (hideHoverTimerRef.current) clearTimeout(hideHoverTimerRef.current);
    };
  }, []);

  const handleMarkerClick = (marker: IMapMarker) => {
    // Close hover info window
    setHoveredMarker(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // Set clicked marker to show callout
    setClickedMarker(marker);

    // Center map on clicked marker
    if (map) {
      const lat = parseFloat(marker.latitude);
      const lng = parseFloat(marker.longitude);
      map.panTo({ lat, lng });
    }

    // Notify parent with coordinates
    coordSelected({
      Lat: parseFloat(marker.latitude),
      Lng: parseFloat(marker.longitude),
    });
  };

  const handleMouseOver = (marker: IMapMarker) => {
    // Clear any pending hide timer
    if (hideHoverTimerRef.current) {
      clearTimeout(hideHoverTimerRef.current);
      hideHoverTimerRef.current = null;
    }

    // Don't show hover if this marker is already clicked
    if (clickedMarker?.id_marker === marker.id_marker) return;

    // Delay showing hover InfoWindow
    hoverTimerRef.current = setTimeout(() => {
      setHoveredMarker(marker);
    }, 800);
  };

  const handleMouseOut = () => {
    // Clear the hover timer if user moves away before it fires
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // Delay hiding the hover InfoWindow
    hideHoverTimerRef.current = setTimeout(() => {
      setHoveredMarker(null);
    }, 2000);
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id_marker}
          icon={createCustomMarker(marker.color_item)}
          position={{ lat: parseFloat(marker.latitude), lng: parseFloat(marker.longitude) }}
          onClick={() => handleMarkerClick(marker)}
          onMouseOver={() => handleMouseOver(marker)}
          onMouseOut={handleMouseOut}
        />
      ))}

      {/* Hover InfoWindow */}
      {hoveredMarker && clickedMarker?.id_marker !== hoveredMarker.id_marker && (
        <InfoWindow
          position={{ lat: parseFloat(hoveredMarker.latitude), lng: parseFloat(hoveredMarker.longitude) }}
          onCloseClick={() => setHoveredMarker(null)}
        >
          {hoveredMarker.hoverComponent}
        </InfoWindow>
      )}

      {/* Click InfoWindow (Callout) */}
      {clickedMarker && (
        <InfoWindow
          position={{ lat: parseFloat(clickedMarker.latitude), lng: parseFloat(clickedMarker.longitude) }}
          onCloseClick={() => setClickedMarker(null)}
        >
          {clickedMarker.clickComponent}
        </InfoWindow>
      )}
    </>
  );
}

export default function MarkerMap({ markers, selectedMarker, coordSelected }: MarkerMapProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <Map 
        id={MAP_ID}
        style={containerStyle}
        defaultCenter={markers.length ? { lat: parseFloat(markers[0].latitude), lng: parseFloat(markers[0].longitude) } : defaultCenter}
        defaultZoom={13}
      >
        <MapContent 
          markers={markers} 
          selectedMarker={selectedMarker} 
          coordSelected={coordSelected} 
        />
      </Map>
    </APIProvider>
  );
}
