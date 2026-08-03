import { useEffect, useState } from "react";

export const IST_TIME_ZONE = "Asia/Kolkata";

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** dd MMM yyyy, hh:mm am/pm in IST */
export function formatIstDateTime(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** dd MMM yyyy in IST */
export function formatIstDate(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** hh:mm am/pm in IST */
export function formatIstTime(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatIstWeekday(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
  }).format(date);
}

/** dd MMM yyyy, weekday + live clock in IST, refreshed every second */
export function useIstNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return {
    date: now,
    dateLabel: new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIME_ZONE,
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(now),
    timeLabel: new Intl.DateTimeFormat("en-IN", {
      timeZone: IST_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now),
  };
}
