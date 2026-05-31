// Midnight (local) of the given day.
export function dayStart(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Monday 00:00 (local) of the week containing the given date.
export function weekStart(d: Date = new Date()): Date {
  const date = dayStart(d);
  const day = date.getDay(); // 0 = Sun … 6 = Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  return date;
}

// UTC-midnight of the *local* calendar day. Stored in `@db.Date` columns so
// the saved date always matches the user's local day regardless of timezone
// (avoids the off-by-one the old Swift app had from formatting in GMT).
export function localDateOnlyUTC(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

// "yyyy-MM-dd" in local time — used for Postgres `date` columns.
export function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
