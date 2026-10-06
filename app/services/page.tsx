import { permanentRedirect } from "next/navigation";

/** Preserve the former product-directory URL with one canonical destination. */
export default function ServicesPage() { permanentRedirect("/products"); }
