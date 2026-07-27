export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Booking {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  instructorId: number;
  instructorName: string;
  slotId: number;
  bookingDate: string;   // ISO date "YYYY-MM-DD"
  startTime: string;     // "HH:mm:ss"
  endTime: string;       // "HH:mm:ss"
  status: BookingStatus;
  totalAmount: number;
  cancelledBy: string | null;
  version: number;
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-300",
  CONFIRMED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-400",
  COMPLETED: "bg-sky-500/15 text-sky-300",
};
