export interface PortalSession {
  id: string;
  userId: string;
  userRole: string;
  ipAddr: string;
  userAgent: string;
  active: boolean;
  currentDevice: boolean;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  _actions?: unknown;
}
