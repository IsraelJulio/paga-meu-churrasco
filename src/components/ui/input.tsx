import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-slate-300"
          >
            {label}
            {props.required && <span className="text-orange-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border-2 px-4 text-base text-slate-100 placeholder:text-slate-500 transition-all",
            "border-white/10 bg-white/5",
            "focus:outline-none focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)]",
            error && "border-red-500/60 focus:border-red-500/70 focus:ring-red-400/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
