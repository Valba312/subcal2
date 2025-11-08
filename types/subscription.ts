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

/**
 * Subscription shape passed to the AI optimization agent.
 */
export interface Subscription {
  id: string;
  name: string;
  perMonth: number;
  period: Period;
  status: Status;
  category?: string;
  notes?: string;
}

export interface Conflict {
  group: string;
  items: string[];
  reason: string;
}

export interface Advice {
  title: string;
  detail: string;
  savingPerMonth?: number;
}

export type AgentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Legacy detailed subscription shape used by the rest of the app (forms, analytics, etc.).
 */
export interface DetailedSubscription {
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
