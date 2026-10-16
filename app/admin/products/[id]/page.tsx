import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminProduct } from "@/lib/admin/product-admin";
import { isProductId } from "@/lib/product-content-types";
import { ProductEditor } from "@/components/admin/ProductEditor";
export const dynamic = "force-dynamic";
export default async function ProductAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  if (!isProductId(id)) notFound();
  return <section className="bg-neutral-950 text-white"><div className="container-wide py-12"><ProductEditor initialValue={await getAdminProduct(id)} /></div></section>;
}
