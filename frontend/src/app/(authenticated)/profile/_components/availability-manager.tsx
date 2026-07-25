"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Clock, CalendarDays } from "lucide-react";
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
import type { AvailabilitySlot, SlotType } from "@/types/instructor";
import { DAY_NAMES } from "@/types/instructor";

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

interface AddSlotForm {
  slotType: SlotType;
  dayOfWeek: string;
  slotDate: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: AddSlotForm = {
  slotType: "RECURRING",
  dayOfWeek: "1",
  slotDate: "",
  startTime: "",
  endTime: "",
};

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

interface Props {
  instructorId: number;
  initialSlots: AvailabilitySlot[];
}

export function AvailabilityManager({ instructorId, initialSlots }: Props) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddSlotForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function setField<K extends keyof AddSlotForm>(key: K, value: AddSlotForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd() {
    if (!form.startTime || !form.endTime) {
      toast.error("Please fill in start and end times.");
      return;
    }
    if (form.slotType === "ONE_TIME") {
      if (!form.slotDate) {
        toast.error("Please select a date for the one-time slot.");
        return;
      }
      const picked = new Date(form.slotDate);
      const today  = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(picked.getTime()) || picked.getFullYear() < today.getFullYear()) {
        toast.error("Please enter a valid future date.");
        return;
      }
      if (picked < today) {
        toast.error("Date must be today or in the future.");
        return;
      }
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      if (picked > maxDate) {
        toast.error("Date cannot be more than 2 years in the future.");
        return;
      }
    }
    if (form.startTime >= form.endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const payload: Record<string, unknown> = {
      slotType: form.slotType,
      startTime: form.startTime,
      endTime: form.endTime,
    };
    if (form.slotType === "RECURRING") {
      payload.dayOfWeek = parseInt(form.dayOfWeek, 10);
    } else {
      payload.slotDate = form.slotDate;
    }

    setSaving(true);
    try {
      const res = await apiClient.post<{ data: AvailabilitySlot }>(
        `/instructors/${instructorId}/availability`,
        payload
      );
      setSlots((prev) => [...prev, res.data.data]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success("Slot added!");
    } catch {
      toast.error("Failed to add slot. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slotId: number) {
    setDeletingId(slotId);
    try {
      await apiClient.delete(`/instructors/${instructorId}/availability/${slotId}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success("Slot removed.");
    } catch {
      toast.error("Failed to delete slot.");
    } finally {
      setDeletingId(null);
    }
  }

  const recurring = slots
    .filter((s) => s.slotType === "RECURRING")
    .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0));
  const onetime = slots
    .filter((s) => s.slotType === "ONE_TIME")
    .sort((a, b) => (a.slotDate ?? "").localeCompare(b.slotDate ?? ""));

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">
          Availability
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="text-white font-semibold text-sm">Your Slots</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Students can book the slots you list here.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-medium transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Slot
        </button>
      </div>

      {/* Add Slot form */}
      {showForm && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 mb-5 space-y-4">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">New slot</p>

          {/* Slot type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Type</Label>
              <Select
                value={form.slotType}
                onValueChange={(v) => setField("slotType", v as SlotType)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="RECURRING" className="text-white/80 focus:bg-white/10 focus:text-white">
                    Recurring
                  </SelectItem>
                  <SelectItem value="ONE_TIME" className="text-white/80 focus:bg-white/10 focus:text-white">
                    One-time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day / Date */}
            {form.slotType === "RECURRING" ? (
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Day of Week</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(v) => setField("dayOfWeek", v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {DAY_OPTIONS.map((d) => (
                      <SelectItem
                        key={d}
                        value={String(d)}
                        className="text-white/80 focus:bg-white/10 focus:text-white"
                      >
                        {DAY_NAMES[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Date</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 2); return d.toISOString().split("T")[0]; })()}
                  value={form.slotDate}
                  onChange={(e) => setField("slotDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
            )}
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setField("startTime", e.target.value)}
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)}
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </>}
            </button>
          </div>
        </div>
      )}

      {/* Slot list */}
      {slots.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
          <CalendarDays className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No slots yet.</p>
          <p className="text-white/20 text-xs mt-1">Click "Add Slot" to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {recurring.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">
                Weekly · Recurring
              </p>
              <div className="space-y-2">
                {recurring.map((slot) => (
                  <SlotRow
                    key={slot.id}
                    label={DAY_NAMES[slot.dayOfWeek!]}
                    time={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
                    available={slot.available}
                    onDelete={() => handleDelete(slot.id)}
                    deleting={deletingId === slot.id}
                  />
                ))}
              </div>
            </div>
          )}
          {onetime.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">
                One-time
              </p>
              <div className="space-y-2">
                {onetime.map((slot) => (
                  <SlotRow
                    key={slot.id}
                    label={new Date(slot.slotDate!).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                    time={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
                    available={slot.available}
                    onDelete={() => handleDelete(slot.id)}
                    deleting={deletingId === slot.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SlotRow({
  label,
  time,
  available,
  onDelete,
  deleting,
}: {
  label: string;
  time: string;
  available: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="group flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 px-4 py-3 gap-3 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${available ? "bg-emerald-400" : "bg-zinc-600"}`} />
        <span className="text-white text-sm font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1.5 text-white/40 text-xs">
          <Clock className="w-3 h-3" />
          {time}
        </span>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all disabled:opacity-40"
          title="Remove slot"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
