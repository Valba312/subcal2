export type FrequencyValue = "monthly" | "quarterly" | "semiannual" | "yearly" | "custom";

export type FrequencyOption = {
  value: FrequencyValue;
  label: string;
  months: number;
};

export type Subscription = {
  id: number;
  name: string;
  cost: number;
  currency: string;
  months: number;
  frequencyLabel: string;
  nextPaymentDate: string;
};

export const FREQUENCIES: FrequencyOption[] = [
  { value: "monthly", label: "Ежемесячно", months: 1 },
  { value: "quarterly", label: "Ежеквартально", months: 3 },
  { value: "semiannual", label: "Раз в полгода", months: 6 },
  { value: "yearly", label: "Ежегодно", months: 12 },
  { value: "custom", label: "Своя периодичность", months: 1 },
];

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (date: Date, days: number) => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

export const capitalizeFirstLetter = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

export const formatMoney = (value: number) => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
};

export const formatDifference = (value: number, currency: string) => {
  if (Math.abs(value) < 0.01) {
    return "без изменений";
  }
  const formatted = formatMoney(Math.abs(value));
  return `${value > 0 ? "+" : "-"}${formatted} ${currency}`;
};

export const formatDaysLeft = (days: number) => {
  if (days <= 0) {
    return "сегодня";
  }

  const mod10 = days % 10;
  const mod100 = days % 100;
  let suffix = "дней";

  if (mod10 === 1 && mod100 !== 11) {
    suffix = "день";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    suffix = "дня";
  }

  return `через ${days} ${suffix}`;
};

export const dayMonthFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

export const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    name: "Netflix Premium",
    cost: 599,
    currency: "₽",
    months: 1,
    frequencyLabel: "Ежемесячно",
    nextPaymentDate: getDateInputValue(addDays(new Date(), 8)),
  },
  {
    id: 2,
    name: "Spotify Family",
    cost: 269,
    currency: "₽",
    months: 1,
    frequencyLabel: "Ежемесячно",
    nextPaymentDate: getDateInputValue(addDays(new Date(), 15)),
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    cost: 3299,
    currency: "₽",
    months: 12,
    frequencyLabel: "Ежегодно",
    nextPaymentDate: getDateInputValue(addDays(new Date(), 45)),
  },
];

export function getNextPaymentDate(subscription: Subscription, reference: Date) {
  const baseDate = new Date(subscription.nextPaymentDate);
  if (!isValidDate(baseDate)) {
    return null;
  }

  let nextDate = baseDate;
  let iterations = 0;

  while (nextDate < reference && iterations < 120) {
    nextDate = addMonths(nextDate, subscription.months);
    iterations += 1;
  }

  if (iterations >= 120) {
    return null;
  }

  return nextDate;
}
