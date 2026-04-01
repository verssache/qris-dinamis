import { calculateCRC16 } from "./crc16";
import { parseTLV } from "./parser";
import type { ValidationResult } from "./types";

/**
 * Validate a QRIS string for structural correctness.
 */
export function validateQRIS(qrisString: string): ValidationResult {
  const errors: string[] = [];

  if (!qrisString || qrisString.trim().length === 0) {
    return { valid: false, errors: ["QRIS string is empty"] };
  }

  const str = qrisString.trim();

  // Must start with payload format indicator "000201"
  if (!str.startsWith("000201")) {
    errors.push(
      'QRIS must start with Payload Format Indicator "000201"'
    );
  }

  // Minimum length check (header + CRC = at least 20 chars)
  if (str.length < 20) {
    errors.push("QRIS string is too short");
    return { valid: false, errors };
  }

  // CRC validation
  const dataWithoutCRC = str.substring(0, str.length - 4);
  const declaredCRC = str.substring(str.length - 4);
  const calculatedCRC = calculateCRC16(dataWithoutCRC);

  if (declaredCRC.toUpperCase() !== calculatedCRC) {
    errors.push(
      `CRC mismatch: expected ${calculatedCRC}, got ${declaredCRC.toUpperCase()}`
    );
  }

  // Try to parse TLV structure
  const elements = parseTLV(str);

  if (elements.length === 0) {
    errors.push("Failed to parse any TLV elements");
    return { valid: false, errors };
  }

  // Check required tags
  const tags = new Set(elements.map((e) => e.tag));

  const requiredTags = [
    { tag: "00", name: "Payload Format Indicator" },
    { tag: "01", name: "Point of Initiation Method" },
    { tag: "52", name: "Merchant Category Code" },
    { tag: "53", name: "Transaction Currency" },
    { tag: "58", name: "Country Code" },
    { tag: "59", name: "Merchant Name" },
    { tag: "60", name: "Merchant City" },
    { tag: "63", name: "CRC" },
  ];

  for (const req of requiredTags) {
    if (!tags.has(req.tag)) {
      errors.push(`Missing required tag ${req.tag} (${req.name})`);
    }
  }

  // Check Point of Initiation Method value
  const method = elements.find((e) => e.tag === "01");
  if (method && method.value !== "11" && method.value !== "12") {
    errors.push(
      `Invalid Point of Initiation Method: "${method.value}" (must be "11" or "12")`
    );
  }

  // Check at least one merchant account info exists (tags 26-51)
  const hasMerchant = elements.some((e) => {
    const n = parseInt(e.tag, 10);
    return n >= 26 && n <= 51;
  });
  if (!hasMerchant) {
    errors.push("No Merchant Account Information found (tags 26-51)");
  }

  return { valid: errors.length === 0, errors };
}
