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
  Users,
  Shield,
  ScrollText,
  BookOpen,
  ListChecks,
  ClipboardCheck,
  ScanLine,
  UsersRound,
  HeartPulse,
  Bell,
  Settings,
  User,
} from "lucide-react";

import { routes } from "./routes";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  children?: { title: string; href: string; icon: typeof Users }[];
  allowedRoles?: readonly string[];
}

export const navigationItems: NavItem[] = [
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
    allowedRoles: ["CUSTOMER_ADMIN"],
  },
  {
    title: "Scans",
    href: routes.scans,
    icon: ScanLine,
  },
  {
    title: "Platform Ops",
    href: routes.platformOps,
    icon: HeartPulse,
    allowedRoles: ["CUSTOMER_ADMIN"],
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
    children: [
      { title: "Users", href: routes.organizationUsers, icon: Users },
      { title: "Teams", href: routes.organizationTeams, icon: UsersRound },
      { title: "Sessions", href: routes.organizationSessions, icon: Shield },
      { title: "Policy", href: routes.organizationPolicy, icon: ScrollText },
      { title: "Guardrails", href: routes.organizationGuardrails, icon: ListChecks },
      { title: "Compliance", href: routes.organizationCompliance, icon: ClipboardCheck },
      { title: "Audit Log", href: routes.organizationAuditLog, icon: BookOpen },
    ],
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
];
