import type { Metadata } from "next";
import { SignInForm } from "./_components";

export const metadata: Metadata = {
  title: "Sign In | DanceHub",
};

export default function SignInPage() {
  return <SignInForm />;
}
