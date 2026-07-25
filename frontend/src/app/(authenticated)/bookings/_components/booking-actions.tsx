"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import type { Booking } from "@/types/booking";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";

interface Props {
  booking: Booking;
  role: Role;
}

type Action = "confirm" | "cancel" | "complete";

export function BookingActions({ booking, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);

  async function handleAction(action: Action) {
    setLoading(action);
    try {
      await apiClient.patch(`/bookings/${booking.id}/${action}`);
      toast.success(`Booking ${action}ed!`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const isStudent    = role === ROLES.STUDENT;
  const isInstructor = role === ROLES.INSTRUCTOR;
  const isPending    = booking.status === "PENDING";
  const isConfirmed  = booking.status === "CONFIRMED";

  // What actions are available?
  const showConfirm  = isInstructor && isPending;
  const showComplete = isInstructor && isConfirmed;
  const showCancel   = (isStudent && (isPending || isConfirmed)) ||
                       (isInstructor && (isPending || isConfirmed));

  if (!showConfirm && !showComplete && !showCancel) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {showConfirm && (
        <Button
          size="sm"
          onClick={() => handleAction("confirm")}
          disabled={loading !== null}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3"
        >
          {loading === "confirm" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Confirm"
          )}
        </Button>
      )}

      {showComplete && (
        <Button
          size="sm"
          onClick={() => handleAction("complete")}
          disabled={loading !== null}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-7 px-3"
        >
          {loading === "complete" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Mark Complete"
          )}
        </Button>
      )}

      {showCancel && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("cancel")}
          disabled={loading !== null}
          className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-7 px-3"
        >
          {loading === "cancel" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Cancel"
          )}
        </Button>
      )}
    </div>
  );
}
