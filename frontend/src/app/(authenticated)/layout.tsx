import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeToken } from "@/lib/auth/decode-token";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AppShell } from "./_components";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dnce_access_token")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  const user = decodeToken(token);
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <AuthProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
