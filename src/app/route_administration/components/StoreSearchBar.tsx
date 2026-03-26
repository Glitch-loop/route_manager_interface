import React, { useState } from "react";
import { Switch, TextField, ToggleButton, ToggleButtonGroup, FormControlLabel, Checkbox, Divider, Autocomplete } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StoreDTO from "@/application/dto/StoreDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";
import { RangeOption } from "../types/types";

type StoreSearchBarProps = {
  stores: StoreDTO[];
  searchByCoords: boolean;
  includeDesactiveStores: boolean;
	rangeOptions: RangeOption[];
	selectedRange: number;
	totalStoresFoundBySearchRange: number|null;
  onSelectStore: (store: StoreDTO | null) => void;
  onSwitchSearchByCoords: (active: boolean) => void;
  onSelectRange: (range: number) => void;
  onHandleIncludeDesactiveStores: (checked: boolean) => void;
	onHoverAutocompleteOption: (store: StoreDTO|null) => void;
	onStartSearchByAutocompletion: () => void;
	onHideSearchCoordResults: (hide: boolean) => void;
};

export default function StoreSearchBar({
  stores,
  searchByCoords,
  includeDesactiveStores,
	rangeOptions,
	selectedRange,
	totalStoresFoundBySearchRange,
  onSelectStore,
  onSwitchSearchByCoords,
  onSelectRange,
  onHandleIncludeDesactiveStores,
	onHoverAutocompleteOption,
	onStartSearchByAutocompletion = () => {},
	onHideSearchCoordResults,
}: StoreSearchBarProps) {
	const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("address");
	const [inputValue, setInputValue] = useState<string>('');
	const [hideSearchCoordResults, setHideSearchCoordResults] = useState<boolean>(false);
	// const [selectedRange, setSelectedRange] = useState<number>(rangeOptions[0] ? rangeOptions[0].value : 100);


	const handleSelectStore = (store: StoreDTO) => {
			// onAddStore(idRouteDay, idStore);
			onSelectStore(store);
			setInputValue("");
			onHoverAutocompleteOption(null); // Reset hover state after adding a store
	}

	const handleSelectRange = (range: number) => {
		// setSelectedRange(range);
		onSelectRange(range);
	}

	const handleHideSearchCoordResults = (hide: boolean) => {
		setHideSearchCoordResults(hide);
		onHideSearchCoordResults(hide);
	}

  return (
    <div className="flex flex-row items-center w-full bg-[#f5f5f5] border-2 rounded-md p-2 gap-4">
      {/* Search type toggle */}
      <div className="flex flex-row basis-2/4 items-center gap-2">
        <div className="flex basis-2/5">
					<ToggleButtonGroup
						value={searchStoreBy}
						exclusive
						onChange={(_, val) => val && setSearchStoreBy(val)}
						size="small"
					>
						<ToggleButton value="name">Nombre</ToggleButton>
						<ToggleButton value="address">Dirección</ToggleButton>
					</ToggleButtonGroup>
				</div>
        <div className="flex flex-row items-center gap-1 w-full">
          <SearchIcon />
            <Autocomplete
                options={stores.map((item) => { return { id: item.id_store, ...item }})}
                className="w-full"
                getOptionKey={(option) => option.id_store}
                getOptionLabel={(option) => searchStoreBy === "name" ? option.store_name ?? "Nombre no disponible" : getAddressOfStore(option)}
                inputValue={inputValue}
								onChange={(event, newValue) => { 
                    if (newValue) {
                        handleSelectStore(newValue);
                    }
                }}
            renderOption={(props, option) => (
                <li
                {...props}
                key={option.id_store}
                onMouseEnter={() => onHoverAutocompleteOption(option)} // Detect hover
                onMouseLeave={() => onHoverAutocompleteOption(null)} // Detect hover
                >
									<div className="flex flex-col">
											<span>{option.store_name ?? "Nombre no disponible"}</span>
											<span className="text-sm">{getAddressOfStore(option)}</span>
									</div>
                </li>
            )}

            renderInput={(params) => <TextField 
                onChange={(event) => { setInputValue(event.target.value); }}
                {...params} label="Add Item" />}
            />
        </div>
      </div>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      {/* Search by coords */}
      <div className="flex flex-col items-center min-w-[180px]">
        <div className="flex flex-row items-center gap-2">
          <span>Buscar por coordenadas</span>
          <Switch
            checked={searchByCoords}
            onChange={e => onSwitchSearchByCoords(e.target.checked)}
            color="primary"
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <span>Ocultar busqueda: </span>
          <Switch
            checked={hideSearchCoordResults}
            onChange={e => handleHideSearchCoordResults(e.target.checked)}
            color="primary"
          />
        </div>
				{totalStoresFoundBySearchRange !== null && <span className="text-base font-semibold">Resultado: {totalStoresFoundBySearchRange}</span>}
        <span className="text-base italic">Rango de búsqueda</span>
        <ToggleButtonGroup
          value={selectedRange}
          exclusive
          onChange={(_, val) => val && handleSelectRange(val)}
          size="small"
        >
          {rangeOptions.map(opt => (
            <ToggleButton key={opt.value} value={opt.value}>{opt.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      {/* Include desactive stores */}
      <div className="flex flex-col items-center gap-2 min-w-[180px]">
        <FormControlLabel
          control={
            <Checkbox
              checked={includeDesactiveStores}
              onChange={e => onHandleIncludeDesactiveStores(e.target.checked)}
            />
          }
          label={<span>Incluir tiendas desactivadas<br />en la búsqueda</span>}
        />
      </div>
    </div>
  );
}
