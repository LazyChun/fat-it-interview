import type { Question } from "./types";

export function answerToText(q: Question): string {
  const lines: string[] = [q.title, "", q.prompt, ""];
  for (const part of q.parts) {
    if (part.type === "h") lines.push(part.text, "");
    else if (part.type === "p") lines.push(part.text, "");
    else if (part.type === "list") {
      lines.push(...part.items.map((item) => `- ${item}`), "");
    } else {
      lines.push("```" + part.lang, part.code, "```", "");
    }
  }
  if (q.followUps?.length) {
    lines.push("追问", ...q.followUps.map((item) => `- ${item}`));
  }
  return lines.join("\n").trim();
}
