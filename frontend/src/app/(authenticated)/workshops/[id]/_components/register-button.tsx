"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

interface RegisterButtonProps {
  workshopId: number;
  seatsLeft: number;
}

export function RegisterButton({ workshopId, seatsLeft }: RegisterButtonProps) {
  // Start unregistered — a real app would check the student's registrations on load.
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const full = seatsLeft === 0 && !registered;

  const toggle = async () => {
    setLoading(true);
    try {
      if (registered) {
        await apiClient.delete(`/workshops/${workshopId}/register`);
        setRegistered(false);
        toast.success("Registration cancelled");
      } else {
        await apiClient.post(`/workshops/${workshopId}/register`);
        setRegistered(true);
        toast.success("You're registered! 🎉");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (full) {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/30 text-sm font-medium cursor-not-allowed"
      >
        Fully booked
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
        registered
          ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-white/10 bg-white text-black hover:bg-white/90"
      }`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {registered ? "Cancel registration" : "Register now"}
    </button>
  );
}
