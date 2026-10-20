import type { Question } from "./types";

export const opsQuestions: Question[] = [
  {
    id: "ops-process",
    category: "ops",
    title: "一台机器 CPU 打满怎么查",
    difficulty: "medium",
    tags: ["Linux", "排查"],
    prompt: "登录后你按什么顺序看？load average 高就一定是 CPU 忙吗？",
    parts: [
      {
        type: "list",
        items: [
          "先看 uptime 的 load average，它包含正在跑和不可中断睡眠（常是磁盘 IO）的任务，不等于 CPU 利用率。",
          "top / pidstat 区分 us、sy、wa、hi。wa 高是在等 IO，加 CPU 没有用。",
          "找到进程后看线程：top -H -p pid。Java 进程再 jstack，对照线程 id 的十六进制 nid。",
          "短命进程用 execsnoop、perf 或打开审计，top 不一定抓得到。",
          "先确认是不是刚发布、死循环、GC 或被打满的下游，再决定重启。重启会把现场清掉。",
        ],
      },
    ],
    followUps: ["如何判断是 GC 线程在吃 CPU？"],
  },
  {
    id: "ops-disk",
    category: "ops",
    title: "磁盘满了怎么查",
    difficulty: "medium",
    tags: ["Linux", "磁盘"],
    prompt: "df 显示 100%，du 加起来却对不上，可能是什么？",
    parts: [
      {
        type: "list",
        items: [
          "先分清是块用尽还是 inode 用尽：df -h 和 df -i。小文件海量时 inode 会先耗尽。",
          "du -xh --max-depth=1 从挂载点往下找大目录。注意 du 默认不跨文件系统。",
          "删除的文件若仍被进程打开，空间不会释放。lsof | grep deleted 能看到，重启该进程或截断文件描述符。",
          "Docker 的容器日志、overlay 和镜像是常见大户，别只在业务目录里找。",
          "不要在还没确认文件用途时直接 rm。日志先 truncate，数据库文件先问清楚。",
        ],
      },
    ],
    followUps: ["inode 耗尽和块耗尽，业务侧的报错有什么不同？"],
  },
  {
    id: "ops-docker",
    category: "ops",
    title: "容器和虚拟机的差别",
    difficulty: "easy",
    tags: ["Docker", "容器"],
    prompt: "容器是不是更轻的虚拟机？它们隔离的边界在哪？",
    parts: [
      {
        type: "list",
        items: [
          "虚拟机带完整内核，由 hypervisor 隔离。容器共享宿主机内核，用 namespace 隔离视图，用 cgroup 限制资源。",
          "所以容器启动快、镜像小，但内核漏洞是共享的，不能把容器当成和虚拟机同级的安全边界。",
          "镜像是分层只读文件系统，容器在上面加一层可写层。可写层不适合存数据，数据放卷。",
          "一个容器跑一个进程是惯例，不是内核限制。把 ssh、cron、业务全塞进一个容器会让健康检查和日志失控。",
          "PID 1 要能正确转发信号。应用直接做 PID 1 时，要处理 SIGTERM，否则编排系统只能强杀。",
        ],
      },
    ],
    followUps: ["为什么容器里看到的内存和宿主机 free 对不上？"],
  },
  {
    id: "ops-docker-net",
    category: "ops",
    title: "Docker 网络模式",
    difficulty: "medium",
    tags: ["Docker", "网络"],
    prompt: "bridge、host、none 有什么差别？端口为什么有时宿主机访问不了？",
    parts: [
      {
        type: "list",
        items: [
          "默认 bridge：容器有独立网络命名空间，通过 docker0 和 iptables 做地址转换。-p 才把宿主机端口转进去。",
          "host：和宿主机共用网络命名空间，没有端口映射，也失去了网络隔离。",
          "none：只有回环，适合完全自己配网或不需要网的任务。",
          "容器间用服务名互通要在用户定义网络里，默认 bridge 不提供自动 DNS。",
          "连不上时先看监听地址是 127.0.0.1 还是 0.0.0.0，再看发布的端口、防火墙和到底打到了哪个网络。",
        ],
      },
    ],
    followUps: ["overlay 网络在解决什么问题？"],
  },
  {
    id: "ops-pod",
    category: "ops",
    title: "Pod 和控制器",
    difficulty: "medium",
    tags: ["Kubernetes", "Pod"],
    prompt: "为什么 Pod 是最小调度单位，而不是容器？Deployment 和 StatefulSet 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "Pod 里的容器共享网络和存储卷，可以通过 localhost 通信。适合主容器加边车，不适合把无关服务捆在一起。",
          "Pod 是会被替换的。不要在 Pod 里存需要留住的状态，除非卷的生命周期独立于 Pod。",
          "Deployment 管无状态副本，用 ReplicaSet 维持数量，滚动更新可以回滚。",
          "StatefulSet 给每个 Pod 稳定的名字和存储，适合主从、有序扩缩的有状态服务。",
          "DaemonSet 每个节点一个，Job/CronJob 负责跑完即止的任务。探针要能代表真实就绪，而不是进程还活着。",
        ],
      },
    ],
    followUps: ["存活探针和就绪探针配反了会怎样？"],
  },
  {
    id: "ops-svc",
    category: "ops",
    title: "Service 和 Ingress",
    difficulty: "medium",
    tags: ["Kubernetes", "网络"],
    prompt: "Service 怎么把流量送到 Pod？Ingress 是另一种 Service 吗？",
    parts: [
      {
        type: "list",
        items: [
          "Service 是一组 Pod 的稳定虚拟地址。kube-proxy 用 iptables 或 IPVS 把 ClusterIP 转到就绪的 Pod。",
          "选择的是标签，不是控制器名字。Pod 重建后 IP 变了，Service 不用改。",
          "ClusterIP 只在集群内，NodePort 在节点上开端口，LoadBalancer 向云厂商要一个外部均衡器。",
          "Ingress 是七层 HTTP 路由规则，自己不是流量终点。它后面要有 Ingress Controller 才真的转发。",
          "外部流量到 Pod：负载均衡器 → Ingress Controller → Service → Pod。TLS 终结通常发生在 Ingress。",
        ],
      },
    ],
    followUps: ["Endpoints 为空时请求会怎么样？"],
  },
  {
    id: "ops-cicd",
    category: "ops",
    title: "一条流水线至少要有什么",
    difficulty: "easy",
    tags: ["CI/CD"],
    prompt: "从合并代码到上线，哪些检查不该省？发布和部署是一回事吗？",
    parts: [
      {
        type: "list",
        items: [
          "提交触发：编译、单元测试、静态检查、依赖漏洞扫描，失败就不能产出制品。",
          "制品要不可变。同一个镜像 digest 从测试环境晋升到生产，而不是每个环境重新构建。",
          "部署是把制品放到环境里。发布是让用户真正用到，可以用开关或分批把两者分开。",
          "要有自动回滚条件：错误率、探针失败、关键指标下跌，而不是只靠人盯着。",
          "密钥不进仓库、不进镜像层。流水线日志里也不要打印它们。",
        ],
      },
    ],
    followUps: ["蓝绿和金丝雀的回滚成本有什么不同？"],
  },
  {
    id: "ops-observe",
    category: "ops",
    title: "日志、指标、链路怎么分工",
    difficulty: "medium",
    tags: ["可观测性"],
    prompt: "线上一个接口变慢，这三类数据分别回答什么问题？",
    parts: [
      {
        type: "list",
        items: [
          "指标回答「是不是坏了、坏了多少」：QPS、延迟分位、错误率、饱和度。适合报警。",
          "日志回答「这一次发生了什么」。要有结构化字段和请求 id，而不是一行无上下文的报错。",
          "链路回答「时间花在哪个服务」。一个 trace 把网关、应用、数据库串起来。",
          "报警要能行动。CPU 80% 本身不是事故，错误率上升或队列堆积才是。",
          "三类数据用同一个请求 id 互跳，排障时才不用靠时间戳猜。",
        ],
      },
    ],
    followUps: ["p99 变差但平均值正常，说明什么？"],
  },
  {
    id: "ops-nginx",
    category: "ops",
    title: "Nginx 反向代理在做什么",
    difficulty: "medium",
    tags: ["Nginx", "负载均衡"],
    prompt: "反向代理和正向代理有什么差别？upstream 几种常见策略怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "正向代理代表客户端，反向代理代表服务端，客户端只认识代理。",
          "轮询简单；加权轮询按机器能力分配；ip_hash 或一致性哈希让同一客户端落到同一台，适合有本地会话的旧系统。",
          "新系统应把会话放进外部存储，而不是依赖连接粘滞。",
          "proxy_pass 后面的 URI 有没有斜杠，会决定原路径是否被替换，这是配置里最容易配错的一点。",
          "要传 X-Forwarded-For / X-Forwarded-Proto，并只信任自己的代理写进来的头，否则客户端可以伪造来源。",
        ],
      },
    ],
    followUps: ["502 和 504 在 Nginx 日志里怎么区分？"],
  },
  {
    id: "ops-perm",
    category: "ops",
    title: "Linux 权限和 sudo",
    difficulty: "easy",
    tags: ["Linux", "权限"],
    prompt: "rwx 对文件和目录分别是什么意思？777 为什么危险？",
    parts: [
      {
        type: "list",
        items: [
          "文件：r 读内容，w 改内容，x 执行。目录：r 列名，x 进入，w 在目录里创建或删除条目（还要有 x）。",
          "删除文件看的是目录的写权限，不是文件自己的写权限。粘滞位可以限制只有所有者能删自己的文件。",
          "777 让所有本地用户都能改，脚本一旦可写就等于把控制权交出去。",
          "sudo 是按策略提权，不是「变成 root 的别名」。最小权限是只允许具体命令。",
          "属主、属组、其他三者不要用 chmod 777 图省事。服务账户只拿它需要的目录。",
        ],
      },
    ],
    followUps: ["umask 022 创建出来的文件权限为什么是 644？"],
  },
];
