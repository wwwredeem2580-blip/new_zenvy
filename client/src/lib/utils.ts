import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatDate(date);
}

export function formatTime(date: string | Date | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const ALLOWED_EXTENSIONS_DISPLAY = "JPG, PNG, PDF";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format. Please select only ${ALLOWED_EXTENSIONS_DISPLAY} files.`,
    };
  }
  
  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `File is too large. Maximum size allowed is ${MAX_SIZE_MB}MB.`,
    };
  }
  
  return { valid: true };
}

export function getAvatarUrl(nameOrEmail: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameOrEmail)}`;
}

export function validatePreviewUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
