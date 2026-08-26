export type SubscriptionPlan = 'Basic' | 'Pro' | 'Enterprise';
export type BusinessStatus = 'pending' | 'active' | 'suspended';

export interface Business {
  id: string;
  name: string;
  category: string;
  status: BusinessStatus;
  subscriptionPlan: SubscriptionPlan;
  isPublicListed: boolean;
  metrics: {
    mrr: number;
    giftCardsIssued: number;
    loyaltyClaimed: number;
    totalAppointments: number;
  };
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  location: string;
}

export let mockBusinesses: Business[] = [
  { 
    id: 'b1', name: 'Aura Beauty Lounge', category: 'Hair Salon',
    status: 'active', subscriptionPlan: 'Enterprise', isPublicListed: true,
    metrics: { mrr: 15000, giftCardsIssued: 120, loyaltyClaimed: 450, totalAppointments: 1240 }
  },
  { 
    id: 'b2', name: 'Aura Wellness Spa', category: 'Spa & Massage',
    status: 'active', subscriptionPlan: 'Pro', isPublicListed: true,
    metrics: { mrr: 8000, giftCardsIssued: 45, loyaltyClaimed: 120, totalAppointments: 850 }
  },
  { 
    id: 'b3', name: 'Aura Academy', category: 'Education',
    status: 'suspended', subscriptionPlan: 'Basic', isPublicListed: false,
    metrics: { mrr: 3000, giftCardsIssued: 0, loyaltyClaimed: 0, totalAppointments: 150 }
  },
  {
    id: 'b4', name: 'Smile Dental Clinic', category: 'Dental',
    status: 'pending', subscriptionPlan: 'Pro', isPublicListed: false,
    metrics: { mrr: 0, giftCardsIssued: 0, loyaltyClaimed: 0, totalAppointments: 0 }
  }
];

export let mockBranches: Branch[] = [
  { id: 'br1', businessId: 'b1', name: 'Jhamsikhel', location: 'Lalitpur' },
  { id: 'br2', businessId: 'b1', name: 'Lazimpat', location: 'Kathmandu' },
  { id: 'br3', businessId: 'b1', name: 'Baneshwor', location: 'Kathmandu' },
  { id: 'br4', businessId: 'b2', name: 'Patan', location: 'Lalitpur' },
  { id: 'br5', businessId: 'b2', name: 'Thamel', location: 'Kathmandu' },
  { id: 'br6', businessId: 'b3', name: 'Pokhara', location: 'Kaski' }
];

export const addBusiness = (b: Business) => { mockBusinesses.push(b); };
export const addBranch = (b: Branch) => { mockBranches.push(b); };
