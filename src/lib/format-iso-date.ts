/**
 * Most visible post dates are calendar days, even when the frontmatter carries
 * a timestamp for scheduled publishing. Format the YYYY-MM-DD part in UTC so
 * SSR/client output stays stable across time zones.
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
