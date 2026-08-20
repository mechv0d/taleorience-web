/** Human-friendly relative time, e.g. "just now", "5 minutes ago", "2 weeks ago". */
export function timeAgo(iso: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(iso).getTime());
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 45) return "just now";

  const steps: Array<[number, string]> = [
    [60, "minute"],
    [60, "hour"],
    [24, "day"],
    [7, "week"],
    [4.345, "month"],
    [12, "year"],
  ];

  let value = seconds;
  let unit = "second";
  for (const [divisor, nextUnit] of steps) {
    if (value < divisor) break;
    value = Math.floor(value / divisor);
    unit = nextUnit;
  }

  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

/** Absolute localized date for the tooltip. */
export function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}