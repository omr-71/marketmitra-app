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

/**
 * Open-Meteo returns local (IST) wall-clock strings without an offset, e.g.
 * "2026-08-05T06:11". Anchor those to IST so they don't get read as UTC.
 */
export function istDate(value: string | number | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return new Date(`${value}+05:30`);
  }
  return new Date(value);
}

/** hh:mm am/pm in IST */
export function formatIstTime(value: string | number | Date) {
  const date = istDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatIstWeekday(value: string | number | Date) {
  const date = istDate(value);
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
