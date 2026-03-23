"use client";
import { useState, useEffect, useRef } from "react";
import { IconButton, Popover, Tooltip } from "@mui/material";
import { Palette } from "@mui/icons-material";
import { generateRandomColor, getContrastColor } from "@/shared/utils/styles/utils";

interface ColorPickerProps {
    initialColor?: string;
    size?: number;
    onChange?: (color: string) => void;
    tooltip?: string;
}

// Predefined color palette
const COLOR_PALETTE = [
    '#FF5733', '#FF8C33', '#FFC300', '#DAF7A6', '#33FF57',
    '#33FFF5', '#33A1FF', '#3357FF', '#8E44AD', '#FF33F5',
    '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#2ECC71',
    '#F39C12', '#D35400', '#C0392B', '#7F8C8D', '#2C3E50',
];


// Default color used for SSR to avoid hydration mismatch
const DEFAULT_COLOR = '#3498DB';

export default function ColorPicker({ 
    initialColor, 
    size = 48, 
    onChange,
    tooltip = "Seleccionar color"
}: ColorPickerProps) {
    // Use initialColor or default for consistent SSR/client render
    const [color, setColor] = useState<string>(initialColor ?? DEFAULT_COLOR);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);

    // Generate random color only on client mount if no initialColor provided
    useEffect(() => {
        if (!hasInitialized.current && !initialColor) {
            setColor(generateRandomColor());
            hasInitialized.current = true;
        }
    }, [initialColor]);

    // Update if initialColor prop changes
    useEffect(() => {
        if (initialColor) {
            setColor(initialColor);
        }
    }, [initialColor]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        onChange?.(newColor);
    };

    const handlePaletteColorClick = (paletteColor: string) => {
        handleColorChange(paletteColor);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleColorChange(event.target.value);
    };

    const open = Boolean(anchorEl);
    const contrastColor = getContrastColor(color);

    return (
        <>
            <Tooltip title={tooltip} placement="top" enterDelay={300} arrow>
                <IconButton
                    onClick={handleClick}
                    sx={{
                        backgroundColor: color,
                        color: contrastColor,
                        width: size,
                        height: size,
                        '&:hover': {
                            backgroundColor: color,
                            filter: 'brightness(0.9)',
                        },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    <Palette />
                </IconButton>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className="p-4 w-64">
                    {/* Current color display */}
                    <div className="flex items-center gap-3 mb-4">
                        <div 
                            className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-inner"
                            style={{ backgroundColor: color }}
                        />
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Color seleccionado</p>
                            <p className="font-mono font-semibold">{color.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Color palette grid */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {COLOR_PALETTE.map((paletteColor) => (
                            <button
                                key={paletteColor}
                                onClick={() => handlePaletteColorClick(paletteColor)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                    color === paletteColor ? 'border-black ring-2 ring-offset-1 ring-blue-500' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: paletteColor }}
                                title={paletteColor}
                            />
                        ))}
                    </div>

                    {/* Custom color picker */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Personalizado:</label>
                        <input
                            ref={inputRef}
                            type="color"
                            value={color}
                            onChange={handleInputChange}
                            className="w-10 h-8 cursor-pointer border-0 rounded"
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                    if (val.length === 7) {
                                        handleColorChange(val);
                                    } else {
                                        setColor(val);
                                    }
                                }
                            }}
                            className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                            maxLength={7}
                            placeholder="#000000"
                        />
                    </div>
                </div>
            </Popover>
        </>
    );
}
