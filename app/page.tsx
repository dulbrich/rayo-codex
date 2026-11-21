import CodexReader from "@/components/CodexReader";
import { MAX_SYLLABLES } from "@/lib/codex";
import { piDecimalDigits } from "@/lib/pi";

export const dynamic = "force-static";

export default function Page() {
  return <CodexReader digits={piDecimalDigits(MAX_SYLLABLES * 2)} />;
}
