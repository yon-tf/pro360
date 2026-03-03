export type RedactionType =
  | "phone"
  | "email"
  | "national_id"
  | "passport"
  | "bank_account"
  | "credit_card"
  | "link";

export type RedactionMatch = {
  type: RedactionType;
  value: string;
  start: number;
  end: number;
};

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_REGEX = /\b(?:https?:\/\/|www\.)[^\s]+\b/gi;
const PHONE_REGEX = /\+?\d[\d\s-]{6,}\d/g;
const CREDIT_CARD_REGEX = /\b(?:\d[ -]?){13,19}\b/g;
const BANK_ACCOUNT_REGEX = /\b(?:\d[ -]?){9,18}\b/g;
const MY_NATIONAL_ID_REGEX = /\b\d{6}-?\d{2}-?\d{4}\b/g;
const SG_NRIC_REGEX = /\b[STFGM]\d{7}[A-Z]\b/gi;
const PASSPORT_REGEX = /\b[A-Z]{1,2}\d{6,8}\b/gi;

type Pattern = {
  type: RedactionType;
  regex: RegExp;
  validate?: (value: string) => boolean;
};

const DETECTION_PATTERNS: Pattern[] = [
  { type: "credit_card", regex: CREDIT_CARD_REGEX, validate: isLikelyCreditCard },
  { type: "national_id", regex: SG_NRIC_REGEX },
  { type: "national_id", regex: MY_NATIONAL_ID_REGEX },
  { type: "passport", regex: PASSPORT_REGEX },
  { type: "bank_account", regex: BANK_ACCOUNT_REGEX, validate: isLikelyBankAccount },
  { type: "phone", regex: PHONE_REGEX, validate: isLikelyPhone },
  { type: "email", regex: EMAIL_REGEX },
  { type: "link", regex: URL_REGEX },
];

function isLikelyCreditCard(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  return passesLuhn(digits);
}

function isLikelyBankAccount(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  // Keep this broad for a conservative hard block.
  if (digits.length < 9 || digits.length > 18) return false;
  if (passesLuhn(digits)) return false;
  return true;
}

function isLikelyPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) return false;
  // Reduce false positives from plain long numeric identifiers.
  if (!value.includes("+") && !/[\s-]/.test(value)) return false;
  return true;
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function collectMatches(text: string): RedactionMatch[] {
  const matches: RedactionMatch[] = [];
  for (const pattern of DETECTION_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let candidate = regex.exec(text);
    while (candidate) {
      const value = candidate[0];
      if (!pattern.validate || pattern.validate(value)) {
        matches.push({
          type: pattern.type,
          value,
          start: candidate.index,
          end: candidate.index + value.length,
        });
      }
      candidate = regex.exec(text);
    }
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const nonOverlapping: RedactionMatch[] = [];
  for (const match of matches) {
    const overlaps = nonOverlapping.some((picked) => match.start < picked.end && picked.start < match.end);
    if (!overlaps) nonOverlapping.push(match);
  }
  return nonOverlapping;
}

function maskEmail(value: string): string {
  const [localPart, domain = ""] = value.split("@");
  const first = localPart.charAt(0) || "*";
  return `${first}***@${domain}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return "****";

  const tail = digits.slice(-2);
  const prefixSource = value.slice(0, Math.min(value.length, 6)).replace(/\s+$/, "");
  const prefix = prefixSource.length > 0 ? prefixSource : digits.slice(0, 2);
  return `${prefix}****${tail}`;
}

function replacementFor(match: RedactionMatch): string {
  if (match.type === "email") return maskEmail(match.value);
  if (match.type === "phone") return maskPhone(match.value);
  if (match.type === "link") return match.value;
  return "••••••";
}

export function detectPII(text: string): RedactionMatch[] {
  return collectMatches(text);
}

export function redactPII(text: string): { redactedText: string; matches: RedactionMatch[] } {
  const matches = collectMatches(text);
  if (matches.length === 0) return { redactedText: text, matches };

  let cursor = 0;
  const parts: string[] = [];
  for (const match of matches) {
    parts.push(text.slice(cursor, match.start));
    parts.push(replacementFor(match));
    cursor = match.end;
  }
  parts.push(text.slice(cursor));

  return { redactedText: parts.join(""), matches };
}
