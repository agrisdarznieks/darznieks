import { DeskShell } from "@/components/admin/DeskShell";
import { requireAdmin } from "@/lib/admin/session";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const login = await requireAdmin();
  return <DeskShell login={login}>{children}</DeskShell>;
}
