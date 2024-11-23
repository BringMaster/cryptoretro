import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with proper currency symbol and decimals
export const formatPrice = (price: string | number | null | undefined) => {
  if (price === null || price === undefined) {
    return '$0.00';
  }
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // For very small numbers (less than $0.01), use scientific notation
  if (numPrice < 0.01 && numPrice > 0) {
    return `$${numPrice.toFixed(8)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
};

// Format large numbers (market cap, volume) with proper abbreviations
export const formatMarketCap = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }
  
  return `$${num.toFixed(2)}`;
};

// Format percentage with proper sign and decimals
export const formatPercentage = (percent: string | number | null | undefined) => {
  if (percent === null || percent === undefined) {
    return '0.00%';
  }
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

// Format large numbers for supply
export const formatSupply = (supply: string | number | null | undefined) => {
  if (supply === null || supply === undefined) {
    return '0';
  }
  const num = typeof supply === 'string' ? parseFloat(supply) : supply;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(num);
};
