import React, { useMemo, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Button, Tag } from "antd";
import AnswerView from "../components/AnswerView";
import { getCategory } from "../data/categories";
import { dailyQuestion } from "../data/questions";
import { DIFFICULTY_META } from "../data/types";
import { questionPath } from "../routes";
import ThemeShell from "../ThemeShell";

const DailyQuestionBlock: React.FC<{ sdk: FatNotesPluginSDK }> = ({ sdk }) => {
  const question = useMemo(() => dailyQuestion(), []);
  const [open, setOpen] = useState(false);
  const category = getCategory(question.category);
  const meta = DIFFICULTY_META[question.difficulty];
  return (
    <ThemeShell sdk={sdk} padding={12}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
        <div style={{ fontSize: 12, opacity: 0.65 }}>今日一题 · {category?.title}</div>
        <div style={{ fontWeight: 650 }}>{question.title}</div>
        <div>
          <Tag color={meta.color}>{meta.label}</Tag>
        </div>
        <div style={{ lineHeight: 1.6 }}>{question.prompt}</div>
        {open ? <AnswerView parts={question.parts.slice(0, 2)} /> : null}
        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          <Button size="small" onClick={() => setOpen((value) => !value)}>
            {open ? "收起答案" : "看答案"}
          </Button>
          <Button size="small" type="primary" onClick={() => sdk.router.navigate(questionPath(question.id))}>
            在题库中打开
          </Button>
        </div>
      </div>
    </ThemeShell>
  );
};

export default DailyQuestionBlock;
