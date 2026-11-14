import { signOut } from "@/auth";
import { DeskNav } from "./DeskNav";
import { ThemeToggle } from "./ThemeToggle";
import { buttonQuiet } from "./styles";

export function DeskShell({
  login,
  children,
}: {
  login: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-xl leading-tight text-foreground">Desk</p>
            <p className="truncate font-sans text-sm text-muted-foreground">
              {login} · darznieks.com
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className={buttonQuiet}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl lg:grid-cols-[15rem_minmax(0,1fr)]">
        <DeskNav />
        <main id="main-content" className="min-w-0 px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
