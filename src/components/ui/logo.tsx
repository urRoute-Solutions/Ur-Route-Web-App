import { cn } from "@/lib/utils";

/**
 * The square icon mark — navy background, white U-route path,
 * green destination dot. Works at any size from 16 px to 512 px.
 */
export function LogoMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Navy rounded-square background */}
      <rect width="40" height="40" rx="10" fill="#1B2D78" />

      {/* U-curve: the route path from origin → destination */}
      <path
        d="M10 15 C10 31 30 31 30 15"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Origin dot — white */}
      <circle cx="10" cy="11.5" r="3.5" fill="white" />

      {/* Destination dot — green */}
      <circle cx="30" cy="11.5" r="4.5" fill="#16A34A" />

      {/* Arrow inside destination dot */}
      <path
        d="M28.4 13.2 L30 9.8 L31.6 13.2"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Full logo — icon mark + wordmark.
 * variant="color"  → "ur" navy, "Route" green (light backgrounds)
 * variant="white"  → both parts white (dark backgrounds, e.g. footer)
 */
export function Logo({
  size = "default",
  variant = "color",
  className,
}: {
  size?: "sm" | "default" | "lg";
  variant?: "color" | "white";
  className?: string;
}) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 34;
  const textClass =
    size === "sm"
      ? "text-[15px]"
      : size === "lg"
        ? "text-[22px]"
        : "text-[17px]";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={iconSize} />
      <span className={cn("font-black tracking-tight leading-none", textClass)}>
        {variant === "white" ? (
          <span className="text-white">urRoute</span>
        ) : (
          <>
            <span className="text-primary">ur</span>
            <span className="text-action">Route</span>
          </>
        )}
      </span>
    </span>
  );
}
