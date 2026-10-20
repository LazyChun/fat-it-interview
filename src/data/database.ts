import type { Question } from "./types";

export const databaseQuestions: Question[] = [
  {
    id: "db-btree",
    category: "database",
    title: "为什么索引用 B+ 树",
    difficulty: "medium",
    tags: ["MySQL", "索引"],
    prompt: "和二叉搜索树、哈希索引比，B+ 树适合磁盘的原因是什么？聚簇索引和二级索引有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "磁盘按页读取。B+ 树矮而宽，一层能装很多键，三次 IO 往往就能定位，树高不会跟着行数线性长。",
          "二叉搜索树太高，而且不能按页友好的方式存。哈希索引等值很快，但不支持范围和排序。",
          "B+ 树的数据都在叶子，叶子之间有链表，范围扫描是顺着叶子走。",
          "InnoDB 的聚簇索引叶子就是整行，表数据按主键组织。二级索引叶子存的是主键，查到后可能还要回表。",
          "自增主键让插入近似顺序，减少页分裂。用随机 UUID 当聚簇主键会让插入变散。",
        ],
      },
    ],
    followUps: ["什么是覆盖索引？它怎样避免回表？"],
  },
  {
    id: "db-leftmost",
    category: "database",
    title: "联合索引的最左前缀",
    difficulty: "medium",
    tags: ["MySQL", "索引"],
    prompt: "索引 (a, b, c)，哪些查询用得上？b 单独出现为什么不行？",
    parts: [
      {
        type: "list",
        items: [
          "联合索引先按 a 排序，a 相同再按 b，再按 c。没有 a，就无法在这棵树里定位起点。",
          "能较好使用的是 a、a+b、a+b+c 的等值前缀。",
          "a 等值、b 范围之后，c 通常不能再用于查找，只能用于过滤或覆盖。",
          "a 的范围查询也一样，后面的列帮不上定位。",
          "把选择性高、又经常等值查询的列放在前面，但还是要按真实 WHERE 和 ORDER BY 来建，不要背口诀。",
        ],
      },
    ],
    followUps: ["索引下推（ICP）改变了哪一步？"],
  },
  {
    id: "db-acid",
    category: "database",
    title: "事务的 ACID",
    difficulty: "easy",
    tags: ["事务"],
    prompt: "原子性、一致性、隔离性、持久性分别靠什么实现？一致性是数据库单独保证的吗？",
    parts: [
      {
        type: "list",
        items: [
          "原子性：要么全做要么全不做，靠 undo log 回滚未完成的修改。",
          "持久性：提交后的修改不因崩溃丢失，靠 redo log 把提交记录先落盘。",
          "隔离性：并发事务互不干扰到声明的级别，靠锁和 MVCC。",
          "一致性是业务不变量仍然成立，例如转账前后总额不变。数据库提供前三条工具，规则本身要靠约束和正确的事务边界。",
          "只开事务不写对边界，ACID 也不会替你保住业务。",
        ],
      },
    ],
    followUps: ["redo log 和 binlog 的两阶段提交在保证什么？"],
  },
  {
    id: "db-isolation",
    category: "database",
    title: "隔离级别和三种读现象",
    difficulty: "hard",
    tags: ["事务", "隔离级别"],
    prompt: "脏读、不可重复读、幻读分别是什么？MySQL 默认级别下幻读还在吗？",
    parts: [
      {
        type: "list",
        items: [
          "脏读：读到别的事务还没提交的修改。读未提交才会发生。",
          "不可重复读：同一事务里两次读同一行，中间被别人提交了修改，结果不同。",
          "幻读：同一条件两次范围查询，中间别人插入了满足条件的行，多出来「幻影」。",
          "MySQL InnoDB 默认可重复读。普通快照读由 MVCC 保证，事务内看到的是一致快照。",
          "当前读（select for update、加锁的修改）靠 next-key lock 堵住间隙，避免幻读。只说「RR 彻底没有幻读」不准确，要区分快照读和当前读。",
        ],
      },
    ],
    followUps: ["读已提交和可重复读，在 InnoDB 里快照创建的时机有什么不同？"],
  },
  {
    id: "db-mvcc",
    category: "database",
    title: "MVCC 怎么让读不加锁",
    difficulty: "hard",
    tags: ["MySQL", "MVCC"],
    prompt: "undo log、隐藏字段和 Read View 是怎么配合的？",
    parts: [
      {
        type: "list",
        items: [
          "每行有事务 id 和回滚指针。修改时把旧版本串进 undo，形成版本链。",
          "快照读创建一个 Read View，里面有当前活跃事务的集合。",
          "沿着版本链找第一个对这个 Read View 可见的版本，所以读不到别人未提交的修改，也不阻塞写。",
          "可重复读在事务里第一次快照读时创建 Read View，之后复用。读已提交则每次读都新建。",
          "当前读要看最新已提交版本并加锁，不走这条只读快照路径。",
        ],
      },
    ],
    followUps: ["长事务为什么会让 undo 膨胀？"],
  },
  {
    id: "db-join",
    category: "database",
    title: "JOIN 是怎么执行的",
    difficulty: "medium",
    tags: ["SQL", "JOIN"],
    prompt: "嵌套循环、哈希连接各适合什么？为什么大表 JOIN 不一定慢？",
    parts: [
      {
        type: "list",
        items: [
          "MySQL 常见是嵌套循环：驱动表的每一行去被驱动表上找匹配。被驱动表的连接列有索引，内层就是索引查找。",
          "没有索引时，内层可能扫全表，行数乘起来才会慢。慢的是没索引，不是 JOIN 这个关键字。",
          "小表做驱动表通常更好，但优化器会根据统计信息选，不要用 STRAIGHT_JOIN 凭感觉固定。",
          "哈希连接适合大表等值连接且没有合适索引的场景，需要内存放哈希表。",
          "先看 EXPLAIN 里谁是驱动表、type 是 ref 还是 ALL，再决定加索引还是改写法。",
        ],
      },
    ],
    followUps: ["left join 之后在 where 里过滤右表列，为什么会变成内连接？"],
  },
  {
    id: "db-slow",
    category: "database",
    title: "一条慢 SQL 怎么查",
    difficulty: "medium",
    tags: ["SQL", "排查"],
    prompt: "拿到一条慢查询，你的排查顺序是什么？",
    parts: [
      {
        type: "list",
        items: [
          "先确认是不是偶发锁等待。看锁、事务和当时的连接，而不是急着加索引。",
          "EXPLAIN 看 type、key、rows、Extra。ALL 加 Using filesort、Using temporary 是重点。",
          "where、order by、group by 的列是否和索引顺序匹配。隐式类型转换会让索引失效，例如字符串列和数字比较。",
          "回表次数太多时考虑覆盖索引。数据分布极偏时优化器可能故意不走索引。",
          "改完用真实数据量验证，不要只在几十行的开发库里看。",
        ],
      },
    ],
    followUps: ["select * 在什么情况下会变成性能问题？"],
  },
  {
    id: "db-redis-struct",
    category: "database",
    title: "Redis 结构怎么选",
    difficulty: "medium",
    tags: ["Redis"],
    prompt: "缓存对象、排行榜、签到、消息流，分别用什么结构？",
    parts: [
      {
        type: "list",
        items: [
          "字符串适合缓存整块 JSON、计数和分布式锁的令牌。计数用 INCR，不要读出来加一再写回。",
          "哈希适合对象的字段级读写，但字段极多时要拆分，避免大 key。",
          "列表适合简单队列和最新 N 条。可靠队列不是它的强项。",
          "集合做标签、共同关注。有序集合做排行榜，score 是分数，范围查询按排名取。",
          "布隆过滤器、HyperLogLog、Bitmap 解决的是允许误差的存在判断、基数和签到，不要拿精确集合硬扛海量数据。",
        ],
      },
    ],
    followUps: ["大 key 会在删除时造成什么问题？"],
  },
  {
    id: "db-redis-persist",
    category: "database",
    title: "Redis 持久化",
    difficulty: "medium",
    tags: ["Redis", "持久化"],
    prompt: "RDB 和 AOF 各丢得起什么？混合持久化解决了什么？",
    parts: [
      {
        type: "list",
        items: [
          "RDB 是某个时间点的快照，恢复快，但两次快照之间的写入会丢。fork 时要留心内存页复制的开销。",
          "AOF 记录写命令。appendfsync everysec 最多丢大约一秒，always 更稳也更慢。文件会变大，需要重写。",
          "混合持久化在 AOF 重写时前半段用 RDB 格式，后面接增量命令，恢复更快。",
          "主从复制不是持久化。从库也可能同时丢掉还没复制的写入。",
          "缓存可以只开 RDB 甚至不持久化；当作数据库用时才需要认真配 AOF 和备份。",
        ],
      },
    ],
    followUps: ["重启后 RDB 和 AOF 同时存在，Redis 优先用哪个？"],
  },
  {
    id: "db-explain",
    category: "database",
    title: "怎么读 EXPLAIN",
    difficulty: "medium",
    tags: ["MySQL", "EXPLAIN"],
    prompt: "type、key、rows、Extra 里哪些值意味着这条 SQL 有问题？",
    parts: [
      {
        type: "list",
        items: [
          "type 从好到差大致是 system、const、eq_ref、ref、range、index、ALL。ALL 是全表扫描。",
          "key 为空说明没走索引。possible_keys 有值但 key 为空，是优化器判断走索引更贵。",
          "rows 是估算，不是精确行数。和过滤性一起看，不要只盯一个数字。",
          "Extra 里的 Using filesort、Using temporary 说明排序或分组没靠索引完成。Using index 表示覆盖索引，这是好事。",
          "EXPLAIN 不执行语句的全部副作用，但 DML 的说明仍要在事务里小心验证。",
        ],
      },
    ],
    followUps: ["EXPLAIN ANALYZE 比 EXPLAIN 多告诉你什么？"],
  },
];
