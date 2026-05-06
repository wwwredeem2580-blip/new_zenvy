"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  size?: number;
}

export default function UserAvatar({ name, src, className = "", size = 32 }: UserAvatarProps) {
  const [error, setError] = useState(false);

  // Fallback UI
  const renderFallback = () => {
    // Generate initials (up to 2 chars)
    const initials = name
      ? name
          .split(/[ @]/) // split by space or @ (for emails)
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "?";

    // Generate a consistent professional color based on name
    const professionalColors = [
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f97316", // Orange
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f43f5e", // Rose
      "#6366f1", // Indigo
    ];
    
    const colorIndex = name 
      ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % professionalColors.length
      : 0;
    const bgColor = professionalColors[colorIndex];

    return (
      <div 
        className={`rounded-full flex items-center justify-center text-white font-bold uppercase tracking-tighter shadow-inner ${className}`}
        style={{ 
          width: size, 
          height: size, 
          fontSize: Math.max(size / 2.5, 10),
          backgroundColor: bgColor,
          lineHeight: 1
        }}
      >
        {initials}
      </div>
    );
  };

  if (!src || error) {
    return renderFallback();
  }

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className="w-full h-full rounded-full object-cover border border-black/5"
      />
    </div>
  );
}
