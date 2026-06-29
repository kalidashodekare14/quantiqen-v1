import {
  LayoutDashboard,
  BarChart3,
  GitBranch,
  Boxes,
  ServerCog,
  Activity,
  Sparkles,
  FileText,
  Building2,
  Bell,
  Settings,
  User,
} from "lucide-react";

import { routes } from "./routes";

export const navigationItems = [
  {
    title: "Dashboard",
    href: routes.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Monitoring",
    href: routes.monitoring,
    icon: Activity,
  },
  {
    title: "Decision Center",
    href: routes.decisionCenter,
    icon: GitBranch,
  },
  {
    title: "Analytics",
    href: routes.analytics,
    icon: BarChart3,
  },
  {
    title: "Assets",
    href: routes.assets,
    icon: Boxes,
  },
  {
    title: "API Management",
    href: routes.apiManagement,
    icon: ServerCog,
  },
  {
    title: "AI Recommendations",
    href: routes.aiRecommendations,
    icon: Sparkles,
  },
  {
    title: "Reports",
    href: routes.reports,
    icon: FileText,
  },
  {
    title: "Organization",
    href: routes.organization,
    icon: Building2,
  },
  {
    title: "Notifications",
    href: routes.notifications,
    icon: Bell,
  },
  {
    title: "Settings",
    href: routes.settings,
    icon: Settings,
  },
  {
    title: "Profile",
    href: routes.profile,
    icon: User,
  },
] as const;
