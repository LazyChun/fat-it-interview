/*
 * fat-it-interview — FatNotes IT 面试题库
 *
 * 布局与 fat-tools 相同，对齐 fat-notes-core 的插件贡献点：
 *   - 活动栏图标 → 主侧边栏 + 工作台整页
 *   - 主侧边栏只放分类和搜索
 *   - 工作台按 sdk.router 渲染总览或题目
 * 题库和算法演示都在前端完成，不启用 Python 后端。
 */
import React from "react";
import type { Disposable, FatNotesPluginSDK } from "fat-notes-sdk";
import AlgoBlock from "./blocks/AlgoBlock";
import DailyQuestionBlock from "./blocks/DailyQuestionBlock";
import { CATEGORIES, CATEGORY_TREE, getCategory } from "./data/categories";
import { QUESTIONS, getQuestion, topicOf } from "./data/questions";
import { ACTIVITY_ICON, ACTIVITY_ID, ALGO_BLOCK_ICON, DAILY_BLOCK_ICON } from "./ids";
import { categoryIconComponent } from "./icons";
import MenuView from "./MenuView";
import { getProgress } from "./progress";
import { categoryPath, homePath, parseRoute, questionPath } from "./routes";
import WorkPageView from "./WorkPageView";

const disposables: Disposable[] = [];

