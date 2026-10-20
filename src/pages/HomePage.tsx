import React, { useMemo } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Button, Tag } from "antd";
import { CATEGORIES } from "../data/categories";
import { QUESTIONS, dailyQuestion, questionsByCategory } from "../data/questions";
import { DIFFICULTY_META } from "../data/types";
import { useTick } from "../hooks";
import { CategoryIcon } from "../icons";
import { getProgress } from "../progress";
import { categoryPath, questionPath } from "../routes";
import { DEMOS } from "../algo/registry";

interface Props {
  sdk: FatNotesPluginSDK;
}

const HomePage: React.FC<Props> = ({ sdk }) => {
  const tick = useTick();
  const progress = getProgress();
  const mastered = new Set(progress.mastered);
  const last = progress.lastQuestionId
    ? QUESTIONS.find((item) => item.id === progress.lastQuestionId)
    : undefined;
  const review = useMemo(
    () => QUESTIONS.filter((item) => progress.review.includes(item.id)).slice(0, 6),
    [progress.review, tick],
  );
  const today = useMemo(() => dailyQuestion(), []);

  const openQuestion = (id: string) => sdk.router.navigate(questionPath(id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1080 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 650 }}>IT 面试题库</div>
        <div style={{ opacity: 0.72, marginTop: 6, lineHeight: 1.6 }}>
          覆盖 Web 前端、Java、后端、运维、算法、数据库、网络和操作系统。先自己答，再看参考答案。
          算法题可以逐步播放。已掌握 {mastered.size} / {QUESTIONS.length}，待复习 {progress.review.length}。
          练习记录只存在这台机器上。
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button type="primary" onClick={() => openQuestion(today.id)}>
          今日一题：{today.title}
        </Button>
        {last ? (
          <Button onClick={() => openQuestion(last.id)}>继续：{last.title}</Button>
        ) : null}
        <Button
          onClick={() => {
            const pick = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
            openQuestion(pick.id);
          }}
        >
          随机一题
        </Button>
        <Button onClick={() => sdk.router.navigate(categoryPath("algorithm"))}>
          算法演示（{DEMOS.length}）
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {CATEGORIES.map((category) => {
          const list = questionsByCategory(category.id);
          const done = list.filter((item) => mastered.has(item.id)).length;
          const pct = list.length ? Math.round((done / list.length) * 100) : 0;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => sdk.router.navigate(categoryPath(category.id))}
              style={cardStyle}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <CategoryIcon id={category.id} style={{ fontSize: 18 }} />
                <b>{category.title}</b>
                <span style={{ marginLeft: "auto", opacity: 0.65 }}>{list.length}</span>
              </div>
              <div style={{ opacity: 0.7, lineHeight: 1.5, minHeight: 40 }}>{category.blurb}</div>
              <div style={{ height: 6, borderRadius: 99, background: "rgba(128,128,128,0.2)" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "#1677ff" }} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>已掌握 {done} / {list.length}</div>
            </button>
          );
        })}
      </div>

      {review.length ? (
        <div>
          <div style={{ fontWeight: 650, marginBottom: 8 }}>待复习</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {review.map((item) => (
              <Tag
                key={item.id}
                color={DIFFICULTY_META[item.difficulty].color}
                style={{ cursor: "pointer", margin: 0 }}
                onClick={() => openQuestion(item.id)}
              >
                {item.title}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(128,128,128,0.28)",
  background: "rgba(128,128,128,0.05)",
  color: "inherit",
  cursor: "pointer",
};

export default HomePage;
