
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format date to readable string
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Calculate BMI category text and color
export function getBMICategory(bmi: number): { text: string; color: string } {
  if (bmi < 18.5) {
    return { text: "Underweight", color: "text-blue-600" };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { text: "Normal weight", color: "text-green-600" };
  } else if (bmi >= 25 && bmi < 30) {
    return { text: "Overweight", color: "text-yellow-600" };
  } else {
    return { text: "Obese", color: "text-red-600" };
  }
}

/**
 * Detect if the current device is iOS
 * @returns {boolean} true if iOS device
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Get iOS version if on iOS device
 * @returns {number|null} iOS version number or null if not iOS
 */
export function getIOSVersion(): number | null {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Apply iOS-specific styling to an element
 * @param {HTMLElement} element - Element to apply styles to
 */
export function applyIOSStyles(element: HTMLElement | null): void {
  if (!element || !isIOSDevice()) return;
  
  // Add iOS-specific classes
  element.classList.add('ios-element');
  
  // Prevent double-tap to zoom
  element.style.touchAction = 'manipulation';
  
  // Disable callout on long press
  element.style.webkitTouchCallout = 'none';
  
  // Disable user select
  element.style.webkitUserSelect = 'none';
}

/**
 * Format a date in iOS-style format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatIOSDate(date: Date): string {
  if (isIOSDevice()) {
    // iOS uses a slightly different date format
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric",
    }).format(date);
  }
  
  return formatDate(date);
}
