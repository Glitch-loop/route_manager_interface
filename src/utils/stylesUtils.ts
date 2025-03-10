import { enumStoreStates } from "@/interfaces/enumStoreStates"
import { colorTypes, sizeTypes } from "../interfaces/typesSystem"
import { IMapMarker, IStore, IStoreStatusDay } from "@/interfaces/interfaces"
import DAYS_OPERATIONS from "./dayOperations"

function deterimneIconSize(colorSelected:sizeTypes){
    let iconSize = ""
    switch(colorSelected) {
        case 'small':
            iconSize = "p-2 text-xl"
            break
        case 'base':
            iconSize = "p-3 text-3xl"
            break
        case 'big':
            iconSize = "p-4 text-4xl"
            break
        default:
            iconSize = "p-2 text-xl"
            break
    }
    return iconSize
}

function determineBackgroundColor(colorSelected:colorTypes){
    let backgroundColor = ""
    switch(colorSelected) {
        case 'info':
            backgroundColor = "bg-color-info-primary"
            break
        case 'warning-1':
            backgroundColor = "bg-color-warning-primary"
            break
        case 'warning-2':
            backgroundColor = "bg-color-warning-secondary"
            break
        case 'success-1':
            backgroundColor = "bg-color-success-primary"
            break
        case 'success-2':
            backgroundColor = "bg-color-success-secondary"
            break
        case 'danger-1':
            backgroundColor = "bg-color-danger-primary"
            break
        case 'danger-2':
            backgroundColor = "bg-color-danger-secondary"
            break
        default:
            backgroundColor = "bg-color-info-primary"
            break
    }
    return backgroundColor
}

// Related to store context
const determineStoreContextBackgroundColor = (store: IStore&IStoreStatusDay, currentOperation: boolean) => {
    if (currentOperation === true) {
      return "rgb(99, 102, 241)"; // Tailwind `bg-indigo-500`
    } else {
      switch (store.route_day_state) {
        case enumStoreStates.NEW_CLIENT:
          return "rgb(74, 222, 128)"; // Tailwind `bg-green-400`
        case enumStoreStates.SPECIAL_SALE:
          return "rgb(234, 88, 12)"; // Tailwind `bg-orange-600`
        case enumStoreStates.REQUEST_FOR_SELLING:
          return "rgb(245, 158, 11)"; // Tailwind `bg-amber-500`
        case enumStoreStates.SERVED:
          return "rgba(253, 230, 138, 0.75)"; // Tailwind `bg-amber-200/75` (with transparency)
        default:
          return "rgb(252, 211, 77)"; // Tailwind `bg-amber-300`
      }
    }
};
  
// Related to day operations
const determineDayOperationTypeBackgroundColor = (id_operation_type:string):string => {
    let backgroundColor:string = "rgb(242, 242, 242)";
    

    if (DAYS_OPERATIONS.start_shift_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.restock_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)"; 
    } else if (DAYS_OPERATIONS.end_shift_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.product_devolution_inventory === id_operation_type) {
        backgroundColor = "rgb(252, 165, 165)";
    } else if (DAYS_OPERATIONS.product_devolution === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else if (DAYS_OPERATIONS.sales === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else if (DAYS_OPERATIONS.product_reposition === id_operation_type) {
        backgroundColor = "rgb(242, 242, 242)";
    } else {
        backgroundColor = "rgb(242, 242, 242)";
    }

    return backgroundColor;
}

// Convert HEX to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    return { 
      r: (bigint >> 16) & 255, 
      g: (bigint >> 8) & 255, 
      b: bigint & 255 
    };
  };
  
export const getGradientColor = (baseHex: string, position: number, total: number) => {
    const maxStores = 50;
    const adjustedTotal = Math.max(total, maxStores); // Cap at 50 stores
  
    // Reduce brightness proportionally (making it darker as position increases)
    const factor = Math.pow(position / adjustedTotal, 1); // Slows the darkening effect
    
    // Convert base HEX to RGB
    const baseColor = hexToRgb(baseHex);
  
    const r = Math.max(0, Math.floor(baseColor.r * (1 - factor))); // Reduce R
    const g = Math.max(0, Math.floor(baseColor.g * (1 - factor))); // Reduce G
    const b = Math.max(0, Math.floor(baseColor.b * (1 - factor))); // Reduce B
  
    return `rgb(${r}, ${g}, ${b})`;
  };

export const getLightestMarker = (markers: IMapMarker[]): IMapMarker | null => {
    if (markers.length === 0) return null;
  
    // Function to extract RGB values and convert to HSL lightness
    const getLightness = (rgb: string): number => {
      const match = rgb.match(/\d+/g); // Extract numbers from "rgb(r, g, b)"
      if (!match || match.length < 3) return 0;
  
      const [r, g, b] = match.map(Number);
  
      // Convert to HSL and return lightness (L)
      const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      return (max + min) / 2 * 100; // Lightness percentage (0-100)
    };
  
    // Find the marker with the highest lightness value
    return markers.reduce((lightest, marker) => 
      getLightness(marker.color_item) > getLightness(lightest.color_item) ? marker : lightest
    , markers[0]);
  };

// Function to generate a light color based on an index
export const generateLightColor = (index: number, totalRoutes: number) => {
    const hue = (index * (360 / totalRoutes)) % 360; // Spread colors evenly in the spectrum
    const saturation = 60; // Keep colors vibrant but not too strong
    const lightness = 75; // High lightness for soft colors
  
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Convert HSL to HEX
export const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
    return `#${f(0).toString(16).padStart(2, "0")}${f(8).toString(16).padStart(2, "0")}${f(4).toString(16).padStart(2, "0")}`;
  };

export  const generateRandomLightColor = (): string => {
    const hue = Math.floor(Math.random() * 360); // Random hue (0-360)
    const saturation = Math.floor(Math.random() * 30) + 50; // Keep saturation between 50-80%
    const lightness = Math.floor(Math.random() * 30) + 70; // Keep lightness between 70-100% (light colors)
  
    return hslToHex(hue, saturation, lightness);
  };
  

export const createCustomMarker = (color: string) => ({
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
        <path fill="${color}" stroke="black" stroke-width="2" d="M12 2C8 2 5 5 5 9c0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `)}`,
    scaledSize: { width: 40, height: 40 },
  });

export {
    deterimneIconSize,
    determineBackgroundColor,
    determineStoreContextBackgroundColor,
    determineDayOperationTypeBackgroundColor
}