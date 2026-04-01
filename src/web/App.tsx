import { useState, useCallback } from "react";
import { parseQRIS, convertQRIS, validateQRIS } from "@core/index";
import type { QRISData, ConvertOptions } from "@core/types";
import { Header } from "./components/Header";
import { QRISInput } from "./components/QRISInput";
import { QRISInfo } from "./components/QRISInfo";
import { ConvertForm } from "./components/ConvertForm";
import { QRISResult } from "./components/QRISResult";
import { Footer } from "./components/Footer";

export default function App() {
  const [qrisString, setQrisString] = useState("");
  const [parsed, setParsed] = useState<QRISData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState("");

  const handleQRISInput = useCallback((value: string) => {
    setQrisString(value);
    setResult("");
    setErrors([]);
    setParsed(null);

    if (!value.trim()) return;

    const validation = validateQRIS(value.trim());
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const data = parseQRIS(value.trim());
      setParsed(data);
    } catch {
      setErrors(["Failed to parse QRIS data"]);
    }
  }, []);

  const handleConvert = useCallback(
    (options: ConvertOptions) => {
      if (!qrisString.trim()) return;

      try {
        const converted = convertQRIS(qrisString.trim(), options);
        setResult(converted);
      } catch {
        setErrors(["Failed to convert QRIS"]);
      }
    },
    [qrisString]
  );

  const handleReset = useCallback(() => {
    setQrisString("");
    setParsed(null);
    setErrors([]);
    setResult("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <QRISInput
          value={qrisString}
          onChange={handleQRISInput}
          onReset={handleReset}
          errors={errors}
        />

        {parsed && (
          <>
            <QRISInfo data={parsed} />
            <ConvertForm
              parsed={parsed}
              onConvert={handleConvert}
            />
          </>
        )}

        {result && <QRISResult qrisString={result} />}
      </main>

      <Footer />
    </div>
  );
}
