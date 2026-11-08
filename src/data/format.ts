import { getCodeLang } from "../codeLang";
import { CODE_LANG_META, pickSample, type CodeLang } from "./codeSamples";
import type { Question } from "./types";

/** 纯文本答案。多语言示例只输出当前选中的语言。 */
export function answerToText(q: Question, lang: CodeLang = getCodeLang()): string {
  const lines: string[] = [q.title, "", q.prompt, ""];
  for (const part of q.parts) {
    if (part.type === "h") lines.push(part.text, "");
    else if (part.type === "p") lines.push(part.text, "");
    else if (part.type === "list") {
      lines.push(...part.items.map((item) => `- ${item}`), "");
    } else if (part.type === "samples") {
      const picked = pickSample(part.samples, lang);
      if (!picked) continue;
      const meta = CODE_LANG_META[picked.lang];
      lines.push(`${meta.label} 实现`, "```" + meta.fence, picked.code, "```", "");
    } else {
      lines.push("```" + part.lang, part.code, "```", "");
    }
  }
  if (q.followUps?.length) {
    lines.push("追问", ...q.followUps.map((item) => `- ${item}`));
  }
  return lines.join("\n").trim();
}
