import { calculateCRC16 } from "./crc16";
import { parseTLV } from "./parser";
import type { ConvertOptions, TLV } from "./types";

/**
 * Rebuild a QRIS string from TLV elements (without CRC).
 */
function buildTLVString(elements: TLV[]): string {
  return elements
    .map((el) => {
      const value = el.children ? buildTLVString(el.children) : el.value;
      const length = value.length.toString().padStart(2, "0");
      return `${el.tag}${length}${value}`;
    })
    .join("");
}

/**
 * Create a TLV element.
 */
function makeTLV(tag: string, value: string, name = ""): TLV {
  return { tag, name, length: value.length, value };
}

/**
 * Convert a static QRIS string to dynamic by injecting amount and optional fee.
 *
 * Steps:
 * 1. Parse the TLV structure
 * 2. Change Point of Initiation Method from "11" (static) to "12" (dynamic)
 * 3. Insert/replace Transaction Amount (tag 54)
 * 4. Optionally insert Tip Indicator (tag 55) and fee value (tag 56/57)
 * 5. Recalculate CRC16 checksum
 */
export function convertQRIS(
  qrisString: string,
  options: ConvertOptions
): string {
  const elements = parseTLV(qrisString);

  // Build the new TLV array preserving order, injecting/replacing as needed
  const result: TLV[] = [];
  let amountInserted = false;

  // Tags to skip (we'll re-insert them)
  const managedTags = new Set(["54", "55", "56", "57", "63"]);

  for (const el of elements) {
    if (managedTags.has(el.tag)) continue;

    if (el.tag === "01") {
      // Change static → dynamic
      result.push(makeTLV("01", "12", "Point of Initiation Method"));
      continue;
    }

    // Insert amount + fee before tag 58 (Country Code)
    if (el.tag === "58" && !amountInserted) {
      const amountStr = options.amount.toString();
      result.push(makeTLV("54", amountStr, "Transaction Amount"));

      if (options.fee) {
        if (options.fee.type === "fixed") {
          result.push(makeTLV("55", "02", "Tip or Convenience Indicator"));
          result.push(
            makeTLV(
              "56",
              options.fee.value.toString(),
              "Value of Convenience Fee (Fixed)"
            )
          );
        } else {
          result.push(makeTLV("55", "03", "Tip or Convenience Indicator"));
          result.push(
            makeTLV(
              "57",
              options.fee.value.toString(),
              "Value of Convenience Fee (%)"
            )
          );
        }
      }

      amountInserted = true;
    }

    result.push(el);
  }

  // Build string without CRC, then append CRC
  const withoutCRC = buildTLVString(result);
  const crcInput = withoutCRC + "6304";
  const crc = calculateCRC16(crcInput);

  return crcInput + crc;
}
