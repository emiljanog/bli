export type SettingsTabSlug =
  | "general"
  | "payments"
  | "shipping"
  | "emails"
  | "menu"
  | "security";

export type SettingsTabItem = {
  slug: SettingsTabSlug;
  label: string;
  title: string;
  description: string;
  group: "Store" | "Website" | "System";
};

export const SETTINGS_TABS: SettingsTabItem[] = [
  {
    slug: "general",
    label: "General",
    title: "General & Branding",
    description: "Website title, brand identity, logo, and favicon settings.",
    group: "Store",
  },
  {
    slug: "payments",
    label: "Payments",
    title: "Payment Methods",
    description: "Enable/disable payment methods and configure checkout payment behavior.",
    group: "Store",
  },
  {
    slug: "shipping",
    label: "Shipping",
    title: "Shipping Rules",
    description: "Shipping zones, delivery estimates, and free shipping thresholds.",
    group: "Store",
  },
  {
    slug: "emails",
    label: "Emails & Notifications",
    title: "Emails & Notifications",
    description: "Configure SMTP/PHPMailer/React Email and alert toggles for store events.",
    group: "System",
  },
  {
    slug: "menu",
    label: "Menu",
    title: "Website Menu",
    description: "Manage header/footer menu links and quick navigation labels.",
    group: "Website",
  },
  {
    slug: "security",
    label: "Security",
    title: "Security & Access",
    description: "Session policies, password policies, and role-based access preferences.",
    group: "System",
  },
];

export const SETTINGS_GROUPS: Array<{
  id: SettingsTabItem["group"];
  label: string;
}> = [
  { id: "Store", label: "Store Settings" },
  { id: "Website", label: "Website Settings" },
  { id: "System", label: "System Settings" },
];

export function getSettingsTab(slug: string): SettingsTabItem | null {
  const normalized = slug.trim().toLowerCase();
  return SETTINGS_TABS.find((item) => item.slug === normalized) ?? null;
}
