import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const apis = await db.smsApi.findMany({ where: { isActive: true } });

    let ejoinApi = null;
    let ejoinConfig = null;

    for (const api of apis) {
      try {
        const payload = JSON.parse(api.payload);
        if (payload.isEjoin) {
          ejoinApi = api;
          ejoinConfig = payload;
          break;
        }
      } catch (e) {}
    }

    if (!ejoinApi) {
      return NextResponse.json({ status: "not_configured", balance: "0.00" });
    }

    const baseUrl = ejoinApi.url.endsWith('/') ? ejoinApi.url.slice(0, -1) : ejoinApi.url;
    const cleanUrl = baseUrl.endsWith('sendsms') ? baseUrl.replace('/sendsms', '') : baseUrl;
    const balanceUrl = `${cleanUrl}/getbalance?account=${ejoinConfig.account}&password=${ejoinConfig.password}`;

    const res = await fetch(balanceUrl, { method: "GET" });
    const data = await res.json();

    if (data.status === 0) {
      return NextResponse.json({ status: "success", balance: data.balance || "0.00" });
    } else {
      return NextResponse.json({ status: "error", balance: "Error" });
    }
  } catch (error) {
    return NextResponse.json({ status: "error", balance: "Offline" });
  }
}