export type Period = "weekly" | "monthly" | "quarterly" | "yearly";

export type Status = "active" | "trial" | "paused" | "canceled";

export type Category =
  | "Entertainment"
  | "Productivity"
  | "Education"
  | "Utilities"
  | "Finance"
  | "Health"
  | "Gaming"
  | "Cloud"
  | "Other";

export interface Subscription {
  id: string;
  name: string;
  category?: Category;
  tags?: string[];
  price: number;
  originalCurrency: string;
  period: Period;
  startDate: string;
  nextChargeDate?: string;
  status: Status;
  notes?: string;
  url?: string;
}
