import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
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
