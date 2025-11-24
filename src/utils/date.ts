const timezoneRegex = /[+-]\d{2}:?\d{2}$|Z$/i;

export function parseApiDate(dateString?: string | null): Date {
  if (!dateString) {
    return new Date();
  }

  const normalized = dateString.replace(" ", "T");
  const hasTimezone = timezoneRegex.test(normalized);

  if (hasTimezone) {
    return new Date(normalized);
  }

  const [datePart, timePart = "00:00:00"] = normalized.split("T");
  const [year, month, day] = datePart.split(/[-/]/).map(Number);
  const [hour = "0", minute = "0", second = "0"] = timePart.split(":");

  const asUtc = new Date(
    Date.UTC(year, month - 1, Number(day), Number(hour), Number(minute), Number(second))
  );

  const now = new Date();
  if (asUtc.getTime() - now.getTime() > 5 * 60 * 1000) {
    return new Date(year, month - 1, Number(day), Number(hour), Number(minute), Number(second));
  }

  return asUtc;
}

export function formatRelativeTime(dateString?: string | null): string {
  const date = parseApiDate(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

