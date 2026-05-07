import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md" | "lg"; // Button size
  variant?: "primary" | "outline" | "success" | "error" | "warning" | "primary-soft" | "error-soft"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional classes
  type?: "button" | "submit" | "reset"; // Button type
  title?: string; // Tooltip title
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  title,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3 text-sm font-medium",
    lg: "px-7 py-3.5 text-base font-medium",
  };

  // Variant Classes matching TailAdmin screenshots
  const variantClasses = {
    primary:
      "bg-[#465FFF] text-white shadow-theme-xs hover:bg-[#3641F5] disabled:bg-[#465FFF]/50",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/[0.03] dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.08] dark:hover:text-gray-300",
    success:
      "bg-[#12B76A] text-white shadow-theme-xs hover:bg-[#039855] disabled:bg-[#12B76A]/50",
    error:
      "bg-[#F04438] text-white shadow-theme-xs hover:bg-[#D92D20] disabled:bg-[#F04438]/50",
    warning:
      "bg-[#F79009] text-white shadow-theme-xs hover:bg-[#DC6803] disabled:bg-[#F79009]/50",
    "primary-soft":
      "bg-blue-500/15 text-[#60A5FA] ring-1 ring-blue-500/35 hover:bg-blue-500/25 dark:bg-blue-500/15 dark:text-[#60A5FA] dark:ring-blue-500/35 dark:hover:bg-blue-500/25",
    "error-soft":
      "bg-red-500/15 text-[#F87171] ring-1 ring-red-500/35 hover:bg-red-500/25 dark:bg-red-500/15 dark:text-[#F87171] dark:ring-red-500/35 dark:hover:bg-red-500/25",
  };

  return (
    <button
      type={type}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-[0.98] ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
