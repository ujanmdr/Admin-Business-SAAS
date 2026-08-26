export type StaffRole =
  | "Senior Stylist"
  | "Nail Artist"
  | "Makeup Artist"
  | "Bridal Specialist"
  | "Skin Therapist"
  | "Massage Therapist"
  | "Dental Consultant"
  | "Trainer"
  | "Receptionist";

export type StaffStatus = "Available" | "Busy" | "On Break" | "On Leave" | "Off Duty";

export type Staff = { businessId: string; branchId: string;
  id: string;
  name: string;
  role: StaffRole;
  branch: string;
  specialisations: string[];
  experienceYears: number;
  rating: number;
  todayAppointments: number;
  monthlyRevenue: number; // NPR
  utilization: number; // %
  nextSlot: string;
  status: StaffStatus;
  bio: string;
  email: string;
  phone: string;
  joinedYear: number;
  baseSalary: number;
  commissionRate: number;
  advancesTaken: number;
  permissions: string[];
};

export const STAFF: Staff[] = [
  {
    id: "s1", businessId: "b1", branchId: "br1", name: "Anisha Shrestha", role: "Senior Stylist", branch: "Jhamsikhel",
    specialisations: ["Hair Color", "Keratin", "Bridal Hair"], experienceYears: 9,
    rating: 4.9, todayAppointments: 7, monthlyRevenue: 248000, utilization: 92,
    nextSlot: "11:30 AM", status: "Busy",
    bio: "Lead stylist with global training in Bangkok and Mumbai. Loves modern balayage.",
    email: "anisha@aurabeauty.np", phone: "+977 98 4123 5612", joinedYear: 2019,
    baseSalary: 25000, advancesTaken: 5000, commissionRate: 15, permissions: ["Bookings", "POS", "Customers"],
  },
  {
    id: "s2", businessId: "b1", branchId: "br1", name: "Pooja Maharjan", role: "Bridal Specialist", branch: "Jhamsikhel",
    specialisations: ["Bridal Makeup", "HD Makeup", "Mehendi"], experienceYears: 11,
    rating: 5.0, todayAppointments: 3, monthlyRevenue: 412000, utilization: 88,
    nextSlot: "1:00 PM", status: "Available",
    bio: "Top-rated bridal artist for Newari and Indian weddings across the valley.",
    email: "pooja@aurabeauty.np", phone: "+977 98 0123 9921", joinedYear: 2017,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings", "Customers", "Packages"],
  },
  {
    id: "s3", businessId: "b1", branchId: "br1", name: "Ritu Gurung", role: "Nail Artist", branch: "Lazimpat",
    specialisations: ["Gel Extensions", "Nail Art", "Pedicure"], experienceYears: 5,
    rating: 4.8, todayAppointments: 6, monthlyRevenue: 136000, utilization: 81,
    nextSlot: "12:15 PM", status: "Busy",
    bio: "Detail-loving nail artist specialising in chrome and 3D art.",
    email: "ritu@aurabeauty.np", phone: "+977 98 5512 8810", joinedYear: 2021,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings"],
  },
  {
    id: "s4", businessId: "b1", branchId: "br1", name: "Sneha Tamang", role: "Skin Therapist", branch: "Baneshwor",
    specialisations: ["HydraFacial", "Chemical Peel", "Acne"], experienceYears: 7,
    rating: 4.9, todayAppointments: 5, monthlyRevenue: 198000, utilization: 86,
    nextSlot: "2:30 PM", status: "Available",
    bio: "Certified medical aesthetician trained at Seoul Beauty Institute.",
    email: "sneha@aurabeauty.np", phone: "+977 98 1144 7720", joinedYear: 2020,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings", "Customers"],
  },
  {
    id: "s5", businessId: "b1", branchId: "br1", name: "Bishal Lama", role: "Massage Therapist", branch: "Patan",
    specialisations: ["Deep Tissue", "Ayurvedic", "Hot Stone"], experienceYears: 8,
    rating: 4.7, todayAppointments: 4, monthlyRevenue: 162000, utilization: 78,
    nextSlot: "3:00 PM", status: "On Break",
    bio: "Ayurveda-trained therapist with a calm, grounded touch.",
    email: "bishal@aurabeauty.np", phone: "+977 98 2244 5530", joinedYear: 2018,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings"],
  },
  {
    id: "s6", businessId: "b1", branchId: "br1", name: "Karuna K.C.", role: "Makeup Artist", branch: "Thamel",
    specialisations: ["Editorial", "Party", "Airbrush"], experienceYears: 4,
    rating: 4.8, todayAppointments: 3, monthlyRevenue: 124000, utilization: 72,
    nextSlot: "4:15 PM", status: "Available",
    bio: "Editorial makeup artist with fashion week credits.",
    email: "karuna@aurabeauty.np", phone: "+977 98 7733 1102", joinedYear: 2022,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings"],
  },
  {
    id: "s7", businessId: "b1", branchId: "br1", name: "Dr. Sushma Rai", role: "Dental Consultant", branch: "Pokhara",
    specialisations: ["Whitening", "Aligners", "Veneers"], experienceYears: 12,
    rating: 4.9, todayAppointments: 5, monthlyRevenue: 386000, utilization: 90,
    nextSlot: "11:00 AM", status: "Busy",
    bio: "BDS, MDS — cosmetic dentistry specialist focused on smile design.",
    email: "sushma@aurabeauty.np", phone: "+977 98 0099 7745", joinedYear: 2016,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings", "Customers", "Reports"],
  },
  {
    id: "s8", businessId: "b1", branchId: "br1", name: "Manisha Adhikari", role: "Trainer", branch: "Jhamsikhel",
    specialisations: ["Academy", "Hair Diploma", "Skin Course"], experienceYears: 14,
    rating: 5.0, todayAppointments: 2, monthlyRevenue: 220000, utilization: 65,
    nextSlot: "Tomorrow 10:00",
    status: "On Leave",
    bio: "Heads the BRG Academy program. Trained 600+ students across Nepal.",
    email: "manisha@aurabeauty.np", phone: "+977 98 1100 4421", joinedYear: 2014,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Academy", "Bookings", "Reports"],
  },
  {
    id: "s9", businessId: "b1", branchId: "br1", name: "Rojan Basnet", role: "Receptionist", branch: "Jhamsikhel",
    specialisations: ["Front Desk", "POS", "Scheduling"], experienceYears: 3,
    rating: 4.6, todayAppointments: 0, monthlyRevenue: 0, utilization: 95,
    nextSlot: "On Desk", status: "Available",
    bio: "Warm, multilingual front-desk anchor for the flagship branch.",
    email: "rojan@aurabeauty.np", phone: "+977 98 5566 1133", joinedYear: 2023,
    baseSalary: 25000, advancesTaken: 0, commissionRate: 15, permissions: ["Bookings", "POS", "Customers", "Payments"],
  },
];

