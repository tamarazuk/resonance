import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopNav } from "@/components/layout/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userInitial =
    session.user.name?.charAt(0)?.toUpperCase() ??
    session.user.email?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav userInitial={userInitial} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
