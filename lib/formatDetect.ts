import type { BarcodeFormat } from "@/types";

export type Detection = {
  format: BarcodeFormat;
  // The value to render (check digit added where missing); null while the input can't be used.
  normalized: string | null;
  // The whole number with the correct last digit, offered when the typed check digit is wrong.
  fix: string | null;
  message: string;
};

const NAME: Record<BarcodeFormat, string> = {
  ean13: "EAN-13",
  ean8: "EAN-8",
  upca: "UPC-A",
  code128: "Code 128",
};

// Digits without and with the check digit.
const LENGTHS: Record<Exclude<BarcodeFormat, "code128">, [number, number]> = {
  ean13: [12, 13],
  ean8: [7, 8],
  upca: [11, 12],
};

const CODE128_MAX = 48;
const PRINTABLE_ASCII = /^[\x20-\x7E]+$/;
const DIGITS_AND_SEPARATORS = /^[\d\s-]+$/;

// Weights 3,1 from the right of the body; the same rule serves EAN-13, EAN-8 and UPC-A.
function checkDigit(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += Number(body[body.length - 1 - i]) * (i % 2 === 0 ? 3 : 1);
  }
  return String((10 - (sum % 10)) % 10);
}

const reject = (format: BarcodeFormat, message: string): Detection => ({
  format,
  normalized: null,
  fix: null,
  message,
});

function detectCode128(input: string, preferred?: BarcodeFormat): Detection {
  if (input.length > CODE128_MAX) {
    return reject("code128", `Code 128 holds up to ${CODE128_MAX} characters. You typed ${input.length}.`);
  }
  if (!PRINTABLE_ASCII.test(input)) {
    return reject("code128", "Code 128 can't print accents or emoji. Use plain letters, numbers and symbols.");
  }
  const why = preferred ? "" : " Letters found, so this is a Code 128 barcode.";
  return {
    format: "code128",
    normalized: input,
    fix: null,
    message: `${why} Good for shipping and stock labels, not for shop checkouts.`.trim(),
  };
}

function detectDigits(digits: string, format: Exclude<BarcodeFormat, "code128">, auto: boolean): Detection {
  const [bodyLength] = LENGTHS[format];
  const name = NAME[format];

  if (digits.length === bodyLength) {
    const full = digits + checkDigit(digits);
    const hint = format === "ean13" && auto ? " If this is a UPC-A, switch the type." : "";
    return {
      format,
      normalized: full,
      fix: null,
      message: `${digits.length} digits. We added the check digit: ${full} (${name}).${hint}`,
    };
  }

  const expected = checkDigit(digits.slice(0, -1));
  if (digits.endsWith(expected)) {
    return {
      format,
      normalized: digits,
      fix: null,
      message: `${digits.length} digits · ${name} · the last digit checks out.`,
    };
  }
  return {
    format,
    normalized: null,
    fix: digits.slice(0, -1) + expected,
    message: `The last digit should be ${expected}, not ${digits.slice(-1)}. This usually means a typo.`,
  };
}

function digitCountMessage(count: number): string {
  if (count < 7) return "Keep typing. Most packaging numbers have 8, 12 or 13 digits.";
  if (count === 14) return "14 digits looks like a carton code (GTIN-14). Shop barcodes have 8, 12 or 13 digits.";
  return `${count} digits. Shop barcodes have 8, 12 or 13. Check the number on your GS1 certificate.`;
}

// Never throws: unusable input comes back with normalized null and a plain-words message.
export function detectFormat(input: string, preferred?: BarcodeFormat): Detection {
  const trimmed = input.trim();
  const fallback: BarcodeFormat = preferred ?? "ean13";

  if (!trimmed) {
    return reject(fallback, "Most packaging numbers have 8, 12 or 13 digits.");
  }

  if (preferred === "code128") return detectCode128(trimmed, preferred);

  if (!DIGITS_AND_SEPARATORS.test(trimmed)) {
    if (preferred) return reject(preferred, `${NAME[preferred]} takes digits only.`);
    return detectCode128(trimmed);
  }

  const digits = trimmed.replace(/[\s-]/g, "");
  if (!digits) return reject(fallback, "Most packaging numbers have 8, 12 or 13 digits.");

  if (preferred) {
    const [bodyLength, fullLength] = LENGTHS[preferred];
    if (digits.length !== bodyLength && digits.length !== fullLength) {
      return reject(
        preferred,
        `${NAME[preferred]} needs ${bodyLength} or ${fullLength} digits. You typed ${digits.length}.`
      );
    }
    return detectDigits(digits, preferred, false);
  }

  switch (digits.length) {
    case 7:
    case 8:
      return detectDigits(digits, "ean8", true);
    case 11:
      return detectDigits(digits, "upca", true);
    case 12:
      // A valid UPC-A check digit means a finished UPC-A; otherwise it is an EAN-13 missing its last digit.
      return detectDigits(digits, checkDigit(digits.slice(0, 11)) === digits[11] ? "upca" : "ean13", true);
    case 13:
      return detectDigits(digits, "ean13", true);
    default:
      return reject(fallback, digitCountMessage(digits.length));
  }
}
