export interface BlacklistEntry {
  id: string;
  phoneNumber: string;
  strikes: number;
  lastNoShowDate: string;
  flaggedByBusinesses: string[];
}

export let mockBlacklist: BlacklistEntry[] = [
  {
    id: "bl1",
    phoneNumber: "+977 9841000000",
    strikes: 4,
    lastNoShowDate: "2024-10-20",
    flaggedByBusinesses: ["b1", "b2"],
  },
  {
    id: "bl2",
    phoneNumber: "+977 9801234567",
    strikes: 2,
    lastNoShowDate: "2024-10-15",
    flaggedByBusinesses: ["b2"],
  },
];
