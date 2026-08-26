export type ServiceCategory =
  | "Hair" | "Nails" | "Skin" | "Massage" | "Bridal"
  | "Makeup" | "Dental" | "Wellness" | "Barber" | "Academy";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  duration: number; // minutes
  price: number; // NPR
  staff: string[];
  resource: string;
  buffer: number; // minutes
  online: boolean;
  active: boolean;
  addons?: string[];
  products?: string[];
  prep?: string;
  aftercare?: string;
  cancellation?: string;
  marketplace?: boolean;
  image?: string;
};

export const SERVICES: Service[] = [
  {
    id: "sv1", name: "Signature Balayage", category: "Hair",
    description: "Hand-painted color for soft, sun-kissed dimension. Includes wash, tone, and blow-dry.",
    duration: 180, price: 8500, staff: ["Anisha Shrestha"], resource: "Styling Chair 2",
    buffer: 15, online: true, active: true,
    addons: ["Deep conditioning", "Hair wash", "Premium product upgrade"],
    products: ["L'Oréal Majirel", "Olaplex No.3"],
    prep: "Arrive with clean, dry hair. Avoid oiling 24h before.",
    aftercare: "Use sulfate-free shampoo. Color refresh every 8 weeks.",
    cancellation: "Cancel 6h before to avoid fee.",
    marketplace: true,
  },
  {
    id: "sv2", name: "Keratin Smoothing", category: "Hair",
    description: "Frizz-free, salon-smooth hair for up to 4 months.",
    duration: 150, price: 9500, staff: ["Anisha Shrestha"], resource: "Styling Chair 1",
    buffer: 15, online: true, active: true, marketplace: true,
  },
  {
    id: "sv3", name: "Gel Nail Extensions", category: "Nails",
    description: "Sculpted gel extensions with custom finish.",
    duration: 90, price: 3500, staff: ["Ritu Gurung"], resource: "Nail Station 1",
    buffer: 10, online: true, active: true,
    addons: ["Nail art", "Cuticle treatment"], marketplace: true,
  },
  {
    id: "sv4", name: "Spa Pedicure", category: "Nails",
    description: "Luxe pedicure with sea-salt soak and paraffin wrap.",
    duration: 60, price: 2200, staff: ["Ritu Gurung"], resource: "Nail Station 2",
    buffer: 10, online: true, active: true, marketplace: true,
  },
  {
    id: "sv5", name: "HydraFacial Premium", category: "Skin",
    description: "Multi-step hydrating facial with peel, extraction and serum infusion.",
    duration: 75, price: 6500, staff: ["Sneha Tamang"], resource: "Spa Room A",
    buffer: 15, online: true, active: true,
    addons: ["Eye lift add-on", "LED light therapy"],
    aftercare: "Avoid sun exposure for 24h.", marketplace: true,
  },
  {
    id: "sv6", name: "Acne Clarifying Facial", category: "Skin",
    description: "Targeted facial for breakout-prone skin.",
    duration: 60, price: 4200, staff: ["Sneha Tamang"], resource: "Spa Room B",
    buffer: 15, online: true, active: true, marketplace: true,
  },
  {
    id: "sv7", name: "Ayurvedic Full Body Massage", category: "Massage",
    description: "Warm herbal oil massage with traditional Nepali Ayurvedic technique.",
    duration: 90, price: 4500, staff: ["Bishal Lama"], resource: "Spa Room C",
    buffer: 15, online: true, active: true, marketplace: true,
  },
  {
    id: "sv8", name: "Hot Stone Therapy", category: "Massage",
    description: "Heated basalt stone therapy to release deep tension.",
    duration: 75, price: 5200, staff: ["Bishal Lama"], resource: "Spa Room C",
    buffer: 15, online: true, active: true, marketplace: true,
  },
  {
    id: "sv9", name: "Newari Bridal Package", category: "Bridal",
    description: "Full-day bridal styling — hair, HD makeup, draping and touch-ups.",
    duration: 360, price: 45000, staff: ["Pooja Maharjan"], resource: "Bridal Suite",
    buffer: 30, online: true, active: true,
    addons: ["Bridal trial", "Mehendi"], marketplace: true,
  },
  {
    id: "sv10", name: "Engagement Makeup", category: "Bridal",
    description: "Full glam look with airbrush base and hair styling.",
    duration: 120, price: 12000, staff: ["Pooja Maharjan", "Karuna K.C."], resource: "Bridal Suite",
    buffer: 20, online: true, active: true, marketplace: true,
  },
  {
    id: "sv11", name: "Party HD Makeup", category: "Makeup",
    description: "High-definition makeup with long-wear finish.",
    duration: 60, price: 4500, staff: ["Karuna K.C."], resource: "Makeup Room",
    buffer: 10, online: true, active: true, marketplace: true,
  },
  {
    id: "sv12", name: "Teeth Whitening", category: "Dental",
    description: "In-chair LED-activated whitening, 6 shades brighter.",
    duration: 60, price: 12500, staff: ["Dr. Sushma Rai"], resource: "Dental Chair 1",
    buffer: 15, online: true, active: true,
    addons: ["Teeth whitening add-on", "Polish & clean"],
    cancellation: "24h notice required.", marketplace: true,
  },
  {
    id: "sv13", name: "Smile Design Consultation", category: "Dental",
    description: "Cosmetic consultation with digital smile preview.",
    duration: 45, price: 2500, staff: ["Dr. Sushma Rai"], resource: "Dental Chair 2",
    buffer: 10, online: true, active: true, marketplace: true,
  },
  {
    id: "sv14", name: "Wellness Detox Ritual", category: "Wellness",
    description: "Full wellness ritual — body scrub, steam and aromatherapy.",
    duration: 120, price: 6800, staff: ["Bishal Lama"], resource: "Spa Room A",
    buffer: 20, online: true, active: true, marketplace: true,
  },
  {
    id: "sv15", name: "Classic Beard Sculpt", category: "Barber",
    description: "Hot towel shave with beard contouring and oil massage.",
    duration: 45, price: 1500, staff: ["Anisha Shrestha"], resource: "Styling Chair 3",
    buffer: 10, online: true, active: true, marketplace: true,
  },
  {
    id: "sv16", name: "Hair Diploma · Foundation", category: "Academy",
    description: "12-week foundation diploma with industry certification.",
    duration: 240, price: 65000, staff: ["Manisha Adhikari"], resource: "Training Room",
    buffer: 30, online: false, active: true, marketplace: true,
  },
];

