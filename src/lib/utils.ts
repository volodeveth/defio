import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number | string,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0.00';
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

export function formatNumber(
  value: number | string,
  decimals: number = 2
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // For very large numbers, use abbreviations
  if (numValue >= 1e9) {
    return (numValue / 1e9).toFixed(1) + 'B';
  } else if (numValue >= 1e6) {
    return (numValue / 1e6).toFixed(1) + 'M';
  } else if (numValue >= 1e3) {
    return (numValue / 1e3).toFixed(1) + 'K';
  }
  
  return numValue.toFixed(decimals);
}

export function formatPercent(
  value: number | string,
  decimals: number = 2
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
}

export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): bigint {
  try {
    const [whole, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    const fullAmount = whole + paddedFraction;
    return BigInt(fullAmount);
  } catch {
    return BigInt(0);
  }
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18,
  displayDecimals: number = 6
): string {
  try {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionPart = amount % divisor;
    
    const fractionStr = fractionPart.toString().padStart(decimals, '0');
    const trimmedFraction = fractionStr.slice(0, displayDecimals).replace(/0+$/, '');
    
    if (trimmedFraction === '') {
      return wholePart.toString();
    }
    
    return `${wholePart.toString()}.${trimmedFraction}`;
  } catch {
    return '0';
  }
}