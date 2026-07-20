"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

export function SaveButton({ instructorId }: { instructorId: number }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await apiClient.delete(`/students/saved-instructors/${instructorId}`);
        setSaved(false);
        toast.success("Removed from saved instructors");
      } else {
        await apiClient.post(`/students/saved-instructors/${instructorId}`);
        setSaved(true);
        toast.success("Instructor saved!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
        saved
          ? "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Heart className={`w-4 h-4 ${saved ? "fill-rose-400" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
