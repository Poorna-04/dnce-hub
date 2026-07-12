"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth.schemas";
import { authService } from "@/services/auth.service";

const inputClass =
  "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/30 transition-colors";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await authService.login(values);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-white/30 mb-2">
          Welcome back to
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">DanceHub</h1>
        <p className="text-sm text-white/40 mt-1">Sign in to continue</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400/80">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputClass} pr-10`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-white/25 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400/80">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-white text-black hover:bg-white/90 font-semibold tracking-wide h-10"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>

        </form>
      </div>

      <p className="text-sm text-white/30 text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-white/70 hover:text-white transition-colors font-medium">
          Sign up
        </Link>
      </p>

    </div>
  );
}
