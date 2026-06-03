export type ShowtimeDateTimeInput =
  | {
      date?: string | Date | null;
      startTime?: string | Date | null;
    }
  | string
  | Date
  | null
  | undefined;

export type AvailableBookingDate = {
  key: string;
  showtimeIds: string[];
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

const getLocalDateKey = (value: Date) =>
  `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}-${padDatePart(value.getDate())}`;

const parseDateOnly = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    !isValidDate(parsed) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const parseDirectDateTime = (value: string | Date | null | undefined) => {
  if (value instanceof Date) {
    return isValidDate(value) ? new Date(value.getTime()) : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const rawValue = value.trim();

  if (!rawValue) {
    return null;
  }

  const dateOnly = parseDateOnly(rawValue);

  if (dateOnly) {
    return dateOnly;
  }

  const parsed = new Date(rawValue);

  return isValidDate(parsed) ? parsed : null;
};

const getDateParts = (value: string | Date | null | undefined) => {
  const parsed = parseDirectDateTime(value);

  if (!parsed) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
  };
};

const getTimeParts = (value: string | Date | null | undefined) => {
  if (value instanceof Date) {
    return isValidDate(value)
      ? { hours: value.getHours(), minutes: value.getMinutes(), seconds: value.getSeconds() }
      : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const match = value.trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }

  return { hours, minutes, seconds };
};

export const parseShowtimeDateTime = (showtime: ShowtimeDateTimeInput): Date | null => {
  if (!showtime || showtime instanceof Date || typeof showtime === 'string') {
    return parseDirectDateTime(showtime);
  }

  const directStartTime = parseDirectDateTime(showtime.startTime);

  if (directStartTime) {
    return directStartTime;
  }

  const dateParts = getDateParts(showtime.date);
  const timeParts = getTimeParts(showtime.startTime);

  if (!dateParts || !timeParts) {
    return null;
  }

  // Separate date/time fields describe the cinema's local wall-clock time.
  const combined = new Date(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds,
  );

  return isValidDate(combined) ? combined : null;
};

export const isFutureShowtime = (
  showtime: ShowtimeDateTimeInput,
  now: Date = new Date(),
) => {
  const showtimeDateTime = parseShowtimeDateTime(showtime);

  return Boolean(showtimeDateTime && isValidDate(now) && showtimeDateTime.getTime() >= now.getTime());
};

export const filterAvailableShowtimes = <
  T extends { date?: string | Date | null; startTime?: string | Date | null },
>(
  showtimes: T[],
  now: Date = new Date(),
) => showtimes.filter((showtime) => isFutureShowtime(showtime, now));

export const filterAvailableBookingDates = <
  T extends {
    id: string;
    date?: string | Date | null;
    startTime?: string | Date | null;
  },
>(
  showtimes: T[],
  now: Date = new Date(),
) => {
  const groups: AvailableBookingDate[] = [];

  filterAvailableShowtimes(showtimes, now).forEach((showtime) => {
    const showtimeDateTime = parseShowtimeDateTime(showtime);

    if (!showtimeDateTime) {
      return;
    }

    const key = getLocalDateKey(showtimeDateTime);
    const existingGroup = groups.find((group) => group.key === key);

    if (existingGroup) {
      existingGroup.showtimeIds.push(showtime.id);
      return;
    }

    groups.push({
      key,
      showtimeIds: [showtime.id],
    });
  });

  return groups;
};
