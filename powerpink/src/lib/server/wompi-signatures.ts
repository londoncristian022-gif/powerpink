import { createHash, timingSafeEqual } from "node:crypto";

export interface WompiEvent {
  event: string;
  data: Record<string, unknown>;
  environment: string;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
}

function getPropertyValue(data: Record<string, unknown>, path: string): string | number | null {
  const value = path.split(".").reduce<unknown>((current, segment) => {
    if (typeof current !== "object" || current === null || !(segment in current)) return null;
    return (current as Record<string, unknown>)[segment];
  }, data);

  return typeof value === "string" || typeof value === "number" ? value : null;
}

export function createIntegritySignature(
  reference: string,
  amountInCents: number,
  integritySecret: string,
): string {
  return createHash("sha256")
    .update(`${reference}${amountInCents}COP${integritySecret}`, "utf8")
    .digest("hex");
}

export function verifyWompiEvent(event: WompiEvent, eventsSecret: string): boolean {
  if (
    !Array.isArray(event.signature.properties) ||
    event.signature.properties.length === 0 ||
    !Number.isSafeInteger(event.timestamp) ||
    !/^[a-f\d]{64}$/i.test(event.signature.checksum)
  ) {
    return false;
  }

  const propertyValues = event.signature.properties.map((path) =>
    getPropertyValue(event.data, path),
  );
  if (propertyValues.some((value) => value === null)) return false;

  const expectedChecksum = createHash("sha256")
    .update(`${propertyValues.join("")}${event.timestamp}${eventsSecret}`, "utf8")
    .digest("hex");
  const actualBuffer = Buffer.from(event.signature.checksum.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expectedChecksum, "hex");
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
