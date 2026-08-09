// Libraries
import { useState } from "react";

// Components
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Types
import { SellingGoalVisibilityType, SellingGoalType } from "@/shared/components/SellingGoal/types/types";

type SellingGoalProps = {
  onChangeSellingGoalConfiguration: (config: SellingGoalType) => void;  
  onResetConfiguration: () => void;  
};

export function SellingGoal({
  onChangeSellingGoalConfiguration,
  onResetConfiguration
}: SellingGoalProps) {
  const [goalSelling, setGoalSelling] = useState<number|null>(null);
  const [visibilityType, setVisibilityType] = useState<SellingGoalVisibilityType>("show_all");
  const [inputValue, setInputValue] = useState<string>("");

  function handleApply() {
    const parsed = inputValue !== "" ? Number(inputValue) : null;
    setGoalSelling(parsed);
    onChangeSellingGoalConfiguration({ target: parsed, show: visibilityType });
  }

  function handleReset() {
    setInputValue("");
    setGoalSelling(null);
    setVisibilityType("show_all");
    onResetConfiguration();
  }

  function handleVisibilityChange(value: SellingGoalVisibilityType) {
    setVisibilityType(value);
    onChangeSellingGoalConfiguration({ target: goalSelling, show: value });
  }

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, minWidth: 240 }}>
      <TextField
        label="Objetivo"
        type="number"
        size="small"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        inputProps={{ min: 0 }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <Button variant="contained" size="small" onClick={handleApply} sx={{ flex: 1 }}>
          Aplicar
        </Button>
        <Tooltip title="Resetear objetivo / Eliminar filtro">
          <IconButton size="small" onClick={handleReset}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="body2" color="text.secondary">
        Objetivo Actual
      </Typography>
      <Typography variant="body1" fontWeight="bold">
        {goalSelling !== null ? `$${goalSelling.toLocaleString()}` : "$—"}
      </Typography>

      <Divider sx={{ my: 1.5 }} />

      <RadioGroup
        value={visibilityType}
        onChange={(e) => handleVisibilityChange(e.target.value as SellingGoalVisibilityType)}
      >
        <FormControlLabel value="show_all" control={<Radio size="small" />} label="Mostrar todo" />
        <FormControlLabel value="show_only_meet" control={<Radio size="small" />} label="Mostrar los que cumplen" />
        <FormControlLabel value="show_only_not_meet" control={<Radio size="small" />} label="Mostrar los que no cumplen" />
      </RadioGroup>
    </Box>
  );
}