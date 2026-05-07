/**
 * Velite `s.isodate()` values are date-only (`YYYY-MM-DD`). `new Date("…")`
 * parses that as UTC midnight; `toLocaleDateString` without `timeZone` then
 * maps that instant to the user's local calendar — often the previous day
 * outside UTC, which breaks SSR/client hydration for visible date text.
 */
export function formatIsoDateForDisplay(
  isoDate: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const segments = isoDate.split("-").map((s) => parseInt(s, 10));
  if (
    segments.length !== 3 ||
    segments.some((n) => Number.isNaN(n)) ||
    segments[0] < 1000
  ) {
    return new Date(isoDate).toLocaleDateString(locale, options);
  }

  const [year, month, day] = segments;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(locale, {
    ...options,
    timeZone: "UTC",
  });
}
