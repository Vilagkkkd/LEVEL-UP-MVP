import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");
  params.delete("signature");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  try {
    const a = Buffer.from(calculated, "hex");
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Server is not configured" }, { status: 503 });
  const body = await req.json().catch(() => null) as { initData?: string } | null;
  if (!body?.initData || !verifyTelegramInitData(body.initData, token)) {
    return NextResponse.json({ error: "Invalid Telegram initData" }, { status: 401 });
  }
  const params = new URLSearchParams(body.initData);
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > 3600) {
    return NextResponse.json({ error: "Expired Telegram initData" }, { status: 401 });
  }
  const userRaw = params.get("user");
  if (!userRaw) return NextResponse.json({ error: "Telegram user missing" }, { status: 401 });
  const user = JSON.parse(userRaw);
  return NextResponse.json({ ok: true, user: { id: user.id, first_name: user.first_name, username: user.username } });
}
