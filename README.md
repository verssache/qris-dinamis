<p align="center">
  <h1 align="center">QRIS Dinamis</h1>
  <p align="center">
    Convert static QRIS to dynamic — parse, validate, and generate QR codes for the Indonesian payment system.
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#cli-usage">CLI</a> •
    <a href="#api-reference">API</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#contributing">Contributing</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/github/stars/verssache/qris-dinamis?style=flat-square" alt="Stars" />
    <img src="https://img.shields.io/github/license/verssache/qris-dinamis?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/react-%2361DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  </p>
</p>

---

## What is QRIS?

**QRIS** (Quick Response Code Indonesian Standard) is a unified QR code payment standard developed by Bank Indonesia. It enables interoperable payments across all payment providers (GoPay, OVO, DANA, ShopeePay, bank apps, etc.) through a single QR code.

There are two types of QRIS:

| Type | Description |
|------|-------------|
| **Static** | QR code without a fixed amount — the customer enters the payment amount manually |
| **Dynamic** | QR code with a pre-set amount — the customer simply scans and pays |

This tool converts **Static → Dynamic** by injecting a transaction amount (and optional service fee) into the QRIS payload, then recalculating the CRC16 checksum.

## Features

- **QRIS Parser** — Decode any QRIS string into a structured, human-readable format (merchant name, city, category, issuer, etc.)
- **Static → Dynamic Converter** — Inject amount and optional service fees into a static QRIS
- **QRIS Validator** — Validate QRIS string structure and CRC16 checksum integrity
- **QR Image Upload** — Upload or drag & drop a QR code image to extract the QRIS data
- **Camera Scanner** — Scan QRIS codes directly using your device camera
- **Clipboard Paste** — Paste a screenshot containing a QR code (Ctrl+V / Cmd+V)
- **QR Code Generator** — Generate a downloadable QR code image from the converted result
- **Dark / Light Mode** — Follows system preference, toggleable
- **Responsive Design** — Works on desktop and mobile
- **CLI Tool** — Command-line interface for quick conversions

## Demo

### Web App

> **[Live Demo](https://qris-dinamis-ten.vercel.app)**

### CLI

```
╔══════════════════════════════════════════════╗
║   QRIS Static → Dynamic Converter v2.0       ║
║   By: Gidhan                                 ║
╚══════════════════════════════════════════════╝

[?] Input QRIS string: 00020101021126570011ID.DANA.WWW...
[✓] QRIS Parsed:
    Merchant : Warung Sayur
    City     : Kab. Demak
    Method   : static
    Currency : IDR

[?] Input nominal (Rupiah): 25000
[?] Add service fee? (y/n): n

╔══════════════════════════════════════════════╗
║   Result                                     ║
╚══════════════════════════════════════════════╝

00020101021226570011ID.DANA.WWW...6304XXXX
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18

### Installation

```bash
git clone https://github.com/verssache/qris-dinamis.git
cd qris-dinamis
npm install
```

### Run Web App (Development)

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## CLI Usage

```bash
npm run cli
```

The CLI will prompt you for:
1. QRIS string input
2. Transaction amount (Rupiah)
3. Optional service fee (fixed or percentage)

### Quick One-liner with `tsx`

```bash
npx tsx src/cli.ts
```

## API Reference

The core library can be imported and used programmatically:

### `parseQRIS(qrisString)`

Parse a QRIS string into a structured object.

```typescript
import { parseQRIS } from "./src/core";

const data = parseQRIS("00020101021126570011ID.DANA.WWW...");

console.log(data.merchantName);  // "Warung Sayur"
console.log(data.merchantCity);  // "Kab. Demak"
console.log(data.method);        // "static"
console.log(data.currency);      // "360"
```

**Returns:** `QRISData`

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Payload format indicator |
| `method` | `"static" \| "dynamic"` | Point of initiation method |
| `merchantName` | `string` | Merchant name |
| `merchantCity` | `string` | Merchant city |
| `merchantCategoryCode` | `string` | MCC code |
| `currency` | `string` | Transaction currency code (360 = IDR) |
| `amount` | `string?` | Transaction amount (dynamic only) |
| `merchantAccountInfo` | `MerchantAccountInfo[]` | Payment provider details |
| `raw` | `TLV[]` | Raw parsed TLV elements |

### `convertQRIS(qrisString, options)`

Convert a static QRIS to dynamic.

```typescript
import { convertQRIS } from "./src/core";

// Basic conversion
const result = convertQRIS(qrisString, {
  amount: 50000,
});

// With fixed service fee
const withFee = convertQRIS(qrisString, {
  amount: 50000,
  fee: { type: "fixed", value: 1000 },
});

// With percentage fee
const withPercent = convertQRIS(qrisString, {
  amount: 50000,
  fee: { type: "percentage", value: 2.5 },
});
```

### `validateQRIS(qrisString)`

Validate a QRIS string for structural correctness.

```typescript
import { validateQRIS } from "./src/core";

const result = validateQRIS(qrisString);

if (!result.valid) {
  console.log(result.errors);
  // ["CRC mismatch: expected A1B2, got C3D4"]
}
```

### `parseTLV(data)`

Low-level TLV parser for EMVCo QR code payloads.

```typescript
import { parseTLV } from "./src/core";

const elements = parseTLV(qrisString);
// [{ tag: "00", name: "Payload Format Indicator", length: 2, value: "01" }, ...]
```

## How It Works

QRIS follows the [EMVCo QR Code Specification](https://www.emvco.com/emv-technologies/qrcodes/) using a **TLV (Tag-Length-Value)** encoding:

```
[Tag: 2 digits][Length: 2 digits][Value: variable]
```

### Conversion Process

```
Static QRIS
    │
    ▼
┌─────────────────────────────┐
│ 1. Parse TLV structure      │
│ 2. Change tag 01: 11 → 12   │  (static → dynamic)
│ 3. Insert tag 54: amount     │  (transaction amount)
│ 4. Insert tag 55/56/57: fee  │  (optional service fee)
│ 5. Recalculate CRC16 (6304)  │
└─────────────────────────────┘
    │
    ▼
Dynamic QRIS
```

### Key QRIS Tags

| Tag | Name | Example |
|-----|------|---------|
| `00` | Payload Format Indicator | `01` |
| `01` | Point of Initiation | `11` (static) / `12` (dynamic) |
| `26-51` | Merchant Account Info | Contains provider ID, merchant ID |
| `52` | Merchant Category Code | `5812` (Restaurant) |
| `53` | Currency | `360` (IDR) |
| `54` | Transaction Amount | `50000` |
| `55` | Tip Indicator | `02` (fixed) / `03` (percentage) |
| `56` | Fixed Fee | `1000` |
| `57` | Percentage Fee | `2.5` |
| `58` | Country Code | `ID` |
| `59` | Merchant Name | `Warung Sayur Bu Sugeng` |
| `60` | Merchant City | `Kab. Demak` |
| `63` | CRC16 Checksum | `58C7` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Web Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| QR Decode | jsQR |
| QR Generate | qrcode |
| CLI Runtime | tsx |

## Project Structure

```
qris-dinamis/
├── src/
│   ├── core/                # Core library (framework-agnostic)
│   │   ├── types.ts         # Type definitions
│   │   ├── parser.ts        # QRIS TLV parser
│   │   ├── converter.ts     # Static → Dynamic converter
│   │   ├── validator.ts     # QRIS validation
│   │   ├── crc16.ts         # CRC16-CCITT checksum
│   │   └── index.ts         # Public API exports
│   ├── cli.ts               # CLI entry point
│   └── web/                 # React web application
│       ├── App.tsx           # Main app component
│       ├── main.tsx          # Entry point
│       ├── index.css         # Tailwind styles
│       ├── hooks/            # Custom React hooks
│       └── components/       # UI components
│           ├── Header.tsx    # App header + theme toggle
│           ├── QRISInput.tsx  # Text/image/camera input
│           ├── QRISInfo.tsx   # Parsed QRIS information
│           ├── ConvertForm.tsx # Amount & fee form
│           ├── QRISResult.tsx  # Result QR + actions
│           └── Footer.tsx     # App footer
├── index.html               # Web app entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── qris.php                 # Original PHP version (legacy)
└── LICENSE
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Ideas for Contribution

- [ ] Add more MCC (Merchant Category Code) mappings
- [ ] Support QRIS merchant-presented mode (MPM) parsing
- [ ] Add internationalization (i18n) support
- [ ] Batch conversion support
- [ ] QRIS string comparison/diff tool
- [ ] PWA support for offline usage

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/verssache">Gidhan</a>
</p>
