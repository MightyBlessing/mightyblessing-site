import Link from "next/link";

type Props = { href: string; label: string; className?: string; size?: "sm" | "md" | "lg"; showArrow?: boolean };

export function CTAButton({ href, label, className = "", size = "md", showArrow = false }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full bg-neutral-950 font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2";
  const sizes =
    size === "sm"
      ? "px-5 py-2.5 text-sm"
      : size === "lg"
        ? "px-8 py-4 text-base md:text-lg"
        : "px-5 py-2.5 text-sm";
  return (
    <Link href={href} className={`${base} ${sizes} ${className}`}>
      {label}
      {showArrow && <span className="material-icons-outlined ml-2 text-xl">arrow_forward</span>}
    </Link>
  );
}
