import React, { useState } from "react";
import { Switch, TextField, ToggleButton, ToggleButtonGroup, FormControlLabel, Checkbox, Divider, Autocomplete } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StoreDTO from "@/application/dto/StoreDTO";
import { getAddressOfStore } from "@/shared/utils/stores/utils";

const RANGE_OPTIONS = [
  { label: "100m", value: 100 },
  { label: "300m", value: 300 },
  { label: "400m", value: 400 },
  { label: "1km", value: 1000 },
];

type StoreSearchBarProps = {
  stores: StoreDTO[];
  onSelectStore: (store: StoreDTO | null) => void;
  searchByCoords: boolean;
  onSwitchSearchByCoords: (active: boolean) => void;
  onSelectRange: (range: number) => void;
  includeDesactiveStores: boolean;
  onHandleIncludeDesactiveStores: (checked: boolean) => void;
	onHoverAutocompleteOption: (store: StoreDTO|null) => void;
	onStartSearchByAutocompletion: () => void;
};

export default function StoreSearchBar({
  stores,
  onSelectStore,
  searchByCoords,
  onSwitchSearchByCoords,
  onSelectRange,
  includeDesactiveStores,
  onHandleIncludeDesactiveStores,
	onHoverAutocompleteOption,
	onStartSearchByAutocompletion = () => {}
}: StoreSearchBarProps) {
	const [searchStoreBy, setSearchStoreBy] = useState<"name" | "address">("address");
	const [inputValue, setInputValue] = useState<string>('');
	const [selectedRange, setSelectedRange] = useState<number>(RANGE_OPTIONS[0].value);


	const handleSelectStore = (store: StoreDTO) => {
			// onAddStore(idRouteDay, idStore);
			onSelectStore(store);
			setInputValue("");
			onHoverAutocompleteOption(null); // Reset hover state after adding a store
	}

	const handleSelectRange = (range: number) => {
		console.log("Selected range:", range);
		setSelectedRange(range);
		onSelectRange(range);
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
						<ToggleButton value="name">By name</ToggleButton>
						<ToggleButton value="address">By address</ToggleButton>
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
      <div className="flex flex-col items-center gap-2 min-w-[180px]">
        <div className="flex flex-row items-center gap-2">
          <span>Search by coords</span>
          <Switch
            checked={searchByCoords}
            onChange={e => onSwitchSearchByCoords(e.target.checked)}
            color="primary"
          />
        </div>
        <span className="text-xs">Search range</span>
        <ToggleButtonGroup
          value={selectedRange}
          exclusive
          onChange={(_, val) => val && handleSelectRange(val)}
          size="small"
        >
          {RANGE_OPTIONS.map(opt => (
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
          label={<span>Include desactive stores<br />in search</span>}
        />
      </div>
    </div>
  );
}
