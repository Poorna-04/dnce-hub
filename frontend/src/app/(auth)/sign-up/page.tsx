import type { Metadata } from "next";
import { SignUpForm } from "./_components";

export const metadata: Metadata = {
  title: "Sign Up | DanceHub",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
