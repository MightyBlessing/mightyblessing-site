import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { productNames } from "@/lib/product-content-types";
export const dynamic = "force-dynamic";
export default async function ProductsAdminPage() {
  await requireAdminSession();
  return <section className="bg-neutral-950 text-white"><div className="container-wide py-12"><Link href="/admin" className="underline">← 관리자</Link><h1 className="mt-6 text-3xl font-semibold">제품 관리</h1><p className="mt-4 text-neutral-300">화면 이미지와 소개 문구를 수정합니다. 저장 후 운영 반영은 빌드·배포 결과에서 확인합니다.</p><ul className="mt-8 max-w-3xl divide-y divide-neutral-700">{Object.entries(productNames).map(([id, name]) => <li key={id}><Link href={`/admin/products/${id}`} className="flex justify-between py-6 text-xl">{name}<span>편집 →</span></Link></li>)}</ul></div></section>;
}
