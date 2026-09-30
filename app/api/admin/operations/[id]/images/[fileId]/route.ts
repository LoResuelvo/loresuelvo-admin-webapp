import { authSession } from "@/infrastructure/auth/auth-session";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff"
};
export async function GET(_request: Request, context: {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
}): Promise<Response> {
  const { id, fileId } = await context.params;
  if (!/^(jr|sp)-[1-9][0-9]*$/.test(id) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId))
    return new Response(null, {
      status: 400,
      headers
    });
  let token: string;
  try {
    token = await authSession.getAccessToken();
  }
  catch {
    return new Response(null, {
      status: 401,
      headers
    });
  }
  if (!process.env.API_URL)
    return new Response(null, {
      status: 503,
      headers
    });
  try {
    const upstream = await fetch(`${process.env.API_URL.replace(/\/$/, "")}/admin/operations/${id}/images/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000)
    });
    if (!upstream.ok)
      return new Response(null, {
        status: [
          400,
          401,
          403,
          404
        ].includes(upstream.status) ? upstream.status : 503,
        headers
      });
    const contentType = upstream.headers.get("Content-Type")?.split(";")[0];
    if (!contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType))
      return new Response(null, {
        status: 502,
        headers
      });
    return new Response(upstream.body, { headers: {
        ...headers,
        "Content-Type": contentType
      } });
  }
  catch {
    return new Response(null, {
      status: 503,
      headers
    });
  }
}
