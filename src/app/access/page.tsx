import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

const ACCESS_COOKIE = "midgard_preview_access";

export const metadata: Metadata = {
  title: "Midgard Preview Access",
  description: "Password access for the Midgard preview.",
};

type AccessPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

function safePath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

async function enterPreview(formData: FormData) {
  "use server";

  const configuredPassword = process.env.MIDGARD_SITE_PASSWORD;
  const accessToken = process.env.MIDGARD_ACCESS_TOKEN;
  const password = formData.get("password");
  const nextPath = safePath(formData.get("next"));

  if (
    configuredPassword &&
    accessToken &&
    typeof password === "string" &&
    password === configuredPassword
  ) {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect(nextPath);
  }

  redirect(`/access?error=1&next=${encodeURIComponent(nextPath)}`);
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = (await searchParams) ?? {};
  const nextPath = safePath(params.next);
  const hasError = params.error === "1";

  return (
    <main className={styles.shell}>
      <section className={styles.panel} aria-labelledby="access-title">
        <p className="eyebrow">Private Preview</p>
        <h1 id="access-title">Enter Midgard</h1>
        <p className={styles.lead}>
          This preview is password protected while the public site is being
          reviewed.
        </p>
        <form action={enterPreview} className={styles.form}>
          <input type="hidden" name="next" value={nextPath} />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
          />
          {hasError ? (
            <p className={styles.error} role="alert">
              That password did not open the path.
            </p>
          ) : null}
          <button type="submit" className="btn btn--primary">
            Enter
          </button>
        </form>
      </section>
    </main>
  );
}
