import { piDecimalDigits } from "@/lib/pi";
import { MAX_SYLLABLES } from "@/lib/codex";

export const runtime = "nodejs";
export const dynamic = "force-static";

/** Build-time cached archive, exact digits of pi after the decimal point. */
export async function GET() {
  return new Response(piDecimalDigits(MAX_SYLLABLES * 2), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
