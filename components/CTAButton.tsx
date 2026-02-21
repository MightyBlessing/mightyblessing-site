import Link from "next/link";

type Props = { href: string; label: string; className?: string; size?: "sm" | "md" };

export function CTAButton({ href, label, className = "", size = "md" }: Props) {
  const base =
    "inline-flex items-center justify-center font-semibold text-white transition hover:opacity-90 rounded-full bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2";
  const sizes = size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm";
  return (
    <Link href={href} className={`${base} ${sizes} ${className}`}>
      {label}
    </Link>
  );
}
