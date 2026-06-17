// Indian mobile numbers are uniquely identified by their last 10 digits —
// stripping to that suffix makes "9876543210" and "+91 98765 43210" match
// regardless of whether a caller includes the country code.
export function normalizePhone(input: string) {
  return input.replace(/\D/g, "").slice(-10)
}
