/*
 * fat-it-interview — FatNotes IT 面试题库
 *
 * 布局与 fat-tools 相同，对齐 fat-notes-core 的插件贡献点：
 *   - 活动栏图标 → 主侧边栏 + 工作台整页
 *   - 主侧边栏只放分类和搜索
 *   - 工作台按 sdk.router 渲染总览或题目
 * 题库、算法演示、React 渲染和 Vue 渲染都在前端完成，不启用 Python 后端。
 */
import React from "react";
import type { Disposable, FatNotesPluginSDK } from "fat-notes-sdk";
import AlgoBlock from "./blocks/AlgoBlock";
import DailyQuestionBlock from "./blocks/DailyQuestionBlock";
import ReactPlayBlock from "./blocks/reactPlay/ReactPlayBlock";
import ReactPlayDisplay from "./blocks/reactPlay/ReactPlayDisplay";
import { DEFAULT_REACT_PLAY, DEFAULT_REACT_SOURCE } from "./blocks/reactPlay/defaultSource";
import VuePlayBlock from "./blocks/vuePlay/VuePlayBlock";
import VuePlayDisplay from "./blocks/vuePlay/VuePlayDisplay";
import { DEFAULT_VUE_PLAY, DEFAULT_VUE_SOURCE } from "./blocks/vuePlay/defaultSource";
import { CATEGORIES, CATEGORY_TREE, getCategory } from "./data/categories";
import { QUESTIONS, getQuestion, topicOf } from "./data/questions";
import {
  ACTIVITY_ICON,
  ACTIVITY_ID,
  ALGO_BLOCK_ICON,
  DAILY_BLOCK_ICON,
  IT_INTERVIEW_BLOCK_CATEGORY,
  REACT_PLAY_BLOCK_ICON,
  VUE_PLAY_BLOCK_ICON,
} from "./ids";
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
            `内置 ${QUESTIONS.length} 道题，分为 ${CATEGORIES.map((item) => item.title).join("、")}。算法题带逐步演示。仪表盘可以添加「React 渲染」或「Vue 渲染」卡片，左边写组件，右边看页面。`,
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

  safeRegister("blockCategory:it-interview", () =>
    sdk.contributions.registerBlockCategory({
      id: IT_INTERVIEW_BLOCK_CATEGORY,
      title: "IT 面试",
      after: "plugin",
    }),
  );

  safeRegister("block:daily", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.daily",
      title: "今日面试题",
      iconUrl: DAILY_BLOCK_ICON,
      category: IT_INTERVIEW_BLOCK_CATEGORY,
      index: 20,
      defaultSize: { w: 4, h: 12, minW: 3, minH: 8 },
      dataConfig: false,
      configDoc: {
        type: "fat-it-interview.daily",
        title: "今日面试题",
        summary: "展示一道面试题。没有私有配置，属性留空对象。不使用数据查询。",
        category: IT_INTERVIEW_BLOCK_CATEGORY,
        keywords: ["面试题", "今日面试题", "面试"],
        layout: { w: 4, h: 12, description: "网格单位。画布 24 列，行高 8px。" },
        sections: [
          { key: "options", description: "没有私有字段。", example: {} },
          { key: "reqParams", description: "不查询数据源。", example: { queries: [] } },
        ],
      },
      render: () => React.createElement(DailyQuestionBlock, { sdk }),
    }),
  );

  safeRegister("block:algo", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.algo",
      title: "算法演示",
      iconUrl: ALGO_BLOCK_ICON,
      category: IT_INTERVIEW_BLOCK_CATEGORY,
      index: 21,
      defaultSize: { w: 6, h: 16, minW: 4, minH: 10 },
      dataConfig: false,
      configDoc: {
        type: "fat-it-interview.algo",
        title: "算法演示",
        summary: "逐步演示算法。没有私有配置，属性留空对象。不使用数据查询。",
        category: IT_INTERVIEW_BLOCK_CATEGORY,
        keywords: ["算法", "算法演示"],
        layout: { w: 6, h: 16, description: "网格单位。画布 24 列，行高 8px。" },
        sections: [
          { key: "options", description: "没有私有字段。", example: {} },
          { key: "reqParams", description: "不查询数据源。", example: { queries: [] } },
        ],
      },
      render: () => React.createElement(AlgoBlock, { sdk }),
    }),
  );

  safeRegister("block:react", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.react",
      title: "React 渲染",
      iconUrl: REACT_PLAY_BLOCK_ICON,
      category: IT_INTERVIEW_BLOCK_CATEGORY,
      index: 22,
      defaultSize: { w: 18, h: 48, minW: 10, minH: 20 },
      defaultOptions: {
        reactPlay: DEFAULT_REACT_PLAY,
      },
      defaultCommonOptions: {
        padding: { all: 0 },
      },
      dataConfig: false,
      configDoc: {
        type: "fat-it-interview.react",
        title: "React 渲染",
        summary:
          "三栏卡片：代码、控制台、页面。用户编写 function App 或 export default 组件，运行后在沙箱页面里渲染。可选 Less 样式。不使用数据查询。",
        category: IT_INTERVIEW_BLOCK_CATEGORY,
        keywords: ["React", "JSX", "渲染", "代码", "预览", "面试"],
        layout: { w: 18, h: 48, description: "网格单位。画布 24 列，行高 8px。" },
        sections: [
          {
            key: "options",
            description:
              "代码和展示选项都在 reactPlay。预览提供 React、ReactDOM、lodash 和 antd。Less 编辑器默认关闭。",
            fields: [
              {
                path: "reactPlay.source",
                name: "React 源码",
                dataType: "string",
                description:
                  "定义 function App()，或 export default 一个组件。支持 JSX 和 TypeScript 类型。console.log 显示在控制台。",
                default: DEFAULT_REACT_SOURCE,
              },
              {
                path: "reactPlay.theme",
                name: "主题",
                dataType: "string",
                enum: ["dark", "light"],
                default: "dark",
                description: "代码编辑器和控制台的深浅色。预览页不跟随主题。",
              },
              {
                path: "reactPlay.showConsole",
                name: "显示控制台",
                dataType: "boolean",
                default: true,
              },
              {
                path: "reactPlay.consolePlacement",
                name: "控制台位置",
                dataType: "string",
                enum: ["bottom", "right"],
                default: "bottom",
                description: "bottom 在代码下侧，right 在页面下侧。",
              },
              {
                path: "reactPlay.showLess",
                name: "显示 Less",
                dataType: "boolean",
                default: false,
                description: "为 true 时显示 Less 编辑器。默认关闭。",
              },
              {
                path: "reactPlay.less",
                name: "Less 样式",
                dataType: "string",
                default: "",
                description:
                  "Less 源码。运行时编译成 CSS，作用在预览页。组件用 className 引用类名。不支持 @import 和 @plugin。",
              },
            ],
            example: { reactPlay: DEFAULT_REACT_PLAY },
          },
          { key: "reqParams", description: "不查询数据源。", example: { queries: [] } },
        ],
        notes: [
          "页面在不带同源权限的 iframe 里渲染，读不到宿主页面和本地存储。",
          "预览里可以 import react、react-dom、lodash 和 antd。其它包和图标包不可用。",
          "点运行或按 Ctrl+Enter 后才会重新渲染。Less 也在这时编译进预览页。",
          "Less 编辑器默认不显示，在卡片配置里打开「显示 Less」。",
        ],
      },
      render: (props) => React.createElement(ReactPlayBlock, { sdk, ...props }),
    }),
  );

  safeRegister("blockDisplay:react", () =>
    sdk.contributions.registerBlockDisplayConfig({
      id: "fat-it-interview.react.display",
      blockType: "fat-it-interview.react",
      render: () => React.createElement(ReactPlayDisplay, { sdk }),
    }),
  );

  safeRegister("block:vue", () =>
    sdk.contributions.registerBlockType({
      type: "fat-it-interview.vue",
      title: "Vue 渲染",
      iconUrl: VUE_PLAY_BLOCK_ICON,
      category: IT_INTERVIEW_BLOCK_CATEGORY,
      index: 23,
      defaultSize: { w: 18, h: 48, minW: 10, minH: 20 },
      defaultOptions: {
        vuePlay: DEFAULT_VUE_PLAY,
      },
      defaultCommonOptions: {
        padding: { all: 0 },
      },
      dataConfig: false,
      configDoc: {
        type: "fat-it-interview.vue",
        title: "Vue 渲染",
        summary:
          "三栏卡片：代码、控制台、页面。用户编写 Vue 3 单文件组件，或 export default 一个组件，运行后在沙箱页面里渲染。支持 script setup、template 和 style。不使用数据查询。",
        category: IT_INTERVIEW_BLOCK_CATEGORY,
        keywords: ["Vue", "Vue3", "antd", "ant-design-vue", "渲染", "代码", "预览", "面试"],
        layout: { w: 18, h: 48, description: "网格单位。画布 24 列，行高 8px。" },
        sections: [
          {
            key: "options",
            description:
              "代码和展示选项都在 vuePlay。预览提供 Vue 3、lodash 和 ant-design-vue。Less 编辑器默认关闭。",
            fields: [
              {
                path: "vuePlay.source",
                name: "Vue 源码",
                dataType: "string",
                description:
                  "Vue 3 单文件组件：<script setup>、<template>、<style>。也可以只写 export default 的组件对象。可以从 ant-design-vue 或 antd 引入组件。console.log 显示在控制台。",
                default: DEFAULT_VUE_SOURCE,
              },
              {
                path: "vuePlay.theme",
                name: "主题",
                dataType: "string",
                enum: ["dark", "light"],
                default: "dark",
                description: "代码编辑器和控制台的深浅色。预览页不跟随主题。",
              },
              {
                path: "vuePlay.showConsole",
                name: "显示控制台",
                dataType: "boolean",
                default: true,
              },
              {
                path: "vuePlay.consolePlacement",
                name: "控制台位置",
                dataType: "string",
                enum: ["bottom", "right"],
                default: "bottom",
                description: "bottom 在代码下侧，right 在页面下侧。",
              },
              {
                path: "vuePlay.showLess",
                name: "显示 Less",
                dataType: "boolean",
                default: false,
                description: "为 true 时显示 Less 编辑器。默认关闭。组件里的 style 不受这个开关影响。",
              },
              {
                path: "vuePlay.less",
                name: "Less 样式",
                dataType: "string",
                default: "",
                description:
                  "额外的 Less 源码。运行时编译成 CSS，和组件 style 一起作用在预览页。不支持 @import 和 @plugin。",
              },
            ],
            example: { vuePlay: DEFAULT_VUE_PLAY },
          },
          { key: "reqParams", description: "不查询数据源。", example: { queries: [] } },
        ],
        notes: [
          "页面在不带同源权限的 iframe 里渲染，读不到宿主页面和本地存储。",
          "预览里可以 import vue、lodash 和 ant-design-vue。从 antd 引入也会得到同一套 Vue 组件。其它包不可用。",
          "点运行或按 Ctrl+Enter 后才会重新渲染。style 和 Less 也在这时编译进预览页。",
          "Less 编辑器默认不显示，在卡片配置里打开「显示 Less」。",
          "不编译 JSX。界面写在 template 里。",
        ],
      },
      render: (props) => React.createElement(VuePlayBlock, { sdk, ...props }),
    }),
  );

  safeRegister("blockDisplay:vue", () =>
    sdk.contributions.registerBlockDisplayConfig({
      id: "fat-it-interview.vue.display",
      blockType: "fat-it-interview.vue",
      render: () => React.createElement(VuePlayDisplay, { sdk }),
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
