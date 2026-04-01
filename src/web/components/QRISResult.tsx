import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { parseQRIS } from "@core/index";

interface Props {
  qrisString: string;
}

export function QRISResult({ qrisString }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const parsed = parseQRIS(qrisString);

  useEffect(() => {
    if (canvasRef.current && qrisString) {
      QRCode.toCanvas(canvasRef.current, qrisString, {
        width: 280,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
    }
  }, [qrisString]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrisString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qris-dynamic-${parsed.merchantName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Dynamic QRIS Result
        </h2>
      </div>

      <div className="p-6 flex flex-col items-center space-y-4">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <canvas ref={canvasRef} />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">{parsed.merchantName}</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Rp {Number(parsed.amount ?? 0).toLocaleString("id-ID")}
          </p>
          {parsed.tipIndicator === "fixed" && parsed.tipFixed && (
            <p className="text-xs text-gray-500">
              + Fee Rp {Number(parsed.tipFixed).toLocaleString("id-ID")}
            </p>
          )}
          {parsed.tipIndicator === "percentage" && parsed.tipPercentage && (
            <p className="text-xs text-gray-500">
              + Fee {parsed.tipPercentage}%
            </p>
          )}
        </div>

        {/* QRIS String */}
        <div className="w-full">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 break-all font-mono text-xs text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
            {qrisString}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy String
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
