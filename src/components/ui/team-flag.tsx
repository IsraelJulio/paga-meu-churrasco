"use client";
import { useState } from "react";

interface TeamFlagProps {
  flagUrl?: string | null;
  code: string;
  primaryColor?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: { outer: "w-6 h-6", text: "text-[9px]" },
  sm: { outer: "w-9 h-9", text: "text-xs" },
  md: { outer: "w-10 h-10", text: "text-sm" },
  lg: { outer: "w-16 h-16", text: "text-xl" },
};

export function TeamFlag({ flagUrl, code, primaryColor, size = "md", className = "" }: TeamFlagProps) {
  const [imgError, setImgError] = useState(false);
  const { outer, text } = sizes[size];
  const containerClass = `${outer} rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${className}`;

  if (flagUrl && !imgError) {
    return (
      <div className={containerClass}>
        <img
          src={flagUrl}
          alt={`Bandeira ${code}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} text-white font-bold ${text}`}
      style={{ backgroundColor: primaryColor || "#6366f1" }}
    >
      {code}
    </div>
  );
}
