import { createInterface } from "readline";
import { parseQRIS, convertQRIS, validateQRIS } from "./core/index";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   QRIS Static → Dynamic Converter v2.0      ║");
  console.log("║   By: Gidhan                              ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const qris = await ask("[?] Input QRIS string: ");

  const validation = validateQRIS(qris);
  if (!validation.valid) {
    console.log("\n[✗] Invalid QRIS:");
    validation.errors.forEach((e) => console.log(`    - ${e}`));
    rl.close();
    process.exit(1);
  }

  const parsed = parseQRIS(qris);

  console.log("\n[✓] QRIS Parsed:");
  console.log(`    Merchant : ${parsed.merchantName}`);
  console.log(`    City     : ${parsed.merchantCity}`);
  console.log(`    Method   : ${parsed.method}`);
  console.log(
    `    Currency : ${parsed.currency === "360" ? "IDR" : parsed.currency}`,
  );

  if (parsed.method === "dynamic") {
    console.log(`    Amount   : ${parsed.amount ?? "-"}`);
    console.log("\n[!] This QRIS is already dynamic.");
    rl.close();
    return;
  }

  const amountStr = await ask("\n[?] Input nominal (Rupiah): ");
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    console.log("[✗] Invalid amount.");
    rl.close();
    process.exit(1);
  }

  const useFee = await ask("[?] Add service fee? (y/n): ");

  let fee: { type: "fixed" | "percentage"; value: number } | undefined;

  if (useFee.toLowerCase() === "y") {
    const feeType = await ask("[?] Fixed or Percentage? (f/p): ");
    if (feeType.toLowerCase() === "f") {
      const feeVal = await ask("[?] Fee amount (Rupiah): ");
      fee = { type: "fixed", value: parseFloat(feeVal) };
    } else if (feeType.toLowerCase() === "p") {
      const feeVal = await ask("[?] Fee percentage: ");
      fee = { type: "percentage", value: parseFloat(feeVal) };
    }
  }

  const result = convertQRIS(qris, { amount, fee });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Result                                     ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n${result}\n`);

  rl.close();
}

main();
