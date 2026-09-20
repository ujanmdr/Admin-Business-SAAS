export type SubscriptionPlan = 'Basic' | 'Pro' | 'Enterprise';
export type BusinessStatus = 'pending' | 'active' | 'suspended';

export interface Business {
  id: string;
  name: string;
  category: string;
  status: BusinessStatus;
  subscriptionPlan: SubscriptionPlan;
  isPublicListed: boolean;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  division?: string;
  logoUrl?: string;
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
    phone: '+977 01 5520 118', email: 'hello@aurabeauty.np',
    address: 'Jhamsikhel, Lalitpur, Nepal', taxNumber: '601928374', division: '03',
    metrics: { mrr: 15000, giftCardsIssued: 120, loyaltyClaimed: 450, totalAppointments: 1240 }
  },
  { 
    id: 'b2', name: 'Aura Wellness Spa', category: 'Spa & Massage',
    status: 'active', subscriptionPlan: 'Pro', isPublicListed: true,
    phone: '+977 01 5544 332', email: 'spa@aurabeauty.np',
    address: 'Patan Heritage Walk, Lalitpur', taxNumber: '602394851', division: '04',
    metrics: { mrr: 8000, giftCardsIssued: 45, loyaltyClaimed: 120, totalAppointments: 850 }
  },
  { 
    id: 'b3', name: 'Aura Academy', category: 'Education',
    status: 'suspended', subscriptionPlan: 'Basic', isPublicListed: false,
    phone: '+977 01 4412 890', email: 'academy@aurabeauty.np',
    address: 'Pokhara-0km, Kaski, Nepal', taxNumber: '603849102', division: 'ER',
    metrics: { mrr: 3000, giftCardsIssued: 0, loyaltyClaimed: 0, totalAppointments: 150 }
  },
  {
    id: 'b4', name: 'Smile Dental Clinic', category: 'Dental',
    status: 'pending', subscriptionPlan: 'Pro', isPublicListed: false,
    phone: '+977 01 4499 123', email: 'care@smiledental.np',
    address: 'Baneshwor Heights, Kathmandu', taxNumber: '604719283', division: '02',
    metrics: { mrr: 0, giftCardsIssued: 0, loyaltyClaimed: 0, totalAppointments: 0 }
  },
  {
    id: 'b5', name: 'Barricade Cafe & Restro', category: 'Restaurant & Cafe',
    status: 'active', subscriptionPlan: 'Pro', isPublicListed: true,
    phone: '+977 9844736540', email: 'barricade@gmail.com',
    address: 'Pokhara-0km, Nepal', taxNumber: '88888', division: 'ER',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=80',
    metrics: { mrr: 12000, giftCardsIssued: 30, loyaltyClaimed: 210, totalAppointments: 940 }
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
