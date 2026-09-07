/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If no secret is configured, fail open only in development
    if (process.env.NODE_ENV === "development") return true;
    return false;
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
