import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Checkbox, Popover } from "antd";
import HolderOutlined from "@ant-design/icons/es/icons/HolderOutlined";
import { useMenuPrefs } from "../hooks";
import {
  dropIndex,
  isDefaultMenuPrefs,
  moveCategory,
  moveChild,
  orderedCategories,
  orderedChildren,
  reorderCategory,
  reorderChild,
  resetMenuPrefs,
  toggleCategoryHidden,
  toggleChildHidden,
  type MenuPrefs,
} from "../menuPrefs";

interface Props {
  /** 鼠标停在侧边菜单上时为 true，按钮才显示 */
  revealed: boolean;
}

interface DragState {
  group: string;
  id: string;
  title: string;
  from: number;
  x: number;
  y: number;
}

interface DropState {
  group: string;
  index: number;
}

const MenuSettingsButton: React.FC<Props> = ({ revealed }) => {
  const prefs = useMenuPrefs();
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [drop, setDrop] = useState<DropState | null>(null);
  const shown = revealed || open;
  const prefsRef = useRef(prefs);
  const dragRef = useRef<DragState | null>(null);
  const dropRef = useRef<DropState | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const endDragRef = useRef<(() => void) | null>(null);
  prefsRef.current = prefs;

  useEffect(() => () => endDragRef.current?.(), []);

  const beginDrag = (next: DragState) => {
    dragRef.current = next;
    dropRef.current = { group: next.group, index: next.from };
    setDrag(next);
    setDrop(dropRef.current);
    if (endDragRef.current) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    placeGhost(ghostRef.current, next.x, next.y);

    const onMove = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      placeGhost(ghostRef.current, event.clientX, event.clientY);
      scrollList(scrollerRef.current, event.clientY);
      const ids = idsInGroup(current.group, prefsRef.current);
      const nextIndex = dropIndex(ids, current.id, event.clientY, centersOf(current.group, ids));
      if (nextIndex < 0) return;
      const previous = dropRef.current;
      if (previous && previous.group === current.group && previous.index === nextIndex) return;
      const nextDrop = { group: current.group, index: nextIndex };
      dropRef.current = nextDrop;
      setDrop(nextDrop);
    };
    const onUp = () => {
      const current = dragRef.current;
      const landed = dropRef.current;
      dragRef.current = null;
      dropRef.current = null;
      setDrag(null);
      setDrop(null);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      endDragRef.current = null;
      if (!current || !landed || landed.group !== current.group || landed.index === current.from) return;
      if (current.group === "category") reorderCategory(current.id, landed.index);
      else reorderChild(current.group, current.id, landed.index);
    };
    endDragRef.current = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const categories = orderedCategories(prefs);

  useEffect(() => {
    if (!drag) return;
    placeGhost(ghostRef.current, drag.x, drag.y);
  }, [drag]);

  return (
    <>
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={(next) => {
        if (!next && dragRef.current) return;
        setOpen(next);
      }}
      content={
        <div style={{ width: 260 }}>
          <div style={{ fontWeight: 650, marginBottom: 2 }}>菜单设置</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>
            勾选控制显示，拖拽调整顺序
          </div>
          <div
            ref={scrollerRef}
            style={{ maxHeight: 420, overflow: "auto", marginRight: -4, paddingRight: 4 }}
          >
            {categories.map((category, index) => {
              const children = orderedChildren(category.id, prefs);
              const categoryFrom = drag?.group === "category" ? drag.from : -1;
              const categoryDrop = drop?.group === "category" ? drop.index : -1;
              return (
                <div key={category.id} style={{ position: "relative", marginBottom: 4 }}>
                  {categoryDrop === index && categoryDrop < categoryFrom ? <DropLine edge="top" /> : null}
                  <div data-sort-block={category.id}>
                    <PrefRow
                      title={category.title}
                      checked={!prefs.hidden.includes(category.id)}
                      dragging={drag?.group === "category" && drag.id === category.id}
                      group="category"
                      id={category.id}
                      index={index}
                      onToggle={() => toggleCategoryHidden(category.id)}
                      onDragStart={beginDrag}
                      onKeyMove={(id, delta) => moveCategory(id, delta)}
                    />
                    {children.map((child, childIndex) => {
                      const childFrom = drag?.group === category.id ? drag.from : -1;
                      const childDrop = drop?.group === category.id ? drop.index : -1;
                      return (
                        <div key={child.id} style={{ position: "relative" }}>
                          {childDrop === childIndex && childDrop < childFrom ? <DropLine edge="top" /> : null}
                          <PrefRow
                            title={child.title}
                            indent
                            checked={!prefs.childHidden.includes(child.id)}
                            dragging={drag?.group === category.id && drag.id === child.id}
                            group={category.id}
                            id={child.id}
                            index={childIndex}
                            onToggle={() => toggleChildHidden(child.id)}
                            onDragStart={beginDrag}
                            onKeyMove={(id, delta) => moveChild(category.id, id, delta)}
                          />
                          {childDrop === childIndex && childDrop > childFrom ? <DropLine edge="bottom" /> : null}
                        </div>
                      );
                    })}
                  </div>
                  {categoryDrop === index && categoryDrop > categoryFrom ? <DropLine edge="bottom" /> : null}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              disabled={isDefaultMenuPrefs(prefs)}
              onClick={() => resetMenuPrefs()}
              style={resetStyle(isDefaultMenuPrefs(prefs))}
            >
              恢复默认
            </button>
          </div>
        </div>
      }
    >
      <button
        type="button"
        aria-label="菜单设置"
        title="菜单设置"
        aria-expanded={open}
        style={{
          width: 22,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: 0,
          borderRadius: 4,
          padding: 0,
          background: open ? "rgba(128,128,128,0.16)" : "transparent",
          color: "inherit",
          cursor: shown ? "pointer" : "default",
          opacity: shown ? 0.8 : 0,
          pointerEvents: shown ? "auto" : "none",
          flex: "none",
        }}
      >
        <GearIcon />
      </button>
    </Popover>
    {drag
      ? createPortal(
          <div
            ref={ghostRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 2000,
              pointerEvents: "none",
              padding: "2px 8px",
              borderRadius: 6,
              background: "#1677ff",
              color: "#fff",
              fontSize: 12,
              lineHeight: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            }}
          >
            {drag.title}
          </div>,
          document.body,
        )
      : null}
    </>
  );
};

function idsInGroup(group: string, prefs: MenuPrefs): string[] {
  if (group === "category") return orderedCategories(prefs).map((item) => item.id);
  return orderedChildren(group, prefs).map((item) => item.id);
}

function centersOf(group: string, ids: readonly string[]): number[] {
  return ids.map((id) => {
    const rect = rectOf(group, id);
    return rect ? rect.top + rect.height / 2 : Number.NaN;
  });
}

function rectOf(group: string, id: string): DOMRect | null {
  if (!/^[\w-]+$/.test(id) || !/^[\w-]+$/.test(group)) return null;
  const selector = group === "category"
    ? `[data-sort-block="${id}"]`
    : `[data-sort-group="${group}"][data-sort-id="${id}"]`;
  return document.querySelector(selector)?.getBoundingClientRect() ?? null;
}

function placeGhost(node: HTMLDivElement | null, x: number, y: number): void {
  if (!node) return;
  node.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
}

function scrollList(scroller: HTMLDivElement | null, y: number): void {
  if (!scroller) return;
  const rect = scroller.getBoundingClientRect();
  if (y < rect.top + 28) scroller.scrollTop -= 14;
  else if (y > rect.bottom - 28) scroller.scrollTop += 14;
}

interface RowProps {
  title: string;
  checked: boolean;
  indent?: boolean;
  dragging: boolean;
  group: string;
  id: string;
  index: number;
  onToggle: () => void;
  onDragStart: (drag: DragState) => void;
  onKeyMove: (id: string, delta: -1 | 1) => void;
}

const PrefRow: React.FC<RowProps> = ({
  title,
  checked,
  indent,
  dragging,
  group,
  id,
  index,
  onToggle,
  onDragStart,
  onKeyMove,
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const handleVisible = hovered || focused || dragging;

  return (
    <div
      data-sort-group={group}
      data-sort-id={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 2,
        minHeight: 28,
        paddingLeft: indent ? 16 : 0,
        borderRadius: 6,
        background: dragging ? "rgba(22,119,255,0.12)" : "transparent",
        opacity: dragging ? 0.4 : 1,
      }}
    >
      <Checkbox checked={checked} onChange={onToggle} style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontWeight: indent ? 400 : 600,
            opacity: checked ? 1 : 0.45,
          }}
        >
          {title}
        </span>
      </Checkbox>
      <button
        type="button"
        aria-label={`拖拽调整${title}的顺序`}
        title="拖拽排序"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.stopPropagation();
          onDragStart({
            group,
            id,
            title,
            from: index,
            x: event.clientX,
            y: event.clientY,
          });
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          onKeyMove(id, event.key === "ArrowUp" ? -1 : 1);
        }}
        style={{
          width: 22,
          height: 22,
          border: 0,
          borderRadius: 4,
          padding: 0,
          background: "transparent",
          color: "inherit",
          cursor: dragging ? "grabbing" : "grab",
          opacity: handleVisible ? 0.55 : 0,
          pointerEvents: handleVisible ? "auto" : "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          touchAction: "none",
        }}
      >
        <HolderOutlined style={{ fontSize: 14 }} />
      </button>
    </div>
  );
};

function DropLine({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 4,
        right: 4,
        height: 2,
        borderRadius: 2,
        background: "#1677ff",
        top: edge === "top" ? 0 : undefined,
        bottom: edge === "bottom" ? 0 : undefined,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function resetStyle(disabled: boolean): React.CSSProperties {
  return {
    border: 0,
    background: "transparent",
    color: "inherit",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.35 : 0.75,
    fontSize: 12,
    padding: "2px 0",
  };
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default MenuSettingsButton;
