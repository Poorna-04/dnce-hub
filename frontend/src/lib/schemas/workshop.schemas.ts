import { z } from "zod";

export const workshopSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(1000).optional(),
    danceStyle: z.string().min(1, "Dance style is required").max(100),
    workshopDate: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    isOnline: z.boolean(),
    venue: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    meetingLink: z
      .string()
      .url("Invalid URL")
      .optional()
      .or(z.literal("")),
    price: z
      .number({ invalid_type_error: "Enter a number" })
      .min(0, "Price must be ≥ 0"),
    totalSeats: z
      .number({ invalid_type_error: "Enter a number" })
      .int()
      .min(1, "At least 1 seat required"),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((d) => d.isOnline || !!d.city, {
    message: "City is required for in-person workshops",
    path: ["city"],
  })
  .refine((d) => !d.isOnline || !!d.meetingLink, {
    message: "Meeting link is required for online workshops",
    path: ["meetingLink"],
  });

export type WorkshopFormValues = z.infer<typeof workshopSchema>;
