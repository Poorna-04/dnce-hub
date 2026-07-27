export type WorkshopStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Workshop {
  id: number;
  instructorId: number;
  instructorName: string;
  title: string;
  description: string;
  danceStyle: string;
  posterUrl: string | null;
  venue: string | null;
  city: string;
  online: boolean;
  meetingLink: string | null;
  workshopDate: string;   // "YYYY-MM-DD"
  startTime: string;      // "HH:mm:ss"
  endTime: string;
  price: number;
  totalSeats: number;
  registeredSeats: number;
  seatsLeft: number;
  status: WorkshopStatus;
  createdAt: string;
}

/** Workshop + registration-specific fields returned from /workshops/my-registrations */
export interface RegisteredWorkshop extends Omit<Workshop, "posterUrl" | "createdAt"> {
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  registeredAt: string;
}

export const STATUS_LABEL: Record<WorkshopStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Live now",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_STYLE: Record<WorkshopStatus, string> = {
  UPCOMING:  "bg-sky-500/15 text-sky-300",
  ONGOING:   "bg-green-500/15 text-green-300",
  COMPLETED: "bg-white/5 text-white/30",
  CANCELLED: "bg-red-500/15 text-red-400",
};
