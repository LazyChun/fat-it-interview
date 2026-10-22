import React, { useId } from "react";
import { BAR_COLOR } from "../algo/types";
import type {
  ArrayFrame,
  BarFrame,
  DemoFrame,
  GridFrame,
  ListFrame,
  MatrixFrame,
  TreeFrame,
} from "../algo/types";

const stage: React.CSSProperties = {
  border: "1px solid rgba(128,128,128,0.28)",
  borderRadius: 10,
  background: "rgba(128,128,128,0.06)",
  padding: 12,
  overflow: "auto",
};

export const FrameView: React.FC<{ frame: DemoFrame }> = ({ frame }) => {
  if (frame.kind === "bars") return <Bars frame={frame} />;
  if (frame.kind === "array") return <ArrayRow frame={frame} />;
  if (frame.kind === "grid") return <Grid frame={frame} />;
  if (frame.kind === "list") return <Linked frame={frame} />;
  if (frame.kind === "matrix") return <Matrix frame={frame} />;
  return <Tree frame={frame} />;
};

const Bars: React.FC<{ frame: BarFrame }> = ({ frame }) => {
  const min = Math.min(...frame.values);
  const max = Math.max(...frame.values);
  const span = Math.max(1, max - min);
  return (
    <div style={{ ...stage, display: "flex", alignItems: "flex-end", gap: 8, height: 210 }}>
      {frame.values.map((value, index) => {
        const role = frame.roles[index] ?? "default";
        const height = ((value - min) / span) * 140 + 18;
        return (
          <div key={index} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div
              style={{
                height,
                borderRadius: 6,
                background: BAR_COLOR[role],
                transition: "height 0.2s ease, background 0.2s ease",
              }}
            />
            <div style={{ marginTop: 6, fontSize: 12 }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
};

const ArrayRow: React.FC<{ frame: ArrayFrame }> = ({ frame }) => {
  const labels = new Map<number, { text: string; color: string }>();
  frame.pointers.forEach((pointer) => {
    const prev = labels.get(pointer.index);
    labels.set(pointer.index, {
      text: prev ? `${prev.text}/${pointer.label}` : pointer.label,
      color: prev?.color ?? pointer.color,
    });
  });
  return (
    <div style={{ ...stage, display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 28 }}>
      {frame.values.map((value, index) => {
        const label = labels.get(index);
        const mark = frame.marks?.[index];
        const border =
          mark === "hit" ? "#52c41a" : mark === "window" ? "#1677ff" : "rgba(128,128,128,0.35)";
        return (
          <div key={index} style={{ position: "relative", minWidth: 42, textAlign: "center" }}>
            {label ? (
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  left: 0,
                  right: 0,
                  fontSize: 11,
                  color: label.color,
                  fontWeight: 600,
                }}
              >
                {label.text}
              </div>
            ) : null}
            <div
              style={{
                height: 40,
                lineHeight: "40px",
                borderRadius: 8,
                border: `2px solid ${border}`,
                background: mark === "hit" ? "rgba(82,196,26,0.15)" : "transparent",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 11, opacity: 0.55 }}>{index}</div>
          </div>
        );
      })}
    </div>
  );
};

const Grid: React.FC<{ frame: GridFrame }> = ({ frame }) => {
  const color: Record<string, string> = {
    idle: "#e8e8e8",
    frontier: "#faad14",
    visited: "#91caff",
    path: "#722ed1",
  };
  return (
    <div
      style={{
        ...stage,
        display: "grid",
        gridTemplateColumns: `repeat(${frame.cols}, 36px)`,
        gap: 4,
        width: "fit-content",
      }}
    >
      {frame.cells.map((cell) => {
        const bg = cell.wall ? "#3a3a3a" : color[cell.state];
        const label = cell.start ? "S" : cell.end ? "E" : "";
        const darkLabel = cell.wall || cell.state === "path";
        return (
          <div
            key={`${cell.r}-${cell.c}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: bg,
              color: darkLabel ? "#fff" : "#1f1f1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

const Linked: React.FC<{ frame: ListFrame }> = ({ frame }) => {
  const markerId = `arrow-${useId().replace(/:/g, "")}`;
  const width = Math.max(frame.nodes.length * 84, 160);
  const indexOf = new Map(frame.nodes.map((node, index) => [node.id, index]));
  const roleColor: Record<string, string> = {
    prev: "#fa8c16",
    curr: "#1677ff",
    next: "#722ed1",
    slow: "#13c2c2",
    fast: "#eb2f96",
    meet: "#52c41a",
  };
  return (
    <div style={stage}>
      <svg width="100%" viewBox={`0 0 ${width} 120`} style={{ maxWidth: width }}>
        {frame.nodes.map((node) => {
          if (!node.next) return null;
          const from = indexOf.get(node.id) ?? 0;
          const to = indexOf.get(node.next) ?? 0;
          const x1 = from * 84 + 28;
          const x2 = to * 84 + 28;
          const backward = to <= from;
          const d = backward
            ? `M ${x1} 48 Q ${(x1 + x2) / 2} 8 ${x2} 48`
            : `M ${x1 + 18} 58 L ${x2 - 22} 58`;
          return (
            <path
              key={`${node.id}-${node.next}`}
              d={d}
              fill="none"
              stroke="rgba(128,128,128,0.8)"
              strokeWidth="1.6"
              markerEnd={`url(#${markerId})`}
            />
          );
        })}
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(128,128,128,0.8)" />
          </marker>
        </defs>
        {frame.nodes.map((node, index) => {
          const role = frame.roles[node.id];
          const x = index * 84 + 8;
          const fill = role ? roleColor[role] : "#d9d9d9";
          const ink = role ? "#fff" : "#1f1f1f";
          return (
            <g key={node.id}>
              {role ? (
                <text x={x + 20} y="28" textAnchor="middle" fontSize="11" fill={roleColor[role]}>
                  {role}
                </text>
              ) : null}
              <rect x={x} y="40" width="40" height="36" rx="8" fill={fill} />
              <text x={x + 20} y="63" textAnchor="middle" fontSize="14" fill={ink}>
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Matrix: React.FC<{ frame: MatrixFrame }> = ({ frame }) => {
  const [ar, ac] = frame.active ?? [-1, -1];
  return (
    <div style={{ ...stage, overflow: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={cellStyle} />
            {frame.colLabels.map((label) => (
              <th key={label} style={cellStyle}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {frame.cells.map((row, r) => (
            <tr key={frame.rowLabels[r] ?? r}>
              <th style={{ ...cellStyle, textAlign: "left", whiteSpace: "nowrap" }}>
                {frame.rowLabels[r]}
              </th>
              {row.map((value, c) => {
                const active = r === ar && c === ac;
                return (
                  <td
                    key={c}
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      background: active ? "rgba(22,119,255,0.18)" : "transparent",
                      borderColor: active ? "#1677ff" : "rgba(128,128,128,0.35)",
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(128,128,128,0.35)",
  padding: "4px 8px",
  fontWeight: 500,
};

const Tree: React.FC<{ frame: TreeFrame }> = ({ frame }) => {
  const byId = new Map(frame.nodes.map((node) => [node.id, node]));
  const pos = new Map<string, { x: number; y: number }>();
  let cursor = 0;
  const walk = (id: string | undefined, depth: number) => {
    if (!id || !byId.has(id)) return;
    const node = byId.get(id);
    if (!node) return;
    walk(node.left, depth + 1);
    pos.set(id, { x: cursor, y: depth });
    cursor += 1;
    walk(node.right, depth + 1);
  };
  walk(frame.root, 0);
  const width = Math.max(cursor * 72, 200);
  const roleColor: Record<string, string> = {
    stack: "#1677ff",
    queue: "#fa8c16",
    visit: "#722ed1",
    done: "#52c41a",
  };
  return (
    <div style={stage}>
      <svg width="100%" viewBox={`0 0 ${width} 230`} style={{ maxWidth: width }}>
        {frame.nodes.map((node) => {
          const from = pos.get(node.id);
          if (!from) return null;
          return [node.left, node.right].map((child) => {
            if (!child) return null;
            const to = pos.get(child);
            if (!to) return null;
            return (
              <line
                key={`${node.id}-${child}`}
                x1={from.x * 72 + 36}
                y1={from.y * 58 + 28}
                x2={to.x * 72 + 36}
                y2={to.y * 58 + 28}
                stroke="rgba(128,128,128,0.7)"
              />
            );
          });
        })}
        {frame.nodes.map((node) => {
          const at = pos.get(node.id);
          if (!at) return null;
          const role = frame.roles[node.id];
          const cx = at.x * 72 + 36;
          const cy = at.y * 58 + 28;
          const fill = role ? roleColor[role] : "#d9d9d9";
          return (
            <g key={node.id}>
              <circle cx={cx} cy={cy} r="16" fill={fill} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fill={role ? "#fff" : "#1f1f1f"}>
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 12, opacity: 0.8 }}>输出：{frame.output.join("，") || "（空）"}</div>
    </div>
  );
};

export const LEGEND: Record<DemoFrame["kind"], Array<{ color: string; label: string }>> = {
  bars: [
    { color: BAR_COLOR.default, label: "未处理" },
    { color: BAR_COLOR.compare, label: "比较" },
    { color: BAR_COLOR.swap, label: "交换" },
    { color: BAR_COLOR.pivot, label: "枢轴" },
    { color: BAR_COLOR.sorted, label: "已就位" },
    { color: BAR_COLOR.active, label: "关注" },
    { color: BAR_COLOR.range, label: "当前区间" },
  ],
  array: [
    { color: "#1677ff", label: "左 / lo" },
    { color: "#722ed1", label: "mid" },
    { color: "#fa8c16", label: "右 / hi" },
    { color: "#52c41a", label: "命中" },
  ],
  grid: [
    { color: "#faad14", label: "待扩展" },
    { color: "#91caff", label: "已出队" },
    { color: "#722ed1", label: "最短路径" },
    { color: "#3a3a3a", label: "墙" },
  ],
  list: [
    { color: "#fa8c16", label: "prev" },
    { color: "#1677ff", label: "curr" },
    { color: "#722ed1", label: "next" },
    { color: "#13c2c2", label: "slow" },
    { color: "#eb2f96", label: "fast" },
    { color: "#52c41a", label: "meet" },
  ],
  matrix: [{ color: "#1677ff", label: "正在填写的格子" }],
  tree: [
    { color: "#1677ff", label: "在栈里" },
    { color: "#fa8c16", label: "在队列里" },
    { color: "#722ed1", label: "正在访问" },
    { color: "#52c41a", label: "已访问" },
  ],
};
