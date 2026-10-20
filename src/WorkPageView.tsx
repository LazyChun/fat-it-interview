import React, { useEffect } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Empty } from "antd";
import { getQuestion, topicOf } from "./data/questions";
import { useRouteTick } from "./hooks";
import HomePage from "./pages/HomePage";
import PracticePage from "./pages/PracticePage";
import { getProgress } from "./progress";
import { homePath, parseRoute, questionPath } from "./routes";
import ThemeShell from "./ThemeShell";

interface Props {
  sdk: FatNotesPluginSDK;
}

const WorkPageView: React.FC<Props> = ({ sdk }) => {
  const tick = useRouteTick(sdk);
  const path = sdk.router.getCurrent().path;
  const route = parseRoute(path);

  useEffect(() => {
    if (parseRoute(sdk.router.getCurrent().path).kind !== "foreign") return;
    const last = getProgress().lastQuestionId;
    const landing = last && getQuestion(last) ? questionPath(last) : homePath();
    sdk.router.navigate(landing);
  }, [sdk, path, tick]);

  if (route.kind === "foreign") {
    return (
      <ThemeShell sdk={sdk} padding={24}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="正在打开面试题库…" />
      </ThemeShell>
    );
  }

  if (route.kind === "home") {
    return (
      <ThemeShell sdk={sdk} padding={16}>
        <HomePage sdk={sdk} />
      </ThemeShell>
    );
  }

  const opened = route.kind === "question" ? getQuestion(route.questionId) : null;
  const categoryId =
    route.kind === "category" ? route.categoryId : opened ? topicOf(opened) : "";
  const questionId =
    route.kind === "category"
      ? route.questionId
      : route.kind === "question"
        ? route.questionId
        : undefined;

  return (
    <ThemeShell sdk={sdk} padding={12} scroll>
      <PracticePage sdk={sdk} categoryId={categoryId} questionId={questionId} />
    </ThemeShell>
  );
};

export default WorkPageView;
