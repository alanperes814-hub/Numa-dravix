export const config = {
  matcher: ["/((?!access\.html|favicon\.ico).*)"],
};

const PURCHASE_ENDPOINT = "https://dravix-member-portal.vercel.app/api/check-purchase";

export default async function middleware(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)numa_access_email=([^;]+)/);
  const email = match ? decodeURIComponent(match[1]) : "";

  if (!email) {
    return Response.redirect(new URL("/access.html", request.url));
  }

  try {
    const response = await fetch(PURCHASE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    if (response.ok && data?.entitled === true) {
      return undefined;
    }
  } catch (error) {
    console.error("Numa purchase gate error:", error);
  }

  const url = new URL("/access.html", request.url);
  url.searchParams.set("reason", "expired");
  const redirect = Response.redirect(url);
  redirect.headers.append("Set-Cookie", "numa_access_email=; Path=/; Max-Age=0; SameSite=Lax; Secure");
  return redirect;
}