export const ADDONS = [
  { name: "Hair wash", price: 400, duration: 15, category: "Hair" },
  { name: "Deep conditioning", price: 1200, duration: 25, category: "Hair" },
  { name: "Nail art", price: 600, duration: 20, category: "Nails" },
  { name: "Cuticle treatment", price: 500, duration: 15, category: "Nails" },
  { name: "Facial massage", price: 800, duration: 15, category: "Skin" },
  { name: "LED light therapy", price: 1500, duration: 20, category: "Skin" },
  { name: "Eye lift add-on", price: 1800, duration: 20, category: "Skin" },
  { name: "Bridal trial", price: 8000, duration: 90, category: "Bridal" },
  { name: "Mehendi", price: 3500, duration: 60, category: "Bridal" },
  { name: "Teeth whitening add-on", price: 4500, duration: 30, category: "Dental" },
  { name: "Polish & clean", price: 2200, duration: 30, category: "Dental" },
  { name: "Premium product upgrade", price: 1500, duration: 0, category: "Hair" },
];

export type Resource = {
  name: string;
  type: "Chair" | "Room" | "Station" | "Suite";
  branch: string;
  capacity: number;
  bookingsToday: number;
  utilization: number;
};

export const RESOURCES: Resource[] = [
  { name: "Styling Chair 1", type: "Chair", branch: "Jhamsikhel", capacity: 1, bookingsToday: 7, utilization: 88 },
  { name: "Styling Chair 2", type: "Chair", branch: "Jhamsikhel", capacity: 1, bookingsToday: 6, utilization: 82 },
  { name: "Styling Chair 3", type: "Chair", branch: "Lazimpat", capacity: 1, bookingsToday: 4, utilization: 65 },
  { name: "Spa Room A", type: "Room", branch: "Jhamsikhel", capacity: 1, bookingsToday: 5, utilization: 78 },
  { name: "Spa Room B", type: "Room", branch: "Patan", capacity: 1, bookingsToday: 3, utilization: 55 },
  { name: "Spa Room C", type: "Room", branch: "Patan", capacity: 1, bookingsToday: 4, utilization: 70 },
  { name: "Nail Station 1", type: "Station", branch: "Lazimpat", capacity: 1, bookingsToday: 6, utilization: 85 },
  { name: "Nail Station 2", type: "Station", branch: "Lazimpat", capacity: 1, bookingsToday: 5, utilization: 72 },
  { name: "Makeup Room", type: "Room", branch: "Thamel", capacity: 2, bookingsToday: 3, utilization: 60 },
  { name: "Dental Chair 1", type: "Chair", branch: "Pokhara", capacity: 1, bookingsToday: 5, utilization: 90 },
  { name: "Dental Chair 2", type: "Chair", branch: "Pokhara", capacity: 1, bookingsToday: 3, utilization: 62 },
  { name: "Training Room", type: "Room", branch: "Jhamsikhel", capacity: 12, bookingsToday: 2, utilization: 50 },
  { name: "Bridal Suite", type: "Suite", branch: "Jhamsikhel", capacity: 1, bookingsToday: 2, utilization: 75 },
];

export const CATEGORY_META: Record<ServiceCategory, { tone: string; emoji: string }> = {
  Hair:    { tone: "from-[color-mix(in_oklab,var(--rose)_40%,white)] to-card", emoji: "✂️" },
  Nails:   { tone: "from-[color-mix(in_oklab,var(--mist)_55%,white)] to-card", emoji: "💅" },
  Skin:    { tone: "from-[color-mix(in_oklab,var(--sand)_70%,white)] to-card", emoji: "✨" },
  Massage: { tone: "from-[color-mix(in_oklab,var(--sage)_30%,white)] to-card", emoji: "🪷" },
  Bridal:  { tone: "from-[color-mix(in_oklab,var(--rose)_55%,white)] to-card", emoji: "👰" },
  Makeup:  { tone: "from-[color-mix(in_oklab,var(--gold)_30%,white)] to-card", emoji: "💄" },
  Dental:  { tone: "from-[color-mix(in_oklab,var(--mist)_70%,white)] to-card", emoji: "🦷" },
  Wellness:{ tone: "from-[color-mix(in_oklab,var(--sage)_25%,white)] to-card", emoji: "🌿" },
  Barber:  { tone: "from-[color-mix(in_oklab,var(--cloud)_70%,white)] to-card", emoji: "💈" },
  Academy: { tone: "from-[color-mix(in_oklab,var(--gold)_25%,white)] to-card", emoji: "🎓" },
};
