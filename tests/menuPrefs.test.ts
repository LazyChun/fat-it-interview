import { describe, expect, it } from "vitest";
import { CATEGORIES, childrenOf } from "../src/data/categories";
import {
  catalogOrder,
  moveId,
  normalizeMenuPrefs,
  dropIndex,
  placeId,
  orderedCategories,
  orderedChildren,
  sortByOrder,
  visibleCategories,
  visibleChildren,
  type MenuPrefs,
} from "../src/menuPrefs";

function prefs(partial: Partial<MenuPrefs> = {}): MenuPrefs {
  return {
    order: [],
    hidden: [],
    childOrder: {},
    childHidden: [],
    ...partial,
  };
}

describe("sidebar menu prefs", () => {
  it("keeps the catalog order until the user sorts", () => {
    expect(orderedCategories(prefs()).map((item) => item.id)).toEqual(
      CATEGORIES.map((item) => item.id),
    );
    expect(orderedChildren("network", prefs()).map((item) => item.title)).toEqual([
      "TCP",
      "HTTP",
      "HTTPS",
      "DNS",
      "UDP",
    ]);
  });

  it("moves a category and hides it from the menu", () => {
    const order = moveId(
      CATEGORIES.map((item) => item.id),
      "network",
      -1,
    );
    expect(order[5]).toBe("network");
    expect(order[6]).toBe("database");

    const hidden = prefs({ order, hidden: ["java"] });
    const visible = visibleCategories(hidden).map((item) => item.id);
    expect(visible).not.toContain("java");
    expect(visible.indexOf("network")).toBeLessThan(visible.indexOf("database"));
    expect(orderedCategories(hidden).some((item) => item.id === "java")).toBe(true);
  });

  it("reorders and hides child topics under one parent", () => {
    const kids = childrenOf("network").map((item) => item.id);
    const order = moveId(kids, "net-tls", -1);
    const next = prefs({
      childOrder: { network: order },
      childHidden: ["net-udp"],
    });
    const visible = visibleChildren("network", next).map((item) => item.id);
    expect(visible).not.toContain("net-udp");
    expect(visible.indexOf("net-tls")).toBeLessThan(visible.indexOf("net-http"));
    expect(visibleChildren("frontend", next).map((item) => item.id)).toEqual(
      childrenOf("frontend").map((item) => item.id),
    );
  });

  it("appends new ids and drops unknown ones", () => {
    expect(catalogOrder(["a", "b", "c"], ["c", "a", "gone"])).toEqual(["c", "a", "b"]);
    expect(moveId(["a", "b"], "a", -1)).toEqual(["a", "b"]);
    expect(moveId(["a", "b"], "b", 1)).toEqual(["a", "b"]);
    expect(placeId(["a", "b", "c", "d"], "d", 1)).toEqual(["a", "d", "b", "c"]);
    expect(placeId(["a", "b"], "a", 0)).toEqual(["a", "b"]);
    expect(placeId(["a", "b"], "b", 8)).toEqual(["a", "b"]);
    expect(sortByOrder([{ id: "a" }, { id: "b" }], [])).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("picks a drop index from row centers without moving the list", () => {
    const ids = ["a", "b", "c"];
    const centers = [10, 30, 50];
    expect(dropIndex(ids, "a", 25, centers)).toBe(0);
    expect(dropIndex(ids, "a", 35, centers)).toBe(1);
    expect(dropIndex(ids, "a", 60, centers)).toBe(2);
    expect(dropIndex(ids, "c", 5, centers)).toBe(0);
    expect(dropIndex(ids, "c", 20, centers)).toBe(1);
    expect(dropIndex(ids, "c", 40, centers)).toBe(2);
    expect(dropIndex(ids, "missing", 20, centers)).toBe(-1);
    expect(dropIndex(ids, "a", 10, [Number.NaN, Number.NaN, Number.NaN])).toBe(0);
  });

  it("ignores malformed saved prefs", () => {
    expect(normalizeMenuPrefs(null)).toEqual(prefs());
    expect(
      normalizeMenuPrefs({
        order: ["network", 1],
        hidden: "java",
        childOrder: { network: ["net-dns", false] },
        childHidden: ["net-udp"],
      }),
    ).toEqual(
      prefs({
        order: ["network"],
        childOrder: { network: ["net-dns"] },
        childHidden: ["net-udp"],
      }),
    );
  });
});
