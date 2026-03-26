export function bytesToBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

export function base64ToBytes(value: string) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}

export function stringToBase64(value: string) {
  return Buffer.from(value, "utf-8").toString("base64");
}

export function base64ToString(value: string) {
  return Buffer.from(value, "base64").toString("utf-8");
}

