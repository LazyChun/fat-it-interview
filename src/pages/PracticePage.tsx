import React, { useEffect, useMemo, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Button, Empty, Input, Segmented, Switch, Tag } from "antd";
import AlgoPlayer from "../components/AlgoPlayer";
import AnswerView from "../components/AnswerView";
import { getCategory, parentOf } from "../data/categories";
import { answerToText } from "../data/format";
import { getQuestion, neighbors, questionsForNode } from "../data/questions";
import { DIFFICULTY_META, type Difficulty } from "../data/types";
import { useTick } from "../hooks";
import {
  getProgress,
  isMastered,
  isReview,
  rememberQuestion,
  setPracticeMode,
  toggleMastered,
  toggleReview,
} from "../progress";
import { categoryPath, homePath, scopedQuestionPath } from "../routes";

interface Props {
  sdk: FatNotesPluginSDK;
  categoryId: string;
  questionId?: string;
}

const PracticePage: React.FC<Props> = ({ sdk, categoryId, questionId }) => {
  const tick = useTick();
  const category = getCategory(categoryId);
  const question = questionId ? getQuestion(questionId) : null;
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const practiceMode = getProgress().practiceMode;

  useEffect(() => {
    if (question) rememberQuestion(question.id);
  }, [question]);

  useEffect(() => {
    setShown(false);
  }, [questionId]);

  useEffect(() => {
    if (questionId || !category) return;
    const first = questionsForNode(category.id)[0];
    if (first) sdk.router.replace(scopedQuestionPath(category.id, first.id));
  }, [questionId, category, sdk]);

  const list = useMemo(() => {
    const source = questionsForNode(categoryId);
    const q = keyword.trim().toLowerCase();
    return source.filter((item) => {
      if (level !== "all" && item.difficulty !== level) return false;
      if (onlyOpen && isMastered(item.id)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [categoryId, keyword, level, onlyOpen, tick]);

  if (!category) {
    return <Empty description="没有这个分类" />;
  }

  const visible = shown || !practiceMode;
  const around = question ? neighbors(question.id, category.id) : { prev: null, next: null };
  const parent = parentOf(category.id);

  const copyAnswer = async () => {
    if (!question) return;
    try {
      await navigator.clipboard.writeText(answerToText(question));
      sdk.ui.toast.success("已复制答案");
    } catch {
      sdk.ui.toast.error("复制失败");
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", minHeight: "100%" }}>
      <div style={{ width: 280, flex: "1 1 240px", maxWidth: 340, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <b>{category.title}</b>
          <Button size="small" type="link" onClick={() => sdk.router.navigate(homePath())}>
            总览
          </Button>
        </div>
        <Input
          allowClear
          size="small"
          value={keyword}
          placeholder="在本类中搜索"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Segmented
          size="small"
          value={level}
          onChange={(value) => setLevel(value as Difficulty | "all")}
          options={[
            { label: "全部", value: "all" },
            { label: "简单", value: "easy" },
            { label: "中等", value: "medium" },
            { label: "困难", value: "hard" },
          ]}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <Switch size="small" checked={onlyOpen} onChange={setOnlyOpen} />
          只看未掌握
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {list.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的题目" />
          ) : (
            list.map((item) => {
              const active = item.id === question?.id;
              const meta = DIFFICULTY_META[item.difficulty];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => sdk.router.navigate(scopedQuestionPath(category.id, item.id))}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${active ? "rgba(22,119,255,0.65)" : "rgba(128,128,128,0.25)"}`,
                    background: active ? "rgba(22,119,255,0.08)" : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ flex: 1 }}>{item.title}</span>
                    {isMastered(item.id) ? <span style={{ color: "#52c41a" }}>✓</span> : null}
                  </div>
                  <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
                    <Tag color={meta.color} style={{ margin: 0 }}>
                      {meta.label}
                    </Tag>
                    {item.demoId ? <Tag style={{ margin: 0 }}>演示</Tag> : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div style={{ flex: "3 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {!question ? (
          <Empty description="从左侧选一道题" />
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {parent ? (
                <Button size="small" onClick={() => sdk.router.navigate(categoryPath(parent.id))}>
                  {parent.title}
                </Button>
              ) : null}
              <Button size="small" type={parent ? "primary" : "default"} onClick={() => sdk.router.navigate(categoryPath(category.id))}>
                {category.title}
              </Button>
              <Tag color={DIFFICULTY_META[question.difficulty].color}>
                {DIFFICULTY_META[question.difficulty].label}
              </Tag>
              {question.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              <span style={{ flex: 1 }} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                练习模式
                <Switch
                  size="small"
                  checked={practiceMode}
                  onChange={(checked) => setPracticeMode(checked)}
                />
              </label>
            </div>
            <div style={{ fontSize: 18, fontWeight: 650 }}>{question.title}</div>
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "rgba(22,119,255,0.06)",
                lineHeight: 1.7,
              }}
            >
              {question.prompt}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                type={isMastered(question.id) ? "primary" : "default"}
                onClick={() => toggleMastered(question.id)}
              >
                {isMastered(question.id) ? "已掌握" : "标为已掌握"}
              </Button>
              <Button onClick={() => toggleReview(question.id)}>
                {isReview(question.id) ? "移出复习" : "加入复习"}
              </Button>
              {visible ? <Button onClick={copyAnswer}>复制答案</Button> : null}
            </div>
            {visible ? (
              <AnswerView parts={question.parts} />
            ) : (
              <Button type="primary" onClick={() => setShown(true)}>
                查看参考答案
              </Button>
            )}
            {visible && shown && practiceMode ? (
              <Button type="link" onClick={() => setShown(false)} style={{ alignSelf: "flex-start", padding: 0 }}>
                先把答案藏起来
              </Button>
            ) : null}
            {visible && question.followUps?.length ? (
              <div>
                <div style={{ fontWeight: 650, marginBottom: 6 }}>追问</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {question.followUps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {visible && question.demoId ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(128,128,128,0.28)",
                }}
              >
                <AlgoPlayer demoId={question.demoId} />
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <Button
                disabled={!around.prev}
                onClick={() => around.prev && sdk.router.navigate(scopedQuestionPath(category.id, around.prev.id))}
              >
                {around.prev ? `上一题：${around.prev.title}` : "上一题"}
              </Button>
              <Button
                disabled={!around.next}
                onClick={() => around.next && sdk.router.navigate(scopedQuestionPath(category.id, around.next.id))}
              >
                {around.next ? `下一题：${around.next.title}` : "下一题"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