export function staffStatusTone(s: StaffStatus) {
  switch (s) {
    case "Available": return "bg-[color-mix(in_oklab,var(--sage)_30%,white)] text-deep-olive border-[color-mix(in_oklab,var(--sage)_45%,white)]";
    case "Busy": return "bg-[color-mix(in_oklab,var(--gold)_25%,white)] text-gold border-[color-mix(in_oklab,var(--gold)_40%,white)]";
    case "On Break": return "bg-mist-soft text-foreground/70 border-mist";
    case "On Leave": return "bg-rose-soft text-foreground/80 border-rose";
    case "Off Duty": return "bg-muted text-muted-foreground border-border";
  }
}

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type DaySchedule = {
  day: typeof WEEK_DAYS[number];
  working: boolean;
  start: string;
  end: string;
  break: string;
  room: string;
};

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: "Sun", working: true, start: "10:00", end: "19:00", break: "13:00–13:45", room: "Station 2" },
  { day: "Mon", working: true, start: "10:00", end: "19:00", break: "13:00–13:45", room: "Station 2" },
  { day: "Tue", working: true, start: "10:00", end: "19:00", break: "13:30–14:15", room: "Station 2" },
  { day: "Wed", working: false, start: "—", end: "—", break: "—", room: "—" },
  { day: "Thu", working: true, start: "11:00", end: "20:00", break: "14:00–14:45", room: "Station 4" },
  { day: "Fri", working: true, start: "11:00", end: "20:00", break: "14:00–14:45", room: "Station 4" },
  { day: "Sat", working: true, start: "09:00", end: "18:00", break: "13:00–13:30", room: "Station 4" },
];

export const PERFORMANCE_6M = [
  { month: "Dec", revenue: 168000, bookings: 82 },
  { month: "Jan", revenue: 184000, bookings: 91 },
  { month: "Feb", revenue: 212000, bookings: 104 },
  { month: "Mar", revenue: 198000, bookings: 96 },
  { month: "Apr", revenue: 232000, bookings: 112 },
  { month: "May", revenue: 248000, bookings: 121 },
];

export const COMMISSION_BREAKDOWN = [
  { label: "Service commission", value: 38600 },
  { label: "Product sales commission", value: 8400 },
  { label: "Package sales commission", value: 14200 },
  { label: "Tips", value: 5200 },
];

export const UPCOMING_BOOKINGS = [
  { time: "11:30 AM", customer: "Pratima Joshi", service: "Balayage", price: 6500 },
  { time: "1:00 PM", customer: "Sneha Karki", service: "Keratin Treatment", price: 9500 },
  { time: "3:30 PM", customer: "Ankita Rai", service: "Hair Spa", price: 2800 },
  { time: "5:00 PM", customer: "Rojina Basnet", service: "Bridal Trial", price: 12000 },
];

export const RECENT_REVIEWS = [
  { customer: "Pratima J.", rating: 5, text: "Anisha is magical with color — best balayage I've had in Kathmandu." },
  { customer: "Sneha K.", rating: 5, text: "Calm hands, beautiful finish. Booking again next month." },
  { customer: "Ankita R.", rating: 4, text: "Loved the head massage during the hair spa." },
];

export const PORTFOLIO = [
  "linear-gradient(135deg, var(--sand), var(--rose))",
  "linear-gradient(135deg, var(--mist), var(--sage))",
  "linear-gradient(135deg, var(--rose), var(--gold))",
  "linear-gradient(135deg, var(--sage), var(--cloud))",
  "linear-gradient(135deg, var(--gold), var(--sand))",
  "linear-gradient(135deg, var(--cloud), var(--mist))",
];
