"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import { workshopSchema, type WorkshopFormValues } from "@/lib/schemas/workshop.schemas";
import { cn } from "@/lib/utils";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/60 text-xs">{label}</Label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function CreateWorkshopButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      isOnline: false,
      price: 0,
      totalSeats: 10,
    },
  });

  const isOnline = watch("isOnline");

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function onSubmit(data: WorkshopFormValues) {
    try {
      // Map form values → backend payload
      const payload = {
        title:        data.title,
        description:  data.description ?? "",
        danceStyle:   data.danceStyle,
        workshopDate: data.workshopDate,          // "YYYY-MM-DD"
        startTime:    data.startTime,             // "HH:mm"
        endTime:      data.endTime,               // "HH:mm"
        online:       data.isOnline,              // backend field name is "online"
        venue:        data.venue ?? "",
        city:         data.city ?? "",
        meetingLink:  data.meetingLink ?? "",
        price:        data.price,
        totalSeats:   data.totalSeats,
      };

      await apiClient.post("/workshops", payload);
      toast.success("Workshop created!");
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Something went wrong.";
      toast.error(msg);
    }
  }

  const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/25 h-9 text-sm";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Create Workshop
      </button>

      <Dialog open={open} onClose={handleClose} title="Create Workshop" className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

          {/* Title + Dance Style */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title *" error={errors.title?.message}>
              <Input placeholder="e.g. Salsa Beginners" {...register("title")} className={inputCls} />
            </Field>
            <Field label="Dance Style *" error={errors.danceStyle?.message}>
              <Input placeholder="e.g. Salsa" {...register("danceStyle")} className={inputCls} />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" error={errors.description?.message}>
            <Textarea
              rows={2}
              placeholder="What will students learn? What's the vibe?"
              {...register("description")}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm resize-none"
            />
          </Field>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date *" error={errors.workshopDate?.message}>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("workshopDate")}
                className={inputCls}
              />
            </Field>
            <Field label="Start Time *" error={errors.startTime?.message}>
              <Input type="time" {...register("startTime")} className={inputCls} />
            </Field>
            <Field label="End Time *" error={errors.endTime?.message}>
              <Input type="time" {...register("endTime")} className={inputCls} />
            </Field>
          </div>

          {/* Price + Seats */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹) *" error={errors.price?.message}>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0 for free"
                {...register("price", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="Total Seats *" error={errors.totalSeats?.message}>
              <Input
                type="number"
                min={1}
                {...register("totalSeats", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Online toggle */}
          <div className="flex items-center gap-3 py-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isOnline")}
                className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
              />
              <span className="text-white/70 text-sm">Online workshop</span>
            </label>
          </div>

          {/* Venue + City (in-person) */}
          {!isOnline && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Venue" error={errors.venue?.message}>
                <Input placeholder="Studio name or address" {...register("venue")} className={inputCls} />
              </Field>
              <Field label="City *" error={errors.city?.message}>
                <Input placeholder="e.g. Chennai" {...register("city")} className={inputCls} />
              </Field>
            </div>
          )}

          {/* Meeting link (online) */}
          {isOnline && (
            <Field label="Meeting Link *" error={errors.meetingLink?.message}>
              <Input
                type="url"
                placeholder="https://zoom.us/j/..."
                {...register("meetingLink")}
                className={inputCls}
              />
            </Field>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500",
                "text-white text-sm font-semibold transition-colors",
                "disabled:opacity-50 flex items-center justify-center gap-2"
              )}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                "Create Workshop"
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
