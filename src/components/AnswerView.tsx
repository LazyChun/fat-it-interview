import React from "react";
import type { AnswerPart } from "../data/types";

const inlineCode: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  padding: "0 4px",
  borderRadius: 4,
  background: "rgba(128,128,128,0.16)",
};

function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={index} style={inlineCode}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

const AnswerView: React.FC<{ parts: AnswerPart[] }> = ({ parts }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((part, index) => {
        if (part.type === "h") {
          return (
            <div key={index} style={{ fontWeight: 650, marginTop: 4 }}>
              {part.text}
            </div>
          );
        }
        if (part.type === "p") {
          return (
            <p key={index} style={{ margin: 0, lineHeight: 1.7 }}>
              <Rich text={part.text} />
            </p>
          );
        }
        if (part.type === "list") {
          return (
            <ul key={index} style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              {part.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item}`}>
                  <Rich text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <pre
            key={index}
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              background: "rgba(128,128,128,0.12)",
              border: "1px solid rgba(128,128,128,0.22)",
              fontSize: 12,
              lineHeight: 1.6,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            }}
          >
            <code>{part.code}</code>
          </pre>
        );
      })}
    </div>
  );
};

export default AnswerView;
