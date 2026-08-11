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
  sellingGoalConfiguration: SellingGoalType | null;
  onChangeSellingGoalConfiguration: (config: SellingGoalType) => void;  
  onResetConfiguration: () => void;
};

export function SellingGoal({
  sellingGoalConfiguration,
  onChangeSellingGoalConfiguration,
  onResetConfiguration
}: SellingGoalProps) {

  // 1. Store previous prop reference to detect changes during render
  const [prevConfig, setPrevConfig] = useState<SellingGoalType | null>(sellingGoalConfiguration);

  // 2. Draft input state
  const [inputValue, setInputValue] = useState<string>(
    sellingGoalConfiguration?.target != null ? String(sellingGoalConfiguration.target) : ""
  );
  const [visibilityType, setVisibilityType] = useState<SellingGoalVisibilityType>(
    sellingGoalConfiguration?.show ?? "show_only_meet"
  );

  // 3. Sync draft state during render if props change (avoids double render cycle of useEffect)
  if (sellingGoalConfiguration !== prevConfig) {
    setPrevConfig(sellingGoalConfiguration);
    setInputValue(sellingGoalConfiguration?.target != null ? String(sellingGoalConfiguration.target) : "");
    setVisibilityType(sellingGoalConfiguration?.show ?? "show_only_meet");
  }

  // 4. Derive goalSelling directly from props (no duplicate state required)
  const goalSelling = sellingGoalConfiguration?.target ?? null;

  function handleApply() {
    const parsed = inputValue.trim() !== "" ? Number(inputValue) : null;
    onChangeSellingGoalConfiguration({ 
      target: parsed, 
      show: visibilityType 
    });
  }

  function handleReset() {
    setInputValue("");
    setVisibilityType("show_only_meet");
    onResetConfiguration();
  }

  function handleVisibilityChange(value: SellingGoalVisibilityType) {
    setVisibilityType(value);
    onChangeSellingGoalConfiguration({ 
      target: goalSelling, 
      show: value 
    });
  }

  return (
    <div className="overflow-auto ml-2 p-2 flex flex-row w-full bg-system-third-background rounded-lg gap-2">
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
    </div>
  );
}