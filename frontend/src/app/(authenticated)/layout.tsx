import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server-token";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AppShell } from "./_components";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <AuthProvider initialUser={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
