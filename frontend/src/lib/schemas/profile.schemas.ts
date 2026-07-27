import { z } from "zod";

export const studentProfileSchema = z.object({
  danceInterests: z
    .string()
    .min(1, "Please enter at least one dance interest")
    .max(200, "Too long"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export const instructorProfileSchema = z.object({
  experienceYears: z
    .number({ error: "Enter a number" })
    .int()
    .min(0, "Cannot be negative")
    .max(60, "Must be 60 or less"),
  danceStyles: z
    .string()
    .min(1, "Please enter at least one dance style")
    .max(200, "Too long"),
  hourlyRate: z
    .number({ error: "Enter a number" })
    .positive("Must be greater than 0"),
  city: z.string().min(1, "City is required").max(100),
  teachingMode: z.enum(["IN_PERSON", "ONLINE", "BOTH"], {
    error: "Please select a teaching mode",
  }),
});

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;
export type InstructorProfileFormValues = z.infer<typeof instructorProfileSchema>;
