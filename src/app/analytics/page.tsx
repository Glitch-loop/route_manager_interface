// Libraries
import { useState } from "react";
import { Dayjs } from "dayjs";

// Components
import RangeDateSelection from "@/shared/components/RangeDateSelection/RangeDateSelection";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

// Constants
import { AMOUNT_OF_DAYS_RANGE_GROUPS } from "./constants/constants";



export default function Page() {
  const [startDateSelected, setStartDateSelected] = useState<Dayjs | null>(null);
  const [endDateSelected, setEndDateSelected] = useState<Dayjs | null>(null);
  const handleDateRangeChange = (start: Dayjs | null, end: Dayjs | null) => {
      setStartDateSelected(start);
      setEndDateSelected(end);
  }
  const [selectedRangeForGrouping, setSelectedRangeForGrouping] = useState<number>(AMOUNT_OF_DAYS_RANGE_GROUPS[3].amount_of_days);
  return (
  <aside>
    <h1>Analytics</h1>
        <RangeDateSelection 
            initialDirection="before"
            initialSelectedRange="1month"
            onRangeChange={handleDateRangeChange}
        />
        <ToggleButtonGroup
          value={selectedRangeForGrouping}
          exclusive
          onChange={(_, val) => val && setSelectedRangeForGrouping(val)}
          size="small"
        >
          {AMOUNT_OF_DAYS_RANGE_GROUPS.map(opt => (
            <ToggleButton key={opt.amount_of_days} value={opt.amount_of_days}>{opt.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
  </aside>
  )
}