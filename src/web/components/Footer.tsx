export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="max-w-2xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          Made by{" "}
          <a
            href="https://github.com/verssache"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Gidhan
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          QRIS is a standardized QR Code payment system by Bank Indonesia
        </p>
      </div>
    </footer>
  );
}
