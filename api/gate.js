const fs = require("fs");
const path = require("path");

const PURCHASE_ENDPOINT = "https://dravix-member-portal.vercel.app/api/check-purchase";

function getCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.match(new RegExp("(?:^|;\\s*)" + name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

module.exports = async function handler(req, res) {
  const email = getCookie(req, "numa_access_email").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    res.writeHead(302, { Location: "/access.html" });
    return res.end();
  }

  try {
    const response = await fetch(PURCHASE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.entitled === true) {
      const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      return res.status(200).send(html);
    }
  } catch (error) {
    console.error("Numa purchase gate error:", error);
  }

  res.setHeader("Set-Cookie", "numa_access_email=; Path=/; Max-Age=0; SameSite=Lax; Secure");
  res.writeHead(302, { Location: "/access.html?reason=expired" });
  return res.end();
};
