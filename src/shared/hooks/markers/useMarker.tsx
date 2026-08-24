// Libraries
import React, { useState, useMemo } from "react";

// Interfaces
import { IMapMarker } from "@/interfaces/interfaces";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { MarkerGroup } from "@/app/route_administration/types/types";
import { generateUUIDv4 } from "@/utils/generalUtils";
import { coordinates } from "@/shared/components/MarkerMap/types/types";

type MarkerHook = {
  searchingByCoords: boolean;
  existingMarkers: IMapMarker[];
  onHoverMarkerComponent: (location: LocationDTO) => React.ReactNode;
  onClickMarkerComponent: (location: LocationDTO) => React.ReactNode;
}

export function  useMarker({
  searchingByCoords,
  existingMarkers,
  onHoverMarkerComponent,
  onClickMarkerComponent
}: MarkerHook) {
  const [selectedCoordinate, setSelectedCoordinate] = useState<coordinates|null>(null);

  const [hoveredStore, setHoveredStore] = useState<LocationDTO | null>(null);
  const [searchedStore, setSearchedStore] = useState<LocationDTO | null>(null);
  
  const [searchByCoords, setSearchingByCoords] = useState<boolean>(searchingByCoords);
  const [locationFoundByCoords, setSLocationFoundByCoords] = useState<LocationDTO[]>([]);


  const markers = useMemo<IMapMarker[]>(() => {
    const markers:IMapMarker[] = [...existingMarkers];
    const existingMarkersMap: Map<string, IMapMarker> = new Map<string, IMapMarker>(
      existingMarkers.map((marker) => [marker.id_item, marker])
    );

    /**
     * Creating priority markers
     * 
     * Priority markers are those ones that must be higlighed beacuse user actions,
     * so it may be printed in the map but because they are result of an action
     * they must be showed in a different way.
    */
    if (hoveredStore !== null) {
      const { id_location, latitude, longitude } = hoveredStore;
      const markerGroup: MarkerGroup = "searchbar-hovered-coord";
      markers.push({
        id_marker: generateUUIDv4(), // Unique ID for hovered store marker
        id_item: id_location,
        id_group: markerGroup,
        color_item: "#FF8C00", // Default color
        latitude: latitude,
        longitude: longitude,
        hoverComponent: onHoverMarkerComponent(hoveredStore),
        clickComponent: onClickMarkerComponent(hoveredStore)
      });
    }

    if (searchedStore !== null) {
      const { id_location, latitude, longitude } = searchedStore;
      const markerGroup: MarkerGroup = "searchbar-searched-store";
      markers.push({
        id_marker: generateUUIDv4(), // Unique ID for searched store marker
        id_item: id_location,
        id_group: markerGroup,
        color_item: "#bd2cb6", // Default color
        latitude: latitude,
        longitude: longitude,
        hoverComponent: onHoverMarkerComponent(searchedStore),
        clickComponent: onClickMarkerComponent(searchedStore),
      });
    }


    /**
     * Creating common markers
     * 
     * They are those markers that don't need to be highlighted because user actions,
     * if they are already printed, then it doesn't need to be changed in another color.
    */
    if(searchByCoords) {
      locationFoundByCoords.forEach((locationFound: LocationDTO) => {
        const { id_location, latitude, longitude } = locationFound;
        const markerGroup: MarkerGroup = "store-found-by-coords";

        if (existingMarkersMap.has(id_location)) return;

        markers.push({
          id_marker: generateUUIDv4(),
          id_item: id_location,
          id_group: markerGroup,
          color_item: "#3713da", // Assigned color for this group
          latitude: latitude,
          longitude: longitude,
          hoverComponent: onHoverMarkerComponent(locationFound),
          clickComponent: onClickMarkerComponent(locationFound),
        });
      })
    }

    if (selectedCoordinate) {
      if (searchByCoords) {
        const { Lat, Lng } = selectedCoordinate;
        const markerGroup: MarkerGroup = "pivot-coord-search";
        markers.push({
          id_marker: generateUUIDv4(), // Unique ID for store found by coordinates
          id_item: generateUUIDv4(),
          id_group: markerGroup,
          color_item: "#dc3d35", // Default color
          latitude: Lat.toString(),
          longitude: Lng.toString(),
          hoverComponent: <span>Click para cancelar busqueda</span>,
          clickComponent: null,
        });
      }
    }

    return markers;
  }, [
    existingMarkers,
    locationFoundByCoords,
    onHoverMarkerComponent,
    onClickMarkerComponent,
    hoveredStore,
    searchedStore,
    searchByCoords,
    selectedCoordinate,
  ]);

  const handleHoverLocation = (location: LocationDTO | null) => {
    setHoveredStore(location);
  }

  const handleSearchedStore = (searchedStore: LocationDTO|null) => {
    setSearchedStore(searchedStore);
  }

  const handleStoresFoundByCoords = (storesFound: LocationDTO[]) => {
    setSLocationFoundByCoords(storesFound);
  }

  const handleHideSearchingByCoords = () => {
    setSearchingByCoords(!searchByCoords)
  } 

  const handleSelectCoordinates = (selectedCoordinate: coordinates|null) => {
    setSelectedCoordinate(selectedCoordinate);
  }

  return {
    searchByCoords,
    handleStoresFoundByCoords,
    handleHideSearchingByCoords,
    handleHoverLocation,
    handleSearchedStore,
    handleSelectCoordinates,
    markers
  }
}