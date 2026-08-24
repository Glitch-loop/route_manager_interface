// Critial imports
"use client";

// Libraries
import { pdf } from "@react-pdf/renderer";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";

// Dtos
import { UserDTO } from "@/shared/dtos/UserDTO";
import { RouteDTO } from "@/shared/dtos/RouteDTO";
import { LocationDTO } from "@/shared/dtos/LocationDTO";
import { RouteDayDTO } from "@/shared/dtos/RouteDayDTO";
import { RouteTransactionDTO } from "@/shared/dtos/RouteTransactionDTO";


// UI components
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from "@mui/icons-material";
import MarkerMap from "@/shared/components/MarkerMap/MarkerMap";
import StoreSearchBar from "@/app/route_administration/components/StoreSearchBar";
import RouteExpandMenu from "@/shared/components/RoutesExpandMenu/RoutesExpandMenu";
import RouteDayDisplayer from "@/app/analytics/components/RouteDayDisplayer";

// Types
import { RouteDayEffect } from "@/app/analytics/types/types";
import { PickerItemType } from "@/app/analytics/types/types";
import { RouteDayFilters } from "@/app/analytics/types/types";
import { StorePositionInRouteType } from "@/shared/types/types";
import { MarkerGroup } from "@/app/route_administration/types/types";
import { coordinates } from "@/shared/components/MarkerMap/types/types";

// Constants
import { RANGE_OPTIONS } from "@/app/route_administration/constants/constants";

// Interfaces 
import { IMapMarker } from "@/shared/components/MarkerMap/interfaces/interfaces";

// Utils
import {
  createMapStoresInRouteDay,
  getRouteDayFromRoutesList,
} from "@/shared/utils/routes/utils";
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
} from "@/shared/utils/strings/utils";
import { findStoresAround } from "@/shared/utils/clients/utils";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { generateRandomColor } from "@/shared/utils/styles/utils";

import { cast_string_to_date_hour_format } from "@/utils/dateUtils";
import { ProductDTO } from "@/shared/dtos/ProductDTO";
import DAY_OPERATIONS from "@/core/enums/DayOperations";

import { useRouteLocation } from "@/shared/hooks/locations/useRouteLocation";
import { useRoute } from "@/shared/hooks/routes/useRoute";
import { calculateTotalStoreOfTransactionDescriptionConcept } from "@/shared/utils/transactions/utils";
import { processConsolidatedReportData } from "@/app/analytics/reports/consoldate_historic_report/consolidatedReportHelpers";
import { ConsolidatedRouteDayPDFDocument } from "@/app/analytics/reports/consoldate_historic_report/ConsolidatedRouteDayPDFDocument";
import { useRouteDayLocationMap } from "@/shared/hooks/route-day-location-map/useRouteDayLocationMap";
import { useProducts } from "@/shared/hooks/products/useProducts";
import { useMarker } from "@/shared/hooks/markers/useMarker";


function createMapHoverComponent(store: LocationDTO): React.ReactNode {
  const storeName = store.location_name ?? "Nombre no disponible";
  const storeAddress = getAddressOfStore(store);

  return (
    <div className="p-2">
      <p className="text-lg font-semibold">
        {capitalizeFirstLetterOfEachWord(storeName)}
      </p>
      <p className="text-base text-gray-600">
        {capitalizeFirstLetterOfEachWord(storeAddress)}
      </p>
    </div>
  );
}

