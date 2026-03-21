"use client";

import { useEffect, useState } from "react";
import { Button, Select, MenuItem, FormControl } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type RangeOption = "1week" | "2weeks" | "1month" | "3months" | "6months" | "1year";
type Direction = "before" | "after";

interface RangeDateSelectionProps {
    onRangeChange?: (fromDate: Dayjs, toDate: Dayjs) => void;
}

export default function RangeDateSelection({ onRangeChange }: RangeDateSelectionProps) {
    const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
    const [toDate, setToDate] = useState<Dayjs>(dayjs());
    const [selectedRange, setSelectedRange] = useState<RangeOption | "">("");
    const [direction, setDirection] = useState<Direction>("before");

    useEffect(() => { 
        if (onRangeChange) {
            onRangeChange(dayjs(), dayjs());
        }
    } , [])

    const rangeOptions: { value: RangeOption; label: string; days: number }[] = [
        { value: "1week", label: "1 semana", days: 7 },
        { value: "2weeks", label: "Quincena", days: 14 },
        { value: "1month", label: "1 mes", days: 30 },
        { value: "3months", label: "3 meses", days: 90 },
        { value: "6months", label: "6 meses", days: 180 },
        { value: "1year", label: "1 año", days: 365 },
    ];

    const handleRangeSelect = (range: RangeOption) => {
        setSelectedRange(range);
        const option = rangeOptions.find((opt) => opt.value === range);
        if (!option) return;

        let newFromDate: Dayjs;
        let newToDate: Dayjs;

        if (direction === "before") {
            // Calculate backwards from "to" date
            newToDate = toDate;
            newFromDate = toDate.subtract(option.days, "day");
        } else {
            // Calculate forward from "from" date
            newFromDate = fromDate;
            newToDate = fromDate.add(option.days, "day");
        }

        setFromDate(newFromDate);
        setToDate(newToDate);
        onRangeChange?.(newFromDate, newToDate);
    };

    const toggleDirection = () => {
        setDirection((prev) => (prev === "before" ? "after" : "before"));
    };

    const handleFromDateChange = (date: Dayjs | null) => {
        if (date) {
            setFromDate(date);
            setSelectedRange("");
            onRangeChange?.(date, toDate);
        }
    };

    const handleToDateChange = (date: Dayjs | null) => {
        if (date) {
            setToDate(date);
            setSelectedRange("");
            onRangeChange?.(fromDate, date);
        }
    };

    const handleResetToday = () => {
        const today = dayjs();
        setFromDate(today);
        setToDate(today);
        setSelectedRange("");
        onRangeChange?.(today, today);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-2 p-2 bg-system-primary-background rounded-lg w-fit">
                {/* Section 1: Range selector with direction toggle */}
                <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1">
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                            value={selectedRange}
                            onChange={(e) => handleRangeSelect(e.target.value as RangeOption)}
                            displayEmpty
                            variant="standard"
                            disableUnderline
                            sx={{ fontSize: "0.875rem" }}
                        >
                            <MenuItem value="" disabled>
                                <em>Seleccionar...</em>
                            </MenuItem>
                            {rangeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <span className="text-gray-400 mx-1">|</span>

                    <Button
                        size="small"
                        onClick={toggleDirection}
                        sx={{
                            textTransform: "none",
                            fontSize: "0.75rem",
                            minWidth: "auto",
                            color: direction === "before" ? "#007BFF" : "#2ECC71",
                        }}
                    >
                        {direction === "before" ? "Antes" : "Después"}
                    </Button>
                </div>

                {/* Section 2: From and To date pickers */}
                <div className="flex gap-2">
                    <DatePicker
                        value={fromDate}
                        onChange={handleFromDateChange}
                        slotProps={{
                            textField: {
                                size: "small",
                                placeholder: "Desde...",
                                sx: {
                                    backgroundColor: "white",
                                    borderRadius: 1,
                                    width: 130,
                                    "& .MuiInputBase-input": {
                                        fontSize: "0.875rem",
                                    },
                                },
                            },
                        }}
                    />
                    <DatePicker
                        value={toDate}
                        onChange={handleToDateChange}
                        slotProps={{
                            textField: {
                                size: "small",
                                placeholder: "Hasta...",
                                sx: {
                                    backgroundColor: "white",
                                    borderRadius: 1,
                                    width: 130,
                                    "& .MuiInputBase-input": {
                                        fontSize: "0.875rem",
                                    },
                                },
                            },
                        }}
                    />
                </div>

                {/* Section 3: Reset to today button */}
                <div className="flex justify-end">
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleResetToday}
                        sx={{
                            backgroundColor: "#007BFF",
                            "&:hover": { backgroundColor: "#0056b3" },
                            textTransform: "none",
                            fontSize: "0.875rem",
                        }}
                    >
                        Hoy
                    </Button>
                </div>
            </div>
        </LocalizationProvider>
    );
}
