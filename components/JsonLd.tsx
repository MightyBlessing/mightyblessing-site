import { serializeJsonLd } from "@/lib/structured-data";

export function JsonLd({ data }: { data: object | null }) {
  return data ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} /> : null;
}
