"use client";

import { trackEvent } from "@/lib/analytics";

type TrackedExternalLinkProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    event: string;
    eventParams?: Record<string, string | number | boolean>;
  };

/**
 * External anchor that fires a GA4 event on click. Used for outbound links
 * (socials, newsletter) inside Server Components, which can't own onClick.
 */
export function TrackedExternalLink({
  event,
  eventParams,
  onClick,
  ...props
}: TrackedExternalLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
