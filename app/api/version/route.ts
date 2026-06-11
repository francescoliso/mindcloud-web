// Returns the current deployment identifier so clients can detect when a
// new version has shipped and reload themselves. Route handlers aren't
// cached by default in Next 16; force-dynamic keeps it that way explicitly.
export const dynamic = "force-dynamic";

export function GET() {
  const id =
    process.env.VERCEL_DEPLOYMENT_ID ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    "dev";

  return Response.json(
    { id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