function safeRegister(label: string, fn: () => Disposable | undefined | null): void {
  try {
    const disposable = fn();
    if (disposable) disposables.push(disposable);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[fat-it-interview] 注册「${label}」失败：`, error);
  }
}

export async function activate(sdk: FatNotesPluginSDK): Promise<void> {
  safeRegister("activityBar", () =>
    sdk.contributions.registerActivityBarItem({
      id: ACTIVITY_ID,
      title: "IT 面试",
      icon: ACTIVITY_ICON,
      pluginName: "fat-it-interview",
    }),
  );

  safeRegister("primarySidebar", () =>
    sdk.contributions.registerPrimarySidebar(() =>
      React.createElement(MenuView, { sdk }),
    ),
  );

  safeRegister("workbenchPage", () =>
    sdk.contributions.registerWorkbenchPage({
      id: ACTIVITY_ID,
      render: () => React.createElement(WorkPageView, { sdk }),
    }),
  );

  safeRegister("route:home", () =>
    sdk.contributions.registerRoutePage({
      path: homePath(),
      title: "IT 面试题库",
      render: () => null,
    }),
  );

  for (const category of CATEGORY_TREE) {
    safeRegister(`route:${category.id}`, () =>
      sdk.contributions.registerRoutePage({
        path: categoryPath(category.id),
        title: category.title,
        render: () => null,
      }),
    );
  }

  for (const question of QUESTIONS) {
    safeRegister(`route:${question.id}`, () =>
      sdk.contributions.registerRoutePage({
        path: questionPath(question.id),
        title: question.title,
        render: () => null,
      }),
    );
  }

  safeRegister("searchProvider", () =>
    sdk.contributions.registerSearchProvider({
      id: "fat-it-interview.search",
      name: "IT 面试题库",
      items: QUESTIONS.map((question) => {
        const category = CATEGORIES.find((item) => item.id === question.category);
        const topic = getCategory(topicOf(question));
        return {
          id: question.id,
          title: question.title,
          desc: question.prompt,
          icon: categoryIconComponent(question.category),
          keywords: [
            question.category,
            category?.title ?? "",
            topic?.title ?? "",
            question.difficulty,
            ...question.tags,
          ],
          tag: "面试题",
          activityId: ACTIVITY_ID,
          onSelect: () => {
            sdk.router.navigate(questionPath(question.id));
          },
        };
      }),
    }),
  );

  safeRegister("command:ping", () =>
    sdk.commands.register("fat-it-interview.ping", async () => {
      sdk.ui.toast.info(
        `[fat-it-interview] pong（宿主 ${sdk.host.version}，题目 ${QUESTIONS.length}）`,
      );
      return "pong";
    }),
  );

  safeRegister("command:openQuestion", () =>
    sdk.commands.register("fat-it-interview.openQuestion", async (id: unknown) => {
      const questionId = typeof id === "string" ? id : "";
      if (!getQuestion(questionId)) {
        sdk.ui.toast.warn(`[fat-it-interview] 未知题目：${questionId}`);
        return false;
      }
      sdk.router.navigate(questionPath(questionId));
      return true;
    }),
  );

  safeRegister("settingsPage", () =>
    sdk.contributions.registerSettingsPage({
      id: "fat-it-interview.settings",
      title: "IT 面试题库",
      render: () =>
        React.createElement(
          "div",
          { style: { padding: 20, maxWidth: 640, lineHeight: 1.7 } },
          React.createElement("h3", { style: { marginTop: 0 } }, "IT 面试题库"),
          React.createElement(
            "p",
            null,
            `内置 ${QUESTIONS.length} 道题，分为 ${CATEGORIES.map((item) => item.title).join("、")}。算法题带逐步演示。`,
          ),
          React.createElement(
            "p",
            null,
            "练习模式默认先隐藏答案。掌握和复习记录保存在本机浏览器存储里，不会上传。",
          ),
          React.createElement(
            "p",
            null,
            "命令 fat-it-interview.openQuestion 可以按题目 id 打开对应的题。",
          ),
        ),
    }),
  );

  safeRegister("block:daily", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.daily",
      title: "今日面试题",
      iconUrl: DAILY_BLOCK_ICON,
      category: "other",
      index: 20,
      defaultSize: { w: 4, h: 12, minW: 3, minH: 8 },
      dataConfig: false,
      render: () => React.createElement(DailyQuestionBlock, { sdk }),
    }),
  );

  safeRegister("block:algo", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.algo",
      title: "算法演示",
      iconUrl: ALGO_BLOCK_ICON,
      category: "other",
      index: 21,
      defaultSize: { w: 6, h: 16, minW: 4, minH: 10 },
      dataConfig: false,
      render: () => React.createElement(AlgoBlock, { sdk }),
    }),
  );

  const activityKey = `bespoke:${ACTIVITY_ID}`;
  const selectActivityMenuKey = (state: unknown): string | undefined => {
    if (state && typeof state === "object") {
      const frame = (state as { frame?: unknown }).frame;
      if (frame && typeof frame === "object") {
        const key = (frame as { activityMenuKey?: unknown }).activityMenuKey;
        if (typeof key === "string") return key;
      }
    }
    return undefined;
  };

  let hideSecondary: Disposable | null = null;
  let hidePanel: Disposable | null = null;
  const syncHide = (activeKey: string | undefined): void => {
    const shouldHide = activeKey === activityKey;
    if (shouldHide) {
      if (!hideSecondary && typeof sdk.contributions.registerHideSecondarySidebar === "function") {
        hideSecondary = sdk.contributions.registerHideSecondarySidebar();
      }
      if (!hidePanel && typeof sdk.contributions.registerHidePanel === "function") {
        hidePanel = sdk.contributions.registerHidePanel();
      }
    } else {
      hideSecondary?.dispose();
      hideSecondary = null;
      hidePanel?.dispose();
      hidePanel = null;
    }
  };

  try {
    syncHide(sdk.store.select(selectActivityMenuKey));
    disposables.push(
      sdk.store.subscribe(selectActivityMenuKey, (nextKey) => syncHide(nextKey)),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("[fat-it-interview] 注册布局联动失败：", error);
  }
  disposables.push({
    dispose() {
      hideSecondary?.dispose();
      hideSecondary = null;
      hidePanel?.dispose();
      hidePanel = null;
    },
  });

  try {
    if (parseRoute(sdk.router.getCurrent().path).kind === "foreign") {
      const last = getProgress().lastQuestionId;
      const landing = last && getQuestion(last) ? questionPath(last) : homePath();
      sdk.router.navigate(landing);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("[fat-it-interview] 初始化路由失败：", error);
  }
}

export function deactivate(): void {
  while (disposables.length) {
    try {
      disposables.pop()?.dispose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[fat-it-interview] dispose error", error);
    }
  }
}
