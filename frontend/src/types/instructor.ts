export type TeachingMode = "IN_PERSON" | "ONLINE" | "BOTH";
export type SlotType = "RECURRING" | "ONE_TIME";

export interface InstructorProfile {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  experienceYears: number;
  danceStyles: string[];
  hourlyRate: number;
  city: string;
  teachingMode: TeachingMode;
}

export interface AvailabilitySlot {
  id: number;
  instructorId: number;
  slotType: SlotType;
  dayOfWeek: number | null;   // 1=Mon … 7=Sun, only when RECURRING
  slotDate: string | null;    // ISO date, only when ONE_TIME
  startTime: string;          // "HH:mm:ss"
  endTime: string;
  available: boolean;
}

export const DAY_NAMES: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday",
};

export const TEACHING_MODE_LABEL: Record<TeachingMode, string> = {
  IN_PERSON: "In Person",
  ONLINE: "Online",
  BOTH: "In Person & Online",
};
