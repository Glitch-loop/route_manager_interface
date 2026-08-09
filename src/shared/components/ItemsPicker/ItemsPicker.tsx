// Libraries
import { useState } from "react";

// MUI
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
} from "@mui/material";

// Types
import { 
  ItemsPickerType,
  ItemsPickerVisibilityType, 
  PickerItemType 
} from "@/shared/components/ItemsPicker/types/types";

type ItemsPickerProps = {
  pickerItems: PickerItemType[]
  onChangePickerConfiguration: (config: ItemsPickerType) => void;  
  onResetConfiguration: () => void;  
};


/**
 * This component displays a list of items with the capability of "selecting" them.
 * This component takes as done the order of how the items will be displayed.
 */
export function ItemsPicker({
  pickerItems,
  onChangePickerConfiguration,
  onResetConfiguration
}: ItemsPickerProps) { 
  const [visibilityConfiguration, setVisibilityConfiguration] = useState<ItemsPickerVisibilityType>("show_only_meet");
  const [selectedItems, setSelectedItems] = useState<string[]>(pickerItems.map((item) => item.id));

  function handleToggleItem(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleApply() {
    onChangePickerConfiguration({ selectedItems, show: visibilityConfiguration });
  }

  function handleReset() {
    const allIds = pickerItems.map((item) => item.id);
    setSelectedItems(allIds);
    setVisibilityConfiguration("show_only_meet");
    onResetConfiguration();
  }

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, minWidth: 260 }}>
      <RadioGroup
        value={visibilityConfiguration}
        onChange={(e) => setVisibilityConfiguration(e.target.value as ItemsPickerVisibilityType)}
      >
        <FormControlLabel
          value="show_only_meet"
          control={<Radio size="small" />}
          label="Mostrar aquellos que tienen los items"
        />
        <FormControlLabel
          value="show_only_not_meet"
          control={<Radio size="small" />}
          label="Mostrar aquellos que no tienen los items"
        />
      </RadioGroup>

      <Divider sx={{ my: 1 }} />

      <List dense disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 1, maxHeight: 200, overflowY: "auto" }}>
        {pickerItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ px: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleToggleItem(item.id)}
                />
              }
              label={item.itemName}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
        <Button variant="contained" size="small" onClick={handleApply} sx={{ flex: 1 }}>
          Aplicar
        </Button>
        <Button variant="outlined" size="small" onClick={handleReset} sx={{ flex: 1 }}>
          Resetear filtro
        </Button>
      </Box>
    </Box>
  );
}