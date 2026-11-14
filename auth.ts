import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedLogin } from "@/lib/admin/guard";

declare module "next-auth" {
  interface Session {
    user: { login?: string } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    login?: string;
  }
}

function loginFromProfile(profile: unknown): string | null {
  if (!profile || typeof profile !== "object" || !("login" in profile)) return null;
  const login = profile.login;
  return typeof login === "string" ? login : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [GitHub({ authorization: { params: { scope: "read:user user:email" } } })],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    signIn({ profile }) {
      return isAllowedLogin(loginFromProfile(profile), process.env.ADMIN_GITHUB_LOGIN);
    },
    jwt({ token, profile }) {
      const login = loginFromProfile(profile);
      if (login) token.login = login;
      return token;
    },
    session({ session, token }) {
      session.user.login = typeof token.login === "string" ? token.login : undefined;
      return session;
    },
  },
});
