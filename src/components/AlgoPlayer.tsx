import React, { useEffect, useState } from "react";
import { Button, Segmented, Slider } from "antd";
import { getDemo } from "../algo/registry";
import type { DemoFrame } from "../algo/types";
import { FrameView, LEGEND } from "./visuals";

interface Props {
  demoId: string;
  compact?: boolean;
}

const AlgoPlayer: React.FC<Props> = ({ demoId, compact = false }) => {
  const demo = getDemo(demoId);
  const [draft, setDraft] = useState(demo?.defaultInput ?? "");
  const [frames, setFrames] = useState<DemoFrame[]>(() =>
    demo ? safeRun(demo.run, demo.defaultInput) : [],
  );
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!demo) return;
    setDraft(demo.defaultInput);
    try {
      setFrames(demo.run(demo.defaultInput));
      setError("");
    } catch (err) {
      setFrames([]);
      setError(err instanceof Error ? err.message : "无法开始演示");
    }
    setIndex(0);
    setPlaying(false);
  }, [demo]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= frames.length - 1 ? current : current + 1));
    }, 800 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, frames.length]);

  useEffect(() => {
    if (playing && frames.length > 0 && index >= frames.length - 1) {
      setPlaying(false);
    }
  }, [playing, index, frames.length]);

  if (!demo) {
    return <div>没有找到演示「{demoId}」。</div>;
  }

  const frame = frames[index];
  const apply = () => {
    try {
      const next = demo.run(draft);
      setFrames(next);
      setIndex(0);
      setPlaying(false);
      setError("");
    } catch (err) {
      setPlaying(false);
      setError(err instanceof Error ? err.message : "输入无法演示");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {compact ? null : (
        <div>
          <div style={{ fontWeight: 650, marginBottom: 4 }}>{demo.title}</div>
          <div style={{ opacity: 0.75, lineHeight: 1.6 }}>{demo.summary}</div>
        </div>
      )}
      {demo.editable ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={demo.inputHint}
            aria-label="演示输入"
            style={{
              flex: 1,
              minWidth: 180,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid rgba(128,128,128,0.45)",
              background: "transparent",
              color: "inherit",
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
            }}
          />
          <Button size="small" type="primary" onClick={apply}>
            重新演示
          </Button>
        </div>
      ) : (
        <div style={{ opacity: 0.7, fontSize: 12 }}>{demo.inputHint}</div>
      )}
      {error ? <div style={{ color: "#cf1322", fontSize: 12 }}>{error}</div> : null}
      {frame ? <FrameView frame={frame} /> : null}
      <div style={{ minHeight: 40, lineHeight: 1.55 }}>{frame?.caption}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Button size="small" disabled={index <= 0} onClick={() => { setPlaying(false); setIndex((v) => Math.max(0, v - 1)); }}>
          上一步
        </Button>
        <Button size="small" type="primary" onClick={() => setPlaying((v) => !v)} disabled={frames.length <= 1}>
          {playing ? "暂停" : "播放"}
        </Button>
        <Button
          size="small"
          disabled={index >= frames.length - 1}
          onClick={() => {
            setPlaying(false);
            setIndex((v) => Math.min(frames.length - 1, v + 1));
          }}
        >
          下一步
        </Button>
        <Button
          size="small"
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          重置
        </Button>
        <span style={{ opacity: 0.65, fontSize: 12 }}>
          {frames.length ? index + 1 : 0} / {frames.length}
        </span>
        <Segmented
          size="small"
          value={speed}
          options={[
            { label: "0.5x", value: 0.5 },
            { label: "1x", value: 1 },
            { label: "2x", value: 2 },
            { label: "4x", value: 4 },
          ]}
          onChange={(value) => setSpeed(Number(value))}
        />
      </div>
      {frames.length > 1 ? (
        <Slider
          min={0}
          max={frames.length - 1}
          value={index}
          onChange={(value) => {
            setPlaying(false);
            setIndex(value);
          }}
          tooltip={{ formatter: (value) => `第 ${Number(value) + 1} 步` }}
        />
      ) : null}
      {frame ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {LEGEND[frame.kind].map((item) => (
            <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <i style={{ width: 10, height: 10, borderRadius: 2, background: item.color, display: "inline-block" }} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

function safeRun(run: (input: string) => DemoFrame[], input: string): DemoFrame[] {
  try {
    return run(input);
  } catch {
    return [];
  }
}

export default AlgoPlayer;
