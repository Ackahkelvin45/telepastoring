import {
  BarChart3,
  House,
  MessageCircle,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/my-calls", label: "My Calls", icon: Users },
  { href: "/call-history", label: "Call History", icon: Phone },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];
