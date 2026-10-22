import type { CategoryId } from "./types";

export interface CategoryNode {
  id: string;
  title: string;
  blurb: string;
  /** 没有 parentId 的是侧边栏第一级 */
  parentId?: CategoryId;
}

export const CATEGORY_TREE: CategoryNode[] = [
  { id: "frontend", title: "Web 前端", blurb: "HTML、CSS、JavaScript、React、Vue、工程化与 AI 应用" },
  { id: "fe-html", title: "HTML", blurb: "语义化、资源加载", parentId: "frontend" },
  { id: "fe-css", title: "CSS", blurb: "布局与格式化上下文", parentId: "frontend" },
  { id: "fe-js", title: "JavaScript", blurb: "语言机制与异步", parentId: "frontend" },
  { id: "fe-react", title: "React", blurb: "Fiber 与 Hooks", parentId: "frontend" },
  { id: "fe-redux", title: "Redux", blurb: "数据流、中间件与 RTK", parentId: "frontend" },
  { id: "fe-zustand", title: "Zustand", blurb: "store、选择器与订阅", parentId: "frontend" },
  { id: "fe-vue", title: "Vue", blurb: "响应式与组件", parentId: "frontend" },
  { id: "fe-webpack", title: "Webpack", blurb: "构建与拆包", parentId: "frontend" },
  { id: "fe-vite", title: "Vite", blurb: "预构建、热更新与生产打包", parentId: "frontend" },
  { id: "fe-browser", title: "浏览器", blurb: "网络、缓存与性能", parentId: "frontend" },
  { id: "fe-ts", title: "TypeScript", blurb: "类型系统与工程实践", parentId: "frontend" },
  { id: "fe-perf", title: "性能优化", blurb: "首屏、长列表与内存", parentId: "frontend" },
  { id: "fe-hand", title: "手写题", blurb: "防抖、深拷贝、Promise 等高频手写", parentId: "frontend" },
  { id: "fe-eng", title: "工程化", blurb: "Tree-shaking、微前端与监控", parentId: "frontend" },
  { id: "fe-security", title: "Web 安全", blurb: "XSS 与 CSRF", parentId: "frontend" },
  { id: "fe-ai", title: "AI 工程", blurb: "RAG、MCP、Prompt 与流式界面", parentId: "frontend" },

  { id: "java", title: "Java", blurb: "JVM、集合、并发与 Spring" },
  { id: "java-jvm", title: "JVM", blurb: "内存与垃圾回收", parentId: "java" },
  { id: "java-collection", title: "集合", blurb: "HashMap 与并发集合", parentId: "java" },
  { id: "java-concurrent", title: "并发", blurb: "锁、线程池与可见性", parentId: "java" },
  { id: "java-spring", title: "Spring", blurb: "IoC、AOP 与事务", parentId: "java" },
  { id: "java-lang", title: "语言基础", blurb: "相等性与泛型", parentId: "java" },

  { id: "backend", title: "后端", blurb: "缓存、消息、分布式与接口设计" },
  { id: "be-api", title: "接口设计", blurb: "幂等与 REST", parentId: "backend" },
  { id: "be-cache", title: "缓存", blurb: "一致性与击穿", parentId: "backend" },
  { id: "be-mq", title: "消息队列", blurb: "异步与可靠投递", parentId: "backend" },
  { id: "be-dist", title: "分布式", blurb: "锁与发号", parentId: "backend" },
  { id: "be-design", title: "系统设计", blurb: "限流、认证与秒杀", parentId: "backend" },

  { id: "ops", title: "运维", blurb: "Linux、Docker、Kubernetes 与可观测性" },
  { id: "ops-linux", title: "Linux", blurb: "进程、磁盘与权限", parentId: "ops" },
  { id: "ops-docker", title: "Docker", blurb: "容器与网络", parentId: "ops" },
  { id: "ops-k8s", title: "Kubernetes", blurb: "Pod 与 Service", parentId: "ops" },
  { id: "ops-delivery", title: "交付与观测", blurb: "CI/CD 与可观测性", parentId: "ops" },
  { id: "ops-proxy", title: "Nginx", blurb: "反向代理", parentId: "ops" },

  { id: "algorithm", title: "算法", blurb: "排序、查找、指针、图与动态规划，可逐步演示" },
  { id: "algo-sort", title: "排序", blurb: "冒泡、选择、插入、快排、归并、堆排", parentId: "algorithm" },
  { id: "algo-search", title: "查找", blurb: "二分与左边界", parentId: "algorithm" },
  { id: "algo-pointer", title: "指针与窗口", blurb: "双指针、滑动窗口、移动零", parentId: "algorithm" },
  { id: "algo-link", title: "链表", blurb: "反转与判环", parentId: "algorithm" },
  { id: "algo-tree", title: "树", blurb: "中序与层序", parentId: "algorithm" },
  { id: "algo-graph", title: "图", blurb: "广度优先与深度优先", parentId: "algorithm" },
  { id: "algo-dp", title: "动态规划", blurb: "背包、爬楼梯、子数组与子序列", parentId: "algorithm" },

  { id: "database", title: "数据库", blurb: "索引、事务、锁、SQL 与 Redis" },
  { id: "db-index", title: "索引", blurb: "B+ 树与最左前缀", parentId: "database" },
  { id: "db-tx", title: "事务", blurb: "ACID、隔离级别与 MVCC", parentId: "database" },
  { id: "db-sql", title: "SQL", blurb: "JOIN 与慢查询", parentId: "database" },
  { id: "db-redis", title: "Redis", blurb: "结构与持久化", parentId: "database" },

  { id: "network", title: "计算机网络", blurb: "TCP、HTTP、DNS 与安全传输" },
  { id: "net-tcp", title: "TCP", blurb: "握手、可靠与拥塞", parentId: "network" },
  { id: "net-http", title: "HTTP", blurb: "HTTP/2 与 WebSocket", parentId: "network" },
  { id: "net-tls", title: "HTTPS", blurb: "TLS", parentId: "network" },
  { id: "net-dns", title: "DNS", blurb: "解析与缓存", parentId: "network" },
  { id: "net-udp", title: "UDP", blurb: "与 TCP 的取舍", parentId: "network" },

  { id: "os", title: "操作系统", blurb: "进程、内存、调度与 IO" },
  { id: "os-process", title: "进程与调度", blurb: "进程、线程与调度", parentId: "os" },
  { id: "os-mem", title: "内存", blurb: "虚拟内存与缺页", parentId: "os" },
  { id: "os-sync", title: "同步", blurb: "死锁与条件变量", parentId: "os" },
  { id: "os-io", title: "IO 与内核", blurb: "IO 模型与用户态", parentId: "os" },
];

/** 侧边栏第一级 */
export const CATEGORIES: CategoryNode[] = CATEGORY_TREE.filter((node) => !node.parentId);

const byId = new Map(CATEGORY_TREE.map((node) => [node.id, node]));

export function getCategory(id: string): CategoryNode | null {
  return byId.get(id) ?? null;
}

export function childrenOf(id: string): CategoryNode[] {
  return CATEGORY_TREE.filter((node) => node.parentId === id);
}

export function parentOf(id: string): CategoryNode | null {
  const node = byId.get(id);
  if (!node?.parentId) return null;
  return byId.get(node.parentId) ?? null;
}

/** 叶子返回父级，根返回自己 */
export function branchOf(id: string): string | null {
  const node = byId.get(id);
  if (!node) return null;
  return node.parentId ?? node.id;
}
