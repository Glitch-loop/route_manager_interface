"use client";
import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, Marker, InfoWindow, useMap, MapMouseEvent } from "@vis.gl/react-google-maps";
import { IMapMarker } from "./interfaces/interfaces";
import { coordinates } from "./types/types";
import { createCustomMarker } from "@/utils/stylesUtils";
import { ChatSharp, SpeakerNotesOff } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";


interface MarkerMapProps {
  markers: IMapMarker[];
  idMarkerSelected: string | null;
  setIdMarkerSelected: (id: string | null) => void;
  onCoordSelected: (clickCoordinates: coordinates | IMapMarker) => void;
}

interface MapContentProps {
  markers: IMapMarker[];
  idMarkerSelected: string | null;
  setIdMarkerSelected: (id: string | null) => void;
  onCoordSelected: (clickCoordinates: MapMouseEvent | IMapMarker) => void;
}

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20.648043093256433, lng: -105.21612612535338 }; // Default: Mexico City
const MAP_ID = "marker-map";

// Inner component that has access to the map instance
function MapContent({ markers, idMarkerSelected, setIdMarkerSelected, onCoordSelected }: MapContentProps) {
  const map = useMap(MAP_ID);
  const [clickedMarker, setClickedMarker] = useState<IMapMarker | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<IMapMarker | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showCallout, setShowCallout] = useState(true);

  // Center map when selectedMarker prop changes
  useEffect(() => {
    if (idMarkerSelected && map) {
      const marker = markers.find(m => m.id_marker === idMarkerSelected);
      if (marker) {
        const lat = parseFloat(marker.latitude);
        const lng = parseFloat(marker.longitude);
        map.panTo({ lat, lng });
        setClickedMarker({
          ...marker,
          color_item: "#FF0000", // Fallback color
        });
      }
    }
  }, [idMarkerSelected, map]);

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
      // map.panTo({ lat, lng });
      map.moveCamera({ center: { lat, lng } });
    }

    // Notify parent with coordinates
    console.log("Store selected")
    
    onCoordSelected(marker);
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

  const handleCloseMarkerInfo = () => {
    setClickedMarker(null);
    setIdMarkerSelected(null);
  }

  return (
    <>
      <div className="absolute z-30 bottom-7 left-3">
        <Tooltip 
            title={showCallout ? "Ocultar panel de información" : "Mostrar panel de información"}
            placement="right"
            enterDelay={300}
            arrow>                      
          <IconButton
              onClick={() => setShowCallout(!showCallout)}
              sx={{
                  backgroundColor: '#F39C12',
                  color: 'white',
                  '&:hover': {
                      backgroundColor: '#ea950c',
                  },
                  width: 48,
                  height: 48,
              }}>
              {showCallout ? <ChatSharp /> : <SpeakerNotesOff />}
          </IconButton>
        </Tooltip>
      </div>
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
      { clickedMarker && idMarkerSelected !== null && (
          <Marker
            key={clickedMarker.id_marker}
            icon={createCustomMarker(clickedMarker.color_item)}
            position={{ lat: parseFloat(clickedMarker.latitude), lng: parseFloat(clickedMarker.longitude) }}
            onClick={() => handleMarkerClick(clickedMarker)}
            onMouseOver={() => handleMouseOver(clickedMarker)}
            onMouseOut={handleMouseOut}
          />
        )
      }
      {/* Hover InfoWindow */}
      {hoveredMarker && clickedMarker?.id_marker !== hoveredMarker.id_marker && hoveredMarker.hoverComponent !== null && (
        <InfoWindow
          position={{ lat: parseFloat(hoveredMarker.latitude), lng: parseFloat(hoveredMarker.longitude) }}
          onCloseClick={() => setHoveredMarker(null)}
        >
          {hoveredMarker.hoverComponent}
        </InfoWindow>
      )}

      {/* Click InfoWindow (Callout) */}
      {clickedMarker && showCallout && clickedMarker.clickComponent !== null && (
        <InfoWindow
          position={{ lat: parseFloat(clickedMarker.latitude), lng: parseFloat(clickedMarker.longitude) }}
          onCloseClick={handleCloseMarkerInfo}
        >
          {clickedMarker.clickComponent}
        </InfoWindow>
      )}
    </>
  );
}

export default function MarkerMap({ markers, idMarkerSelected, setIdMarkerSelected, onCoordSelected }: MarkerMapProps) {
  const [selectedCoordinate, setSelectedCoordinate] = useState<coordinates | null>(null);
  

  const handleCoordSelected = (clickCoordinates: MapMouseEvent | IMapMarker) => {
    if ("detail" in clickCoordinates) {
      if (clickCoordinates.detail.latLng !== null) {
        const coordinates = clickCoordinates.detail.latLng;
        const coords = { Lat: coordinates.lat, Lng: coordinates.lng };
        onCoordSelected(coords);
        setSelectedCoordinate(coords);
      }
    } else if ("id_marker" in clickCoordinates) {
      onCoordSelected(clickCoordinates);
    }
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <Map 
        id={MAP_ID}
        style={containerStyle}
        defaultCenter={markers.length ? { lat: parseFloat(markers[0].latitude), lng: parseFloat(markers[0].longitude) } : defaultCenter}
        defaultZoom={13}
        onClick={handleCoordSelected}
      >
        <MapContent 
          markers={markers} 
          idMarkerSelected={idMarkerSelected} 
          setIdMarkerSelected={setIdMarkerSelected}
          onCoordSelected={handleCoordSelected} 
        />
      </Map>
    </APIProvider>
  );
}
