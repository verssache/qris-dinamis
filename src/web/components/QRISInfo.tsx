import type { QRISData } from "@core/types";

interface Props {
  data: QRISData;
}

const CURRENCY_MAP: Record<string, string> = {
  "360": "IDR (Rupiah)",
  "840": "USD (Dollar)",
};

const MCC_MAP: Record<string, string> = {
  "4111": "Transportation",
  "4121": "Taxi",
  "4814": "Telecommunication",
  "5311": "Department Store",
  "5411": "Grocery Store",
  "5499": "Food Store",
  "5812": "Restaurant / Eating Places",
  "5814": "Fast Food",
  "5912": "Pharmacy",
  "5999": "Retail Store",
  "7299": "Other Services",
  "8011": "Medical",
  "8999": "Professional Services",
};

export function QRISInfo({ data }: Props) {
  const merchantInfo = data.merchantAccountInfo[0];
  const issuer = merchantInfo?.globallyUniqueId ?? "-";

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          QRIS Information
        </h2>
      </div>
      <div className="divide-y">
        <InfoRow label="Merchant" value={data.merchantName} />
        <InfoRow label="City" value={data.merchantCity} />
        <InfoRow label="Postal Code" value={data.postalCode} />
        <InfoRow label="Issuer" value={issuer} />
        <InfoRow
          label="Method"
          value={
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                data.method === "static"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              }`}
            >
              {data.method === "static" ? "Static" : "Dynamic"}
            </span>
          }
        />
        <InfoRow
          label="Category"
          value={MCC_MAP[data.merchantCategoryCode] ?? data.merchantCategoryCode}
        />
        <InfoRow
          label="Currency"
          value={CURRENCY_MAP[data.currency] ?? data.currency}
        />
        {data.amount && <InfoRow label="Amount" value={`Rp ${Number(data.amount).toLocaleString("id-ID")}`} />}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right truncate">{value}</span>
    </div>
  );
}
