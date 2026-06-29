export interface Subscription {
  plan: string;
  status: string;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
}

export interface OrganizationData {
  id: string;
  name: string;
  industry: string;
  plan: string;
  users: number;
  assets: number;
  domains: number;
  apiKeys: number;
  subscription: Subscription;
  logo?: string;
  email: string;
  website: string;
  country: string;
  createdAt: string;
}
