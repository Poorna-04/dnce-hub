"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Booking } from "@/types/booking";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";

interface Props {
  booking: Booking;
  role: Role;
}

type Action = "pay" | "complete" | "cancel";

export function BookingActions({ booking, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);

  async function handleAction(action: Action) {
    setLoading(action);
    try {
      await apiClient.patch(`/bookings/${booking.id}/${action}`);
      const messages: Record<Action, string> = {
        pay:      "Payment successful! Booking confirmed.",
        complete: "Session marked as complete!",
        cancel:   "Booking cancelled.",
      };
      toast.success(messages[action]);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const isStudent   = role === ROLES.STUDENT;
  const isPending   = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";

  // Student: Pay Now on PENDING
  const showPay    = isStudent && isPending;
  // Both roles: Cancel on PENDING or CONFIRMED
  const showCancel = isPending || isConfirmed;
  // Sessions auto-complete once the date passes — no manual "Mark Complete" needed

  if (!showPay && !showCancel) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {showPay && (
        <button
          onClick={() => handleAction("pay")}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {loading === "pay" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <><CreditCard className="w-3 h-3" /> Pay Now</>
          )}
        </button>
      )}

      {showCancel && (
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading !== null}
          className="px-3 h-7 rounded-lg border border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading === "cancel" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Cancel"
          )}
        </button>
      )}
    </div>
  );
}
