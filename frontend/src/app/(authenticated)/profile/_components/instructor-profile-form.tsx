"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import {
  instructorProfileSchema,
  type InstructorProfileFormValues,
} from "@/lib/schemas/profile.schemas";
import type { InstructorProfile } from "@/types/instructor";

const TEACHING_MODES = [
  { value: "IN_PERSON", label: "In-Person" },
  { value: "ONLINE", label: "Online" },
  { value: "BOTH", label: "Both" },
] as const;

interface Props {
  existing: InstructorProfile | null;
}

export function InstructorProfileForm({ existing }: Props) {
  const router = useRouter();
  const isEdit = existing !== null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InstructorProfileFormValues>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: {
      experienceYears: existing?.experienceYears ?? 0,
      danceStyles: existing?.danceStyles?.join(", ") ?? "",
      hourlyRate: existing?.hourlyRate ? Number(existing.hourlyRate) : undefined,
      city: existing?.city ?? "",
      teachingMode: (existing?.teachingMode as InstructorProfileFormValues["teachingMode"]) ?? undefined,
    },
  });

  const currentMode = watch("teachingMode");

  async function onSubmit(data: InstructorProfileFormValues) {
    try {
      if (isEdit) {
        await apiClient.put("/instructors/me", data);
        toast.success("Profile updated!");
      } else {
        await apiClient.post("/instructors", data);
        toast.success("Profile created!");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Experience */}
      <div className="space-y-1.5">
        <Label htmlFor="experienceYears" className="text-white/70 text-sm">
          Years of Experience
        </Label>
        <Input
          id="experienceYears"
          type="number"
          min={0}
          placeholder="5"
          {...register("experienceYears", { valueAsNumber: true })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        {errors.experienceYears && (
          <p className="text-red-400 text-xs">{errors.experienceYears.message}</p>
        )}
      </div>

      {/* Dance Styles */}
      <div className="space-y-1.5">
        <Label htmlFor="danceStyles" className="text-white/70 text-sm">
          Dance Styles
          <span className="text-white/30 ml-1 font-normal">(comma-separated)</span>
        </Label>
        <Input
          id="danceStyles"
          placeholder="Salsa, Bachata, Hip-Hop"
          {...register("danceStyles")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        {errors.danceStyles && (
          <p className="text-red-400 text-xs">{errors.danceStyles.message}</p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="space-y-1.5">
        <Label htmlFor="hourlyRate" className="text-white/70 text-sm">
          Hourly Rate (₹)
        </Label>
        <Input
          id="hourlyRate"
          type="number"
          min={1}
          placeholder="800"
          {...register("hourlyRate", { valueAsNumber: true })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        {errors.hourlyRate && (
          <p className="text-red-400 text-xs">{errors.hourlyRate.message}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <Label htmlFor="city" className="text-white/70 text-sm">
          City
        </Label>
        <Input
          id="city"
          placeholder="Chennai"
          {...register("city")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        {errors.city && (
          <p className="text-red-400 text-xs">{errors.city.message}</p>
        )}
      </div>

      {/* Teaching Mode */}
      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Teaching Mode</Label>
        <Select
          value={currentMode ?? ""}
          onValueChange={(val) =>
            setValue("teachingMode", val as InstructorProfileFormValues["teachingMode"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white data-[placeholder]:text-white/30">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {TEACHING_MODES.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                className="text-white/80 focus:bg-white/10 focus:text-white"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teachingMode && (
          <p className="text-red-400 text-xs">{errors.teachingMode.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full mt-2 py-2.5 rounded-lg bg-white text-black text-sm font-semibold",
          "hover:bg-white/90 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        ) : isEdit ? (
          "Update Profile"
        ) : (
          "Create Profile"
        )}
      </button>
    </form>
  );
}
