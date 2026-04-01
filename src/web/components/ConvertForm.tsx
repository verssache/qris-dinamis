import { useState } from "react";
import type { QRISData, ConvertOptions } from "@core/types";

interface Props {
  parsed: QRISData;
  onConvert: (options: ConvertOptions) => void;
}

type FeeType = "none" | "fixed" | "percentage";

export function ConvertForm({ parsed, onConvert }: Props) {
  const [amount, setAmount] = useState("");
  const [feeType, setFeeType] = useState<FeeType>("none");
  const [feeValue, setFeeValue] = useState("");

  if (parsed.method === "dynamic") {
    return (
      <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 p-4">
        <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This QRIS is already dynamic with amount Rp {Number(parsed.amount ?? 0).toLocaleString("id-ID")}
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const options: ConvertOptions = { amount: amountNum };

    if (feeType !== "none" && feeValue) {
      const feeNum = parseFloat(feeValue);
      if (!isNaN(feeNum) && feeNum > 0) {
        options.fee = { type: feeType, value: feeNum };
      }
    }

    onConvert(options);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          Convert to Dynamic
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Amount (Rupiah)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              Rp
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Service Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Service Fee
          </label>
          <div className="flex gap-2">
            {(["none", "fixed", "percentage"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFeeType(type);
                  setFeeValue("");
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  feeType === type
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300"
                    : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {type === "none" ? "None" : type === "fixed" ? "Fixed (Rp)" : "Percent (%)"}
              </button>
            ))}
          </div>
        </div>

        {feeType !== "none" && (
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                {feeType === "fixed" ? "Rp" : "%"}
              </span>
              <input
                type="number"
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
                placeholder="0"
                min="0"
                step={feeType === "percentage" ? "0.1" : "1"}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          Convert to Dynamic QRIS
        </button>
      </div>
    </form>
  );
}
