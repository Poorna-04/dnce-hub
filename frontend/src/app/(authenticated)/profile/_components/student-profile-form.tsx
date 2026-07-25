"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import {
  studentProfileSchema,
  type StudentProfileFormValues,
} from "@/lib/schemas/profile.schemas";
import type { StudentProfile } from "@/types/student";

interface Props {
  existing: StudentProfile | null;
}

export function StudentProfileForm({ existing }: Props) {
  const router = useRouter();
  const isEdit = existing !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      danceInterests: existing?.danceInterests?.join(", ") ?? "",
      bio: existing?.bio ?? "",
    },
  });

  async function onSubmit(data: StudentProfileFormValues) {
    try {
      if (isEdit) {
        await apiClient.put("/students/profile", data);
        toast.success("Profile updated!");
      } else {
        await apiClient.post("/students/profile", data);
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
      {/* Dance Interests */}
      <div className="space-y-1.5">
        <Label htmlFor="danceInterests" className="text-white/70 text-sm">
          Dance Interests
          <span className="text-white/30 ml-1 font-normal">(comma-separated)</span>
        </Label>
        <Input
          id="danceInterests"
          placeholder="Salsa, Hip-Hop, Bharatanatyam"
          {...register("danceInterests")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        {errors.danceInterests && (
          <p className="text-red-400 text-xs">{errors.danceInterests.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-white/70 text-sm">
          Bio
          <span className="text-white/30 ml-1 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Tell instructors a bit about yourself — your experience level, goals, preferred schedule…"
          {...register("bio")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
        />
        {errors.bio && (
          <p className="text-red-400 text-xs">{errors.bio.message}</p>
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