function createMapClickComponent(
  store: LocationDTO,
  storePositionsMap: Map<string, StorePositionInRouteType[]>,
  transactions: Map<string, RouteTransactionDTO[]>,
  productsMap: Map<string, ProductDTO>,
): React.ReactNode {
  const { id_location, location_name } = store;
  const storeName = location_name ?? "Nombre no disponible";
  const storeAddress = getAddressOfStore(store);
  const modifiedRouteDayIds: Set<string> = new Set(); // Replace with actual logic to get modified route day IDs
  const productForPrinting:ProductDTO[] = Array.from(productsMap.values())
   .sort((a, b) => a.order_to_show - b.order_to_show);

  const storeTransactions = (transactions.get(id_location) ?? [])
    .slice()
    .sort((a, b) => {
      return new Date(a.created_at).getTime() + new Date(b.created_at).getTime();
    });

  
  const filteredTransactions = storeTransactions.map((transaction) => {
    return {
      ...transaction,
      transaction_description: transaction.transaction_description.filter((desc) => desc.id_transaction_operation_type === DAY_OPERATIONS.sales)
    }
  })

  const productsInRangeOfTime =  new Set<string>(
    filteredTransactions.flatMap((transaction) =>
      transaction.transaction_description.map((description) => description.id_product),
    )
  )

  const totalsByTransaction = filteredTransactions.map((transaction) => {
    const subtotal = transaction.transaction_description.reduce((total, detail) => {
      return total + detail.quantity * detail.price_at_moment;
    }, 0);

    return subtotal > 0 ? subtotal : transaction.cash_received;
  });

  const storePositions:StorePositionInRouteType[]|undefined = storePositionsMap.get(id_location);

  return (
    <div className="p-3 min-w-[280px]">
      {/* <p className="text-sm text-gray-600 mb-1">{id_location}</p> */}
      <p className="text-sm font-semibold text-gray-800 mb-1">
        {capitalizeFirstLetterOfEachWord(storeName)}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        {capitalizeFirstLetterOfEachWord(storeAddress)}
      </p>
      {store.address_reference && (
        <p className="text-sm text-gray-500 mt-1">
          Referencias: {capitalizeFirstLetter(store.address_reference)}
        </p>
      )}

      {/* Route days table */}
      {
        storePositions === undefined ?
        <p className="text-sm text-gray-500 mt-1">
          La información sobre las posiciones no esta disponible.
        </p> :
        <>
          {storePositions.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Días de ruta:
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 pr-2">Ruta</th>
                    <th className="text-left py-1 pr-2">Día</th>
                    <th className="text-center py-1">Pos.</th>
                    <th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {storePositions.map((pos) => {
                    const isBeingModified = modifiedRouteDayIds.has(pos.idRouteDay);
                    return (
                      <tr
                        key={pos.idRouteDayStore}
                        className="border-b border-gray-100"
                      >
                        <td className="py-1 pr-2">
                          {capitalizeFirstLetter(pos.routeName)}
                        </td>
                        <td className="py-1 pr-2">
                          {capitalizeFirstLetter(pos.dayName)}
                        </td>
                        <td className="py-1 text-center">{pos.position}</td>
                        <td className="py-1 text-center">
                          {isBeingModified && (
                            <Tooltip
                              title="Día de ruta en modificación"
                              arrow
                              placement="top"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full cursor-help">
                                <span className="text-white text-xs font-bold">
                                  !
                                </span>
                              </span>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      }

      {/* Table of sales */}
      {storeTransactions.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <p className="text-xs font-semibold text-gray-700 mb-1">Tabla de ventas:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 pr-2">Producto</th>
                  {storeTransactions.map((transaction) => (
                    <th
                      key={transaction.id_route_transaction}
                      className="text-center py-1 px-1 whitespace-nowrap"
                    >
                      {cast_string_to_date_hour_format(transaction.created_at)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productForPrinting.map((product) => {
                  const { id_product, product_name } = product;
                  if (!productsInRangeOfTime.has(id_product)) return null;

                  return (
                    <tr key={id_product} className="border-b border-gray-100">
                      <td className="py-1 pr-2">
                        {capitalizeFirstLetter(product_name)}
                      </td>
                      {storeTransactions.map((transaction) => {
                        const quantity = transaction.transaction_description
                          .filter((description) => description.id_product === id_product)
                          .reduce((total, description) => total + description.quantity, 0);

                        return (
                          <td
                            key={`${id_product}-${transaction.id_route_transaction}`}
                            className="py-1 px-1 text-center"
                          >
                            {quantity}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t font-semibold text-gray-800">
                  <td className="py-1 pr-2">Total</td>
                  {totalsByTransaction.map((total, index) => (
                    <td
                      key={`${storeTransactions[index].id_route_transaction}-total`}
                      className="py-1 px-1 text-center"
                    >
                      ${total.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {storeTransactions.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 border-t pt-2">
          No hay transacciones para esta tienda en el rango consultado.
        </p>
      )}
    </div>
  );
}

export default function Page() {

  // Collapse menu states
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(false);
  const [topPanelOpen, setTopPanelOpen] = useState(false);
  const [routeMenuAnchor, setRouteMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  // Application states
  const [mapStoresInRouteDay, setMapStoresInRouteDay] = useState<
    Map<string, StorePositionInRouteType[]>
  >(new Map()); // Map of store ID to LocationDTO for stores in the selected route day
  const [storeWithinRouteAssigned, setStoreWithinRouteAssigned] = useState<
    Set<string>
  >(new Set()); // Set of store IDs that are already assigned within the route being modified, used to avoid showing them in the search results when modifying a route day.

  // States related to route day.
  const [selectedRouteDay, setSelectedRouteDay] = useState<RouteDayDTO[]>([]); // Keep track of routes that are being modified to apply special effects on map markers. <route day id, DraggableRouteDayStore>

  // States related to expand menu.
  const [checkedRouteDays, setCheckedRouteDays] = useState<
    Record<string, boolean>
  >({});
  const [pendingUnselectRouteDayId, setPendingUnselectRouteDayId] = useState<
    string | null
  >(null);

  // State for the map
  const [selectedRouteDayStore, setSelectedRouteDayStore] = useState<
    string | null
  >(null);
  // const [searchByCoords, setSearchByCoords] = useState<boolean>(false);
  const [includeDeactiveStores, setIncludeDeactiveStores] =
    useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<number>(
    RANGE_OPTIONS[3].value,
  );
  const [totalStoresFoundBySearchRange, setTotalStoresFoundBySearchRange] =
    useState<number | null>(null);
 
  const [vendors] = useState<UserDTO[]>([
    {
      id_vendor: "1",
      cellphone: "1234567890",
      name: "Jhon Doe",
      password: null,
      status: null,
    },
  ]);


  // Custom hooks
  const { routes, routesMap} = useRoute();
  const { productsMap } = useProducts();
  const {stores, mapStores, mapRouteTransactionByStore, fetchRouteTransactions} = useRouteLocation();
  const { 
    effectRouteDay, 
    routeDayFilters,
    handleAddRouteDayEffects, 
    handleRemoveRouteDayEffects,
    handleUpdateRouteDayEffects,
    handleSetRouteDayFilters,
    routeDayLocationMarkers
  } = useRouteDayLocationMap({
    routeDaysToDisplay: selectedRouteDay,
    storeMap: mapStores,
    routeTransactionByStoreMap: mapRouteTransactionByStore,
    onHoverMarkerComponent: (location: LocationDTO): React.ReactNode => { return createMapHoverComponent(location); },
    onClickMarkerComponent: (location: LocationDTO): React.ReactNode => { return createMapClickComponent(location, mapStoresInRouteDay, mapRouteTransactionByStore, productsMap); }
  }
  );
  const {
    searchByCoords,
    selectedCoordinate,
    handleStoresFoundByCoords,
    handleHoverLocation,
    handleActivateSearchingByCoords,
    handleSearchedStore,
    handleSelectCoordinates,
    handleHideSearchingByCoordsResult,
    markers
  } = useMarker({
    searchingByCoords: false,
    hideSearchingByCoordsResult: false,
    existingMarkers: routeDayLocationMarkers,
    onHoverMarkerComponent: (location: LocationDTO): React.ReactNode => { return createMapHoverComponent(location); },
    onClickMarkerComponent: (location: LocationDTO): React.ReactNode => { return createMapClickComponent(location, mapStoresInRouteDay, mapRouteTransactionByStore, productsMap); }
  });

  useEffect(() => {
    const mapStoresInRouteDay = createMapStoresInRouteDay(routes);
    setMapStoresInRouteDay(mapStoresInRouteDay);

    const storeWithinRouteAssigned = new Set<string>();

    stores.forEach((store) => {
      const { id_location } = store;
      if (!mapStoresInRouteDay.has(id_location)) {
        storeWithinRouteAssigned.add(id_location);
      }
    });

    setStoreWithinRouteAssigned(storeWithinRouteAssigned);
  }, [routes, stores]);

  // Handlers - Route day menu selection
  const handleSelectRouteDay = (routeDayId: string, state: boolean) => {
    const routeDayFound: RouteDayDTO | null = getRouteDayFromRoutesList(
      routes,
      routeDayId,
    );

    if (state) {
      // Add route day because it was selected
      // Check if already selected to avoid duplication
      if (selectedRouteDay.find((routeDay) => routeDay.id_route_day === routeDayId) !== undefined) return;

      if (routeDayFound !== null) {
        // Add to routesInModification
        setSelectedRouteDay((prev) => ([
          ...prev,
          {...routeDayFound},
        ]));

        // Set effects for map markers
        handleAddRouteDayEffects(routeDayId);
      }
    } else {
      handleUnselectRouteDay(routeDayId);
    }
  };

  const handleUnselectRouteDay = (routeDayId: string) => {
    // Remove route day from routesInModification
    setSelectedRouteDay((prev) => prev
      .filter((routeDay) => routeDay.id_route_day !== routeDayId));

    // Remove from checkedRouteDays
    setCheckedRouteDays((prev) => {
      const newCheckedDays = { ...prev };
      delete newCheckedDays[routeDayId];
      return newCheckedDays;
    });

    // Remove effects
    handleRemoveRouteDayEffects(routeDayId);
  };

  const handleCloseRouteDay = (idRouteDay: string) => {
    // Remove route day from routesInModification
    handleUnselectRouteDay(idRouteDay);
  };

  const handleOverStoreAutoComplete = (store: LocationDTO | null) => {
    handleHoverLocation(store);
  };

  const handleToggleBottomPanel = () => {
    if (bottomPanelOpen) {
      setBottomPanelOpen(false);
      setBottomPanelExpanded(false);
      return;
    }

    setBottomPanelOpen(true);
  };

  const handleToggleBottomPanelExpansion = () => {
    if (!bottomPanelOpen) return;
    setBottomPanelExpanded((prev) => !prev);
  };

  const handleCopyCSV = (idRouteDayStore: string) => { }

  const handleGeneratePDF = async (idRouteDay: string) => {
    const routeDay = selectedRouteDay.find((selectedRouteDay) => { return selectedRouteDay.id_route_day === idRouteDay});
    
    if (routeDay === undefined) {
      console.log(`There is not a route day with id ${idRouteDay}`);
      return;
    }
    
    const reportData = processConsolidatedReportData(
        routeDay,
        mapStores,
        mapRouteTransactionByStore,
        routesMap,
        productsMap,
        DAY_OPERATIONS.sales
      );

      const blob = await pdf(<ConsolidatedRouteDayPDFDocument data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Consolidado_${reportData.routeName}_${reportData.dayName}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  }

  // Handlers for store search bar
  const handlerSwitchSearchByCoords = (active: boolean) => {
    handleActivateSearchingByCoords();

    if (!active) {
      handleStoresFoundByCoords([]);
      handleSelectCoordinates(null);
      setTotalStoresFoundBySearchRange(null);
      setTotalStoresFoundBySearchRange(0);
    } else {
      setTotalStoresFoundBySearchRange(0);
    }
  };

  const handleSelectStore = (store: LocationDTO | null) => {
    handleSearchedStore(store);
  };

  const handleIncludeDeactiveStores = (active: boolean) => {
    setIncludeDeactiveStores(active);
  };


  const handleSelectedRange = (range: number) => {
    if (searchByCoords && selectedCoordinate !== null) {
      const foundStores = findStoresAround(selectedCoordinate, stores, range);
      setTotalStoresFoundBySearchRange(foundStores.length);
      handleStoresFoundByCoords(foundStores);
    }

    setSelectedRange(range);
  };

  const handleCoordSearchResult = (hide: boolean) => {
    handleHideSearchingByCoordsResult();
  };

  // Transaction handlers
  const handleRetrieveRouteTransactions = async (startDate: Date, endDate: Date, idStores: string[]) => {
    await fetchRouteTransactions(startDate, endDate, idStores);
  };

  // Handlers for route day filters and effects
  const handleApplyRouteEffects = async (
    routeDayId: string,
    routeDayEffect: RouteDayEffect
  ) => {
    const { selectedLocation } = routeDayEffect;

    // Only one location can be selected at a time.
    if(selectedLocation) {
      setSelectedRouteDayStore(selectedLocation);

      effectRouteDay.forEach((value, key) => {
        if (key === routeDayId) {
          effectRouteDay.set(key, {...routeDayEffect}) 
        } else {
          effectRouteDay.set(key, {...value, selectedLocation: undefined}) 
        }
      })
    }

    handleUpdateRouteDayEffects(routeDayId, routeDayEffect);
  }

  // Handlers for map
  const handleUnselectMarker = async (idRouteDayLocation: string|null) => { 
    // const updatedRouteDayEffects: Map<string, RouteDayEffect> = new Map<string, RouteDayEffect>();
    // effectRouteDay.forEach((value, key) => {
    //   updatedRouteDayEffects.set(key, {...value, selectedLocation: undefined});
    // });
    // setEffectSelectedRouteDay(new Map(updatedRouteDayEffects));
  }

    // Map handlers
  const handleCoordSelected = (selectedCoords: coordinates | IMapMarker) => {
    if ("Lat" in selectedCoords && "Lng" in selectedCoords) {
      // coordinates object
      if (searchByCoords) {
        const foundStores = findStoresAround(
          selectedCoords,
          stores,
          selectedRange,
        );
        handleStoresFoundByCoords(foundStores);
        setTotalStoresFoundBySearchRange(foundStores.length);
      }
      handleSelectCoordinates(selectedCoords);
    } else {
      // IMarker object
      const { id_group, id_marker } = selectedCoords as IMapMarker;

      if (id_group === "pivot-coord-search") {
        handleStoresFoundByCoords([]);
        handleSelectCoordinates(null);
        setTotalStoresFoundBySearchRange(0);
      } else {

        if (effectRouteDay.has(id_group)) {
          const routeDayEffect = effectRouteDay.get(id_group);
          handleApplyRouteEffects(id_group, {...routeDayEffect!, selectedLocation: id_marker});
        }
      }
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-row bg-system-primary-background rounded-lg">
      {/* Main content */}
      <div className="flex flex-col w-full h-full">
        {/* Search content - collapses to top */}
        <div className="relative w-full flex-shrink-0">
          <Collapse in={topPanelOpen}>
            <div className="w-full bg-system-primary-background h-fit">
              <StoreSearchBar
                stores={stores}
                onSelectStore={handleSelectStore}
                searchByCoords={searchByCoords}
                rangeOptions={RANGE_OPTIONS}
                totalStoresFoundBySearchRange={totalStoresFoundBySearchRange}
                selectedRange={selectedRange}
                onSwitchSearchByCoords={handlerSwitchSearchByCoords}
                onSelectRange={handleSelectedRange}
                includeDesactiveStores={includeDeactiveStores}
                onHandleIncludeDesactiveStores={handleIncludeDeactiveStores}
                onHoverAutocompleteOption={handleOverStoreAutoComplete}
                onHideSearchCoordResults={handleCoordSearchResult}
              />
            </div>
          </Collapse>
          {/* Toggle button */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-full z-10">
            <Tooltip
              title={"Buscar clientes"}
              placement="bottom"
              enterDelay={300}
              arrow
            >
              <IconButton
                onClick={() => setTopPanelOpen(!topPanelOpen)}
                size="small"
              >
                {topPanelOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Map content - takes remaining space */}
        <div className="relative w-full flex-1 bg-blue-900">
          {/* Button that displays the menu */}
          <div className="absolute left-48 top-2 z-10">
            <IconButton
              onClick={(e) => setRouteMenuAnchor(e.currentTarget)}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                width: 48,
                height: 48,
              }}
            >
              <MenuIcon />
            </IconButton>
            <RouteExpandMenu
              routeList={routes}
              anchorEl={routeMenuAnchor}
              open={Boolean(routeMenuAnchor)}
              mapStores={mapStores}
              onClose={() => setRouteMenuAnchor(null)}
              onDaySelect={() => {}}
              onDaySelectCheckbox={handleSelectRouteDay}
              showDayCheckbox={true}
              checkedDays={checkedRouteDays}
              onCheckedDaysChange={setCheckedRouteDays}
            />
          </div>
          <MarkerMap
            markers={markers}
            idMarkerSelected={selectedRouteDayStore}
            setIdMarkerSelected={handleUnselectMarker}
            onCoordSelected={handleCoordSelected}
          />
        </div>

        {/* Route organization - collapses to bottom */}
        <div className="relative w-full flex-shrink-0">
          {/* Toggle button */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 z-10">
            {bottomPanelOpen && (
              <div className="bg-white rounded-full">
                <Tooltip
                  title={
                    bottomPanelExpanded ? "Reducir panel" : "Expandir panel"
                  }
                  placement="top"
                  enterDelay={300}
                  arrow
                >
                  <IconButton
                    onClick={handleToggleBottomPanelExpansion}
                    size="small"
                  >
                    {bottomPanelExpanded ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowUp />
                    )}
                  </IconButton>
                </Tooltip>
              </div>
            )}
            <div className="bg-white rounded-full">
              <Tooltip
                title={"Organizar ruta"}
                placement="top"
                enterDelay={300}
                arrow
              >
                <IconButton onClick={handleToggleBottomPanel} size="small">
                  {bottomPanelOpen ? (
                    <KeyboardArrowDown />
                  ) : (
                    <KeyboardArrowUp />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <Collapse in={bottomPanelOpen}>
            <div
              className={`flex flex-row w-full overflow-auto transition-all duration-300 ${bottomPanelExpanded ? "h-[75vh]" : "h-[50vh]"}`}
            >
              <RouteDayDisplayer 
                routeDayToDisplay={selectedRouteDay}
                locationsMap={mapStores}
                routesMap={routesMap}
                routeTransactionsMap={mapRouteTransactionByStore}
                routeDayEffectsMap={effectRouteDay}
                routeDayFilters={routeDayFilters}
                pickerItems={
                  (Array.from(productsMap.values())
                    .slice()
                    .sort((a, b) => a.order_to_show - b.order_to_show))
                  .map((produdct) => {
                    return {
                      id: produdct.id_product,
                      itemName: produdct.product_name
                    }  as PickerItemType
                  })
                }
                onRequireRouteTransactions={handleRetrieveRouteTransactions}
                onCloseRouteDay={handleCloseRouteDay}
                onApplyRouteEffects={handleApplyRouteEffects}
                onApplyFilter={handleSetRouteDayFilters}
                onGenerateReport={handleGeneratePDF}
              />
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
}
