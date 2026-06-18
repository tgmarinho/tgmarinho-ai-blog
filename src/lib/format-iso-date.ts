/**
 * Most Velite date values are date-only (`YYYY-MM-DD`). `new Date("…")`
 * parses that as UTC midnight; `toLocaleDateString` without `timeZone` then
 * maps that instant to the user's local calendar, often the previous day
 * outside UTC, which breaks SSR/client hydration for visible date text.
 */
export function formatIsoDateForDisplay(
  isoDate: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return new Date(isoDate).toLocaleDateString(locale, options);
  }

  const [, rawYear, rawMonth, rawDay] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(locale, {
    ...options,
    timeZone: "UTC",
  });
}
