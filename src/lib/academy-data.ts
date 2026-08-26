// Academy mock data
export const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export type Course = {
  id: string;
  name: string;
  category: "Makeup" | "Hair" | "Nail" | "Skin" | "Spa" | "Bridal" | "Dental";
  duration: string;
  fee: number;
  instructor: string;
  batch: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  status: "Ongoing" | "Upcoming" | "Completed";
  emoji: string;
  tone: string;
};

export const COURSES: Course[] = [
  { id: "co1", name: "Professional Makeup Course", category: "Makeup", duration: "12 weeks", fee: 65000, instructor: "Aanchal Shrestha", batch: "Batch 24", startDate: "2026-04-01", endDate: "2026-06-24", enrolled: 18, capacity: 20, status: "Ongoing", emoji: "💄", tone: "var(--rose)" },
  { id: "co2", name: "Bridal Makeup Masterclass", category: "Bridal", duration: "6 weeks", fee: 48000, instructor: "Priya Tamang", batch: "Batch 12", startDate: "2026-05-10", endDate: "2026-06-21", enrolled: 12, capacity: 15, status: "Upcoming", emoji: "👰", tone: "var(--rose)" },
  { id: "co3", name: "Hair Styling Foundation", category: "Hair", duration: "10 weeks", fee: 42000, instructor: "Rohan KC", batch: "Batch 18", startDate: "2026-03-15", endDate: "2026-05-24", enrolled: 16, capacity: 20, status: "Ongoing", emoji: "💇‍♀️", tone: "var(--gold)" },
  { id: "co4", name: "Nail Art Certification", category: "Nail", duration: "4 weeks", fee: 22000, instructor: "Nisha Maharjan", batch: "Batch 9", startDate: "2026-04-20", endDate: "2026-05-18", enrolled: 14, capacity: 15, status: "Ongoing", emoji: "💅", tone: "var(--mist)" },
  { id: "co5", name: "Skin Care Basics", category: "Skin", duration: "8 weeks", fee: 35000, instructor: "Sneha Gurung", batch: "Batch 14", startDate: "2026-06-01", endDate: "2026-07-27", enrolled: 8, capacity: 18, status: "Upcoming", emoji: "✨", tone: "var(--sage)" },
  { id: "co6", name: "Spa Therapy Training", category: "Spa", duration: "10 weeks", fee: 52000, instructor: "Mira Lama", batch: "Batch 7", startDate: "2026-02-10", endDate: "2026-04-21", enrolled: 12, capacity: 14, status: "Completed", emoji: "🌿", tone: "var(--sage)" },
  { id: "co7", name: "Dental Assistant Training", category: "Dental", duration: "16 weeks", fee: 75000, instructor: "Dr. Shrestha", batch: "Batch 4", startDate: "2026-03-01", endDate: "2026-06-21", enrolled: 9, capacity: 12, status: "Ongoing", emoji: "🦷", tone: "var(--mist)" },
];

export type Student = {
  id: string;
  name: string;
  phone: string;
  course: string;
  batch: string;
  enrolledOn: string;
  feeTotal: number;
  feePaid: number;
  attendance: number;
  progress: number;
  certificate: "Eligible" | "In progress" | "Pending payment" | "Issued";
};

export const STUDENTS: Student[] = [
  { id: "s1", name: "Sushmita Karki", phone: "9841 123 456", course: "Professional Makeup", batch: "Batch 24", enrolledOn: "2026-04-01", feeTotal: 65000, feePaid: 65000, attendance: 96, progress: 78, certificate: "In progress" },
  { id: "s2", name: "Reema Tamang", phone: "9851 234 567", course: "Hair Styling Foundation", batch: "Batch 18", enrolledOn: "2026-03-15", feeTotal: 42000, feePaid: 42000, attendance: 92, progress: 95, certificate: "Eligible" },
  { id: "s3", name: "Anjali Pradhan", phone: "9802 345 678", course: "Nail Art Certification", batch: "Batch 9", enrolledOn: "2026-04-20", feeTotal: 22000, feePaid: 15000, attendance: 88, progress: 65, certificate: "In progress" },
  { id: "s4", name: "Karuna Limbu", phone: "9818 456 789", course: "Professional Makeup", batch: "Batch 24", enrolledOn: "2026-04-01", feeTotal: 65000, feePaid: 32500, attendance: 84, progress: 70, certificate: "Pending payment" },
  { id: "s5", name: "Manisha Basnet", phone: "9861 567 890", course: "Spa Therapy Training", batch: "Batch 7", enrolledOn: "2026-02-10", feeTotal: 52000, feePaid: 52000, attendance: 98, progress: 100, certificate: "Issued" },
  { id: "s6", name: "Pratiksha Shahi", phone: "9849 678 901", course: "Dental Assistant", batch: "Batch 4", enrolledOn: "2026-03-01", feeTotal: 75000, feePaid: 50000, attendance: 91, progress: 60, certificate: "In progress" },
  { id: "s7", name: "Bishal Magar", phone: "9802 789 012", course: "Hair Styling Foundation", batch: "Batch 18", enrolledOn: "2026-03-15", feeTotal: 42000, feePaid: 42000, attendance: 89, progress: 92, certificate: "Eligible" },
  { id: "s8", name: "Priya Adhikari", phone: "9841 890 123", course: "Spa Therapy Training", batch: "Batch 7", enrolledOn: "2026-02-10", feeTotal: 52000, feePaid: 52000, attendance: 95, progress: 100, certificate: "Issued" },
];

export type ClassSession = {
  id: string;
  title: string;
  course: string;
  instructor: string;
  date: string;
  time: string;
  room: string;
  mode: "Offline" | "Online" | "Hybrid";
};

export const CLASSES: ClassSession[] = [
  { id: "cl1", title: "Bridal Base & Contour", course: "Professional Makeup", instructor: "Aanchal Shrestha", date: "Today", time: "10:00 – 12:30", room: "Studio A", mode: "Offline" },
  { id: "cl2", title: "Hair Color Theory", course: "Hair Styling Foundation", instructor: "Rohan KC", date: "Today", time: "14:00 – 16:00", room: "Online", mode: "Online" },
  { id: "cl3", title: "Acrylic Extension Techniques", course: "Nail Art Certification", instructor: "Nisha Maharjan", date: "Tomorrow", time: "11:00 – 13:00", room: "Nail Lab", mode: "Offline" },
  { id: "cl4", title: "Sterilisation Protocols", course: "Dental Assistant", instructor: "Dr. Shrestha", date: "Tomorrow", time: "09:00 – 11:00", room: "Dental Sim Room", mode: "Hybrid" },
  { id: "cl5", title: "Bridal Look Practical", course: "Bridal Masterclass", instructor: "Priya Tamang", date: "Fri 09 May", time: "10:00 – 14:00", room: "Studio B", mode: "Offline" },
  { id: "cl6", title: "Aromatherapy Foundations", course: "Spa Therapy", instructor: "Mira Lama", date: "Sat 10 May", time: "11:00 – 13:00", room: "Spa Room 1", mode: "Offline" },
];
