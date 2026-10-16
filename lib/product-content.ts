import fs from "fs";
import path from "path";
import { featuredProducts } from "./company-content";
import { type ProductContent, type ProductId } from "./product-content-types";

export function getProductContent(id: ProductId): ProductContent {
  const data: ProductContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/products", `${id}.json`), "utf8"));
  return { ...data, screen: data.screenHidden ? null : data.screen };
}
export function getFeaturedProducts() {
  return featuredProducts.map(product => ({ ...product, ...getProductContent(product.id) }));
}
