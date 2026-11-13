/**
 * Which commit is live. Deployment checks read this instead of asking
 * someone to look at the Vercel dashboard: after a push to main, the
 * value here should become that commit's SHA.
 */
export const dynamic = "force-static";

export function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
  const env = process.env.VERCEL_ENV ?? "development";

  return new Response(`${sha} ${env}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
