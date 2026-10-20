import type { Question } from "./types";

export const javaQuestions: Question[] = [
  {
    id: "java-memory",
    category: "java",
    title: "JVM 内存区域怎么划分",
    difficulty: "medium",
    tags: ["JVM", "内存"],
    prompt: "堆、虚拟机栈、元空间分别放什么？栈上的局部变量什么时候消失？",
    parts: [
      {
        type: "list",
        items: [
          "堆是线程共享的，放对象实例和数组，是垃圾回收的主要场所。",
          "虚拟机栈是线程私有的，每个方法对应一个栈帧：局部变量表、操作数栈、动态链接、返回地址。方法结束，栈帧弹出。",
          "本地方法栈服务 native 方法。程序计数器记录当前线程执行到的字节码行号。",
          "类的元数据在 JDK 8 之后放在本地内存的元空间，不再占用堆里的永久代。",
          "对象并不总在堆上：逃逸分析后，未逃逸的小对象可能标量替换，看起来像分配在栈上。",
        ],
      },
    ],
    followUps: ["栈溢出和堆溢出在日志里分别长什么样？"],
  },
  {
    id: "java-gc",
    category: "java",
    title: "垃圾怎么被判定和回收",
    difficulty: "medium",
    tags: ["JVM", "GC"],
    prompt: "GC Roots 有哪些？标记清除、复制、标记整理怎么选？为什么新生代常用复制算法？",
    parts: [
      {
        type: "list",
        items: [
          "可达性分析从 GC Roots 出发：虚拟机栈里引用的对象、静态变量、常量、同步锁持有的对象、JNI 引用。",
          "引用计数解决不了循环引用，HotSpot 不用它做主方案。",
          "标记清除会产生碎片；复制算法把存活对象拷到空闲半区，适合存活率低的新生代。",
          "老年代存活率高，常用标记整理，避免碎片，代价是移动对象。",
          "Minor GC 只回收新生代；Full GC 通常伴随老年代回收，停顿更明显，要先看是分配过快、大对象还是元空间。",
        ],
      },
    ],
    followUps: ["G1 的 Region 和 Mixed GC 在解决什么问题？"],
  },
  {
    id: "java-hashmap",
    category: "java",
    title: "HashMap 的结构和扩容",
    difficulty: "medium",
    tags: ["集合", "HashMap"],
    prompt: "JDK 8 的 HashMap 怎么存数据？什么时候树化？为什么容量是 2 的幂？",
    parts: [
      {
        type: "list",
        items: [
          "结构是数组加链表，链表过长且数组足够大时转为红黑树。",
          "扰动：hash = (h >>> 16) ^ h，下标是 (n - 1) & hash。容量保持 2 的幂，位运算才等价于取模。",
          "默认容量 16，负载因子 0.75。超过阈值就扩成 2 倍，重新按低位把结点拆到原下标或原下标+旧容量。",
          "树化阈值 8，且数组长度至少 64，否则优先扩容。退树阈值是 6，避免来回抖动。",
          "允许一个 null 键。不是线程安全的，并发 put 可能丢数据。",
        ],
      },
    ],
    followUps: ["重写 equals 却不重写 hashCode 会怎样？"],
  },
  {
    id: "java-chm",
    category: "java",
    title: "ConcurrentHashMap 怎么保证并发",
    difficulty: "hard",
    tags: ["集合", "并发"],
    prompt: "JDK 8 的 ConcurrentHashMap 还分段锁吗？size 为什么不是一个简单的 int？",
    parts: [
      {
        type: "list",
        items: [
          "JDK 7 是分段锁。JDK 8 取消 Segment，空桶用 CAS 放入头结点，冲突后用 synchronized 锁住桶头。",
          "锁粒度是单个桶，不同桶可以并行写。读多数时候不加锁。",
          "扩容时多个线程可以帮忙迁移，用转发结点标记已经迁走的桶。",
          "size 用 baseCount 加 CounterCell 数组分散计数，避免所有线程抢同一个变量。size() 得到的是一个近似瞬时值。",
          "键和值都不允许 null，避免二义性：get 返回 null 时无法区分「没有」和「值就是 null」。",
        ],
      },
    ],
    followUps: ["Hashtable 为什么不推荐用来做并发 Map？"],
  },
  {
    id: "java-sync",
    category: "java",
    title: "synchronized 和 ReentrantLock",
    difficulty: "medium",
    tags: ["并发", "锁"],
    prompt: "synchronized 的锁升级过程是什么？它和 ReentrantLock 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "对象头的 Mark Word 记录锁状态。常见路径是偏向锁 → 轻量级锁（CAS）→ 重量级锁（操作系统互斥量）。",
          "二者都可重入。synchronized 由编译器和 JVM 配合，离开作用域自动释放。",
          "ReentrantLock 需要 finally 里 unlock。它额外提供可中断、超时、公平锁、多个 Condition。",
          "没有这些需求时，synchronized 更简单，JVM 对它的优化也很成熟。",
          "锁的是对象不是代码块。锁 this、锁 Class、锁一个专用对象，可见范围完全不同。",
        ],
      },
    ],
    followUps: ["什么是锁消除和锁粗化？"],
  },
  {
    id: "java-pool",
    category: "java",
    title: "线程池参数怎么理解",
    difficulty: "medium",
    tags: ["并发", "线程池"],
    prompt: "提交一个任务后，线程池的处理顺序是什么？核心线程和最大线程谁先满？",
    parts: [
      {
        type: "p",
        text: "顺序经常被讲反：核心线程没满就新建核心线程；核心满了先进队列；队列也满了，且还没到最大线程数，才新建非核心线程；再满就走拒绝策略。不是先把最大线程拉满再排队。",
      },
      {
        type: "list",
        items: [
          "keepAliveTime 作用于非核心线程；allowCoreThreadTimeOut 打开后核心线程也会超时退出。",
          "默认拒绝策略是 AbortPolicy，直接抛 RejectedExecutionException。",
          "CPU 密集可以接近核数；IO 密集可以更大，但要受下游连接数限制，而不是无限加大。",
          "队列不要无界。无界队列时最大线程数失效，任务会一直堆积，最终把内存打满。",
          "线程必须命名，异常要有兜底，否则线上只能看到 pool-1-thread-3。",
        ],
      },
    ],
    followUps: ["Executors.newFixedThreadPool 为什么不建议直接用？"],
  },
  {
    id: "java-volatile",
    category: "java",
    title: "volatile 能保证什么",
    difficulty: "medium",
    tags: ["并发", "JMM"],
    prompt: "volatile 能保证原子性吗？它和 synchronized 的差别在哪？",
    parts: [
      {
        type: "list",
        items: [
          "volatile 保证可见性和有序性：写会立刻刷新到主内存，读会从主内存取，并插入内存屏障禁止特定重排。",
          "不保证复合操作的原子性。i++ 仍是读-改-写，两个线程可以读到同一个旧值。",
          "典型用途：状态标志、双重检查锁里的实例引用（必须 volatile，否则可能看到未构造完成的对象）。",
          "需要原子增减用 AtomicInteger 或加锁，不要用 volatile 硬扛。",
          "happens-before：对 volatile 变量的写，先行发生于后续对它的读。",
        ],
      },
    ],
    followUps: ["指令重排在双重检查单例里具体会出什么问题？"],
  },
  {
    id: "java-ioc",
    category: "java",
    title: "Spring 的 IoC 做了什么",
    difficulty: "easy",
    tags: ["Spring", "IoC"],
    prompt: "控制反转和依赖注入是什么关系？Bean 的创建过程说一下。",
    parts: [
      {
        type: "list",
        items: [
          "控制反转是把对象的创建和依赖关系交给容器。依赖注入是实现手段：构造器、setter 或字段注入。",
          "构造器注入能保证依赖不可变、对象创建完即完整，也方便测试时传入假实现。",
          "容器启动时读取配置，生成 BeanDefinition，再实例化、填属性、初始化（Aware、初始化方法、BeanPostProcessor）。",
          "默认单例放在单例池里。原型每次获取都新建。",
          "循环依赖：单例的 setter 循环可以靠三级缓存提前暴露半成品；构造器循环无法解决，应改设计。",
        ],
      },
    ],
    followUps: ["BeanFactory 和 ApplicationContext 的差别？"],
  },
  {
    id: "java-aop",
    category: "java",
    title: "Spring AOP 是怎么织进去的",
    difficulty: "medium",
    tags: ["Spring", "AOP"],
    prompt: "AOP 的切点、通知、切面分别是什么？JDK 动态代理和 CGLIB 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "切面是横切逻辑的模块。切点描述在哪些方法上生效。通知是 before、after、around 等具体动作。",
          "有接口时默认 JDK 动态代理，代理的是接口。没有接口时用 CGLIB，生成子类，final 类和方法不能被代理。",
          "同类内部方法调用不经过代理，切面不会生效。事务注解也是这个问题。",
          "环绕通知要记得调用 proceed，否则目标方法不执行。",
          "AOP 适合日志、鉴权、事务、监控，不适合把核心业务规则藏进切面。",
        ],
      },
    ],
    followUps: ["@Transactional 失效有哪些常见原因？"],
  },
  {
    id: "java-tx",
    category: "java",
    title: "事务传播行为",
    difficulty: "hard",
    tags: ["Spring", "事务"],
    prompt: "REQUIRED 和 REQUIRES_NEW 有什么差别？什么异常会回滚？",
    parts: [
      {
        type: "list",
        items: [
          "REQUIRED：有事务就加入，没有就新建。这是默认值。外层回滚时，内层写过的数据一起回滚。",
          "REQUIRES_NEW：挂起外层，自己新开事务。内层提交后，外层再回滚也撤不回内层。适合操作日志这种必须留下的记录。",
          "NESTED：嵌套事务，依赖保存点。内层回滚可以只回到保存点，外层仍可继续。",
          "默认只在 RuntimeException 和 Error 时回滚，受检异常不回滚，除非 rollbackFor 写明。",
          "自调用、方法不是 public、异常被吃掉、数据库引擎不支持事务，都会让注解看起来「没生效」。",
        ],
      },
    ],
    followUps: ["事务方法里开了新线程去写库，事务还在吗？"],
  },
  {
    id: "java-equals",
    category: "java",
    title: "equals 和 hashCode 的约定",
    difficulty: "easy",
    tags: ["Java", "基础"],
    prompt: "== 和 equals 的差别？为什么重写 equals 必须重写 hashCode？",
    parts: [
      {
        type: "list",
        items: [
          "== 比较基本类型的值，比较引用类型的地址。equals 默认也是比地址，可以被覆写为比内容。",
          "约定：equals 相等的对象，hashCode 必须相等。反过来不必。",
          "只改 equals 不改 hashCode 时，两个内容相同的键会进 HashMap 的不同桶，get 拿不回来。",
          "equals 要满足自反、对称、传递，并且和 null 比较返回 false。",
          "用作键的对象，参与 hashCode/equals 的字段不要在入表后修改。",
        ],
      },
    ],
    followUps: ["String 为什么可以做 HashMap 的键，而一个可变 List 不适合？"],
  },
  {
    id: "java-generic",
    category: "java",
    title: "泛型擦除影响了什么",
    difficulty: "medium",
    tags: ["Java", "泛型"],
    prompt: "什么是类型擦除？为什么不能 new T()，也不能写 instanceof List<String>？",
    parts: [
      {
        type: "list",
        items: [
          "编译后泛型参数会被擦掉，List<String> 和 List<Integer> 在运行时都是 List。这是为了兼容擦除之前的字节码。",
          "所以不能 new T()、不能 instanceof 带参数的泛型、不能直接创建泛型数组。",
          "需要运行时类型时，把 Class<T> 当作参数传进来，这是类型令牌。",
          "通配符：? extends 是生产者，只能读；? super 是消费者，适合写入。记住 PECS。",
          "桥方法用来在擦除后仍然保持多态，反射时能看到。",
        ],
      },
    ],
    followUps: ["List<? extends Number> 为什么不能 add(Integer)？"],
  },
];
