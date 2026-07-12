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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth.schemas";
import { authService } from "@/services/auth.service";
import { ROLES } from "@/types";

const inputClass =
  "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/30 transition-colors";

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const selectedRole = watch("role") ?? "";

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = values;
      await authService.register(payload);
      toast.success("Account created! Please sign in.");
      router.push("/sign-in");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-white/30 mb-2">
          Welcome to
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">DanceHub</h1>
        <p className="text-sm text-white/40 mt-1">Create your account to get started</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              Full name
            </Label>
            <Input
              id="fullName"
              placeholder="Jane Smith"
              autoComplete="name"
              className={inputClass}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-400/80">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              I am a
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("role", value as RegisterFormValues["role"], {
                  shouldValidate: true,
                })
              }
              value={selectedRole}
            >
              <SelectTrigger
                id="role"
                className={`${inputClass} [&>span]:text-white/70`}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value={ROLES.STUDENT} className="focus:bg-white/10 focus:text-white">
                  Student
                </SelectItem>
                <SelectItem value={ROLES.INSTRUCTOR} className="focus:bg-white/10 focus:text-white">
                  Instructor
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-400/80">{errors.role.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-white/60 text-xs font-medium tracking-wide uppercase">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-white/25 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400/80">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-2 bg-white text-black hover:bg-white/90 font-semibold tracking-wide h-10"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </Button>

        </form>
      </div>

      {/* Footer link */}
      <p className="text-sm text-white/30 text-center mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-white/70 hover:text-white transition-colors font-medium">
          Sign in
        </Link>
      </p>

    </div>
  );
}
