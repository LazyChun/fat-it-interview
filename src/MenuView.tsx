import React, { useEffect, useMemo, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Empty, Input } from "antd";
import MenuSettingsButton from "./components/MenuSettingsButton";
import { branchOf, getCategory, parentOf } from "./data/categories";
import { QUESTIONS, questionsForNode, topicOf } from "./data/questions";
import { useMenuPrefs, useRouteTick, useTick } from "./hooks";
import { CategoryIcon } from "./icons";
import { visibleCategories, visibleChildren } from "./menuPrefs";
import { getProgress } from "./progress";
import { categoryPath, parseRoute, questionPath } from "./routes";
import ThemeShell from "./ThemeShell";

interface Props {
  sdk: FatNotesPluginSDK;
}

const MenuView: React.FC<Props> = ({ sdk }) => {
  useRouteTick(sdk);
  useTick();
  const [query, setQuery] = useState("");
  const [panelHover, setPanelHover] = useState(false);
  const menuPrefs = useMenuPrefs();
  const route = parseRoute(sdk.router.getCurrent().path);
  const progress = getProgress();
  const activeQuestion =
    route.kind === "question" ? QUESTIONS.find((item) => item.id === route.questionId) : undefined;
  const activeNodeId =
    route.kind === "category" ? route.categoryId : activeQuestion ? topicOf(activeQuestion) : undefined;
  const activeBranch = activeNodeId ? branchOf(activeNodeId) : undefined;
  const [expanded, setExpanded] = useState<string[]>(() =>
    activeBranch ? [activeBranch] : ["frontend"],
  );

  useEffect(() => {
    if (!activeBranch) return;
    setExpanded((current) =>
      current.includes(activeBranch) ? current : [...current, activeBranch],
    );
  }, [activeBranch]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return QUESTIONS.filter((item) => {
      const node = getCategory(topicOf(item));
      const parent = node ? parentOf(node.id) : getCategory(item.category);
      return (
        item.title.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (node?.title.toLowerCase().includes(q) ?? false) ||
        (parent?.title.toLowerCase().includes(q) ?? false)
      );
    }).slice(0, 40);
  }, [query]);

  const toggle = (id: string) => {
    setExpanded((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const selectedQuestionId = route.kind === "question"
    ? route.questionId
    : route.kind === "category"
      ? route.questionId
      : undefined;
  const menuCategories = visibleCategories(menuPrefs);

  return (
    <ThemeShell sdk={sdk} padding={10}>
      <div
        onMouseEnter={() => setPanelHover(true)}
        onMouseLeave={() => setPanelHover(false)}
        style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 8 }}
      >
        <Input
          allowClear
          size="small"
          value={query}
          placeholder="搜索题目、标签、分类"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 22 }}>
          <div style={{ fontSize: 12, opacity: 0.65, flex: 1, minWidth: 0 }}>
            {QUESTIONS.length} 题 · 已掌握 {progress.mastered.length}
          </div>
          <MenuSettingsButton revealed={panelHover} />
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {query.trim() ? (
            hits.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的题目" />
            ) : (
              hits.map((item) => {
                const node = getCategory(topicOf(item));
                const parent = node?.parentId ? getCategory(node.parentId) : null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => sdk.router.navigate(questionPath(item.id))}
                    style={rowStyle(item.id === selectedQuestionId)}
                  >
                    <div>{item.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      {parent ? `${parent.title} / ` : ""}
                      {node?.title}
                    </div>
                  </button>
                );
              })
            )
          ) : menuCategories.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="分类已全部隐藏" />
          ) : (
            menuCategories.map((category) => {
              const kids = visibleChildren(category.id, menuPrefs);
              const open = expanded.includes(category.id);
              const own = countOf(category.id, progress.mastered);
              return (
                <div key={category.id} style={{ marginBottom: 6 }}>
                  <div style={rowStyle(category.id === activeNodeId, true)}>
                    {kids.length > 0 ? (
                      <button
                        type="button"
                        aria-label={open ? `收起${category.title}` : `展开${category.title}`}
                        onClick={() => toggle(category.id)}
                        style={chevronButton}
                      >
                        <span style={{ display: "inline-block", transform: open ? "rotate(90deg)" : undefined }}>
                          ›
                        </span>
                      </button>
                    ) : (
                      <span style={{ width: 22, flex: "none" }} />
                    )}
                    <button
                      type="button"
                      onClick={() => sdk.router.navigate(categoryPath(category.id))}
                      style={labelButton}
                    >
                      <CategoryIcon id={category.id} />
                      <span style={{ flex: 1 }}>{category.title}</span>
                      <span style={{ opacity: 0.6 }}>
                        {own.done}/{own.total}
                      </span>
                    </button>
                  </div>
                  {open && kids.length > 0 ? (
                    <div
                      style={{
                        margin: "4px 0 2px 16px",
                        paddingLeft: 8,
                        borderLeft: "1px solid rgba(128,128,128,0.35)",
                      }}
                    >
                      {kids.map((child) => {
                        const stat = countOf(child.id, progress.mastered);
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => sdk.router.navigate(categoryPath(child.id))}
                            style={childStyle(child.id === activeNodeId)}
                          >
                            <span style={{ flex: 1 }}>{child.title}</span>
                            <span style={{ opacity: 0.6 }}>
                              {stat.done}/{stat.total}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ThemeShell>
  );
};

function countOf(nodeId: string, mastered: string[]): { done: number; total: number } {
  const list = questionsForNode(nodeId);
  return {
    total: list.length,
    done: list.filter((item) => mastered.includes(item.id)).length,
  };
}

function rowStyle(active: boolean, plain = false): React.CSSProperties {
  return {
    width: "100%",
    textAlign: "left",
    marginBottom: plain ? 0 : 6,
    padding: plain ? "2px 4px 2px 2px" : "8px 10px",
    borderRadius: 8,
    border: `1px solid ${active ? "rgba(22,119,255,0.65)" : "rgba(128,128,128,0.25)"}`,
    background: active ? "rgba(22,119,255,0.08)" : "transparent",
    color: "inherit",
    display: plain ? "flex" : undefined,
    alignItems: plain ? "center" : undefined,
    gap: plain ? 2 : undefined,
  };
}

const chevronButton: React.CSSProperties = {
  width: 22,
  height: 28,
  border: 0,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  flex: "none",
};

const labelButton: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: 0,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  textAlign: "left",
  padding: "6px 6px 6px 0",
};

function childStyle(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    marginBottom: 4,
    padding: "6px 8px",
    borderRadius: 8,
    border: `1px solid ${active ? "rgba(22,119,255,0.65)" : "transparent"}`,
    background: active ? "rgba(22,119,255,0.08)" : "transparent",
    color: "inherit",
    cursor: "pointer",
  };
}

export default MenuView;
