import { describe, expect, it } from "vitest";
import {
  decideAccess,
  e2eAdminBypassEnabled,
  isAllowedLogin,
  previewRewrite,
} from "./guard";

describe("admin auth guard", () => {
  it("allows only the configured GitHub login", () => {
    expect(isAllowedLogin("agrisdarznieks", "agrisdarznieks")).toBe(true);
    expect(isAllowedLogin("AgrisDarznieks", "agrisdarznieks")).toBe(true);
    expect(isAllowedLogin("someone-else", "agrisdarznieks")).toBe(false);
    expect(isAllowedLogin("agrisdarznieks", undefined)).toBe(false);
    expect(isAllowedLogin("", "agrisdarznieks")).toBe(false);
    expect(isAllowedLogin(null, "agrisdarznieks")).toBe(false);
  });

  it("leaves the public site and the login screen open", () => {
    expect(decideAccess({ pathname: "/en", login: null, allowlist: "agrisdarznieks" }).kind).toBe(
      "public",
    );
    expect(
      decideAccess({ pathname: "/admin/login", login: null, allowlist: "agrisdarznieks" }).kind,
    ).toBe("public");
    expect(
      decideAccess({ pathname: "/api/auth/callback/github", login: null, allowlist: "agrisdarznieks" })
        .kind,
    ).toBe("public");
  });

  it("redirects anonymous desk requests and rejects anonymous API calls", () => {
    const page = decideAccess({ pathname: "/admin", login: null, allowlist: "agrisdarznieks" });
    expect(page).toEqual({
      kind: "redirect",
      to: "/admin/login?callbackUrl=%2Fadmin",
    });
    const api = decideAccess({
      pathname: "/api/admin/revalidate",
      login: null,
      allowlist: "agrisdarznieks",
    });
    expect(api.kind).toBe("unauthorized");
  });

  it("rejects a signed-in GitHub user who is not on the allowlist", () => {
    const access = decideAccess({
      pathname: "/admin/integrity",
      login: "octocat",
      allowlist: "agrisdarznieks",
    });
    expect(access.kind).toBe("redirect");
  });

  it("allows the listed login through the desk and the admin API", () => {
    expect(
      decideAccess({ pathname: "/admin/studio", login: "agrisdarznieks", allowlist: "agrisdarznieks" })
        .kind,
    ).toBe("allow");
    expect(
      decideAccess({
        pathname: "/api/admin/revalidate",
        login: "agrisdarznieks",
        allowlist: "agrisdarznieks",
      }).kind,
    ).toBe("allow");
  });

  it("does not enable the test session on Vercel", () => {
    expect(
      e2eAdminBypassEnabled({
        ADMIN_E2E: "1",
        ADMIN_E2E_TOKEN: "local-e2e-token-not-for-vercel-01",
        VERCEL: "1",
      }),
    ).toBe(false);
    expect(
      e2eAdminBypassEnabled({
        ADMIN_E2E: "1",
        ADMIN_E2E_TOKEN: "local-e2e-token-not-for-vercel-01",
        VERCEL_ENV: "preview",
      }),
    ).toBe(false);
    expect(
      e2eAdminBypassEnabled({
        ADMIN_E2E: "1",
        ADMIN_E2E_TOKEN: "short",
      }),
    ).toBe(false);
    expect(
      e2eAdminBypassEnabled({
        ADMIN_E2E: "1",
        ADMIN_E2E_TOKEN: "local-e2e-token-not-for-vercel-01",
      }),
    ).toBe(true);
  });

  it("rewrites only article and case-study paths", () => {
    expect(previewRewrite("/en/writing/sample-note")).toBe("/en/preview/writing/sample-note");
    expect(previewRewrite("/lv/work/laaa")).toBe("/lv/preview/work/laaa");
    expect(previewRewrite("/en")).toBeNull();
    expect(previewRewrite("/admin")).toBeNull();
    expect(previewRewrite("/en/writing")).toBeNull();
  });
});
