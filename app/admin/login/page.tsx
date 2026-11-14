import type { Metadata } from "next";
import { signIn } from "@/auth";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { button } from "@/components/admin/styles";
import { adminConfigGaps } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  AccessDenied: "That GitHub account is not on the allowlist.",
  Configuration: "GitHub sign-in is not configured yet.",
  OAuthSignin: "GitHub did not start the sign-in.",
  OAuthCallback: "GitHub did not finish the sign-in.",
  Default: "Sign-in did not complete.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const gaps = adminConfigGaps();
  const error = params.error ? (ERRORS[params.error] ?? ERRORS.Default) : null;
  const callback = params.callbackUrl?.startsWith("/admin") ? params.callbackUrl : "/admin";

  return (
    <main id="main-content" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 flex justify-end">
        <ThemeToggle />
      </div>
      <p className="font-sans text-sm uppercase tracking-widest text-accent-text">darznieks.com</p>
      <h1 className="mt-2 font-serif text-4xl text-foreground">Desk</h1>
      <p className="mt-4 font-serif text-base leading-7 text-muted-foreground">
        A private desk for drafts, case studies, and the things that should not get lost. It is not
        part of the public site.
      </p>
      {error ? (
        <p role="alert" className="mt-6 border-l-2 border-destructive py-1 pl-3 font-serif text-base leading-7">
          {error}
        </p>
      ) : null}
      {gaps.length > 0 ? (
        <div className="mt-6">
          <p className="font-sans text-sm font-semibold">Sign-in is waiting on configuration.</p>
          <ul className="mt-2 list-disc pl-5 font-serif text-base leading-7">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : (
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: callback });
          }}
        >
          <button type="submit" className={button}>
            Continue with GitHub
          </button>
        </form>
      )}
    </main>
  );
}
