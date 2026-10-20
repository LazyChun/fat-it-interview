import type { Question } from "./types";

export const networkQuestions: Question[] = [
  {
    id: "net-handshake",
    category: "network",
    title: "三次握手和四次挥手",
    difficulty: "medium",
    tags: ["TCP"],
    prompt: "为什么连接要三次，断开要四次？TIME_WAIT 是谁的状态，为什么要等 2MSL？",
    parts: [
      {
        type: "list",
        items: [
          "三次握手让双方都确认自己的发送和接收能力，并同步初始序列号。两次的话，服务端还不能确认客户端收到了自己的序列号。",
          "挥手四次是因为 TCP 全双工。一方发 FIN 只表示自己不再发送，对方还可以继续把剩余数据发完，所以 ACK 和 FIN 常常分开。",
          "主动关闭的一方进入 TIME_WAIT，等待 2MSL，让迟到的报文消失，并保证最后的 ACK 若丢失还能被重传对端的 FIN 触发再发一次。",
          "大量 TIME_WAIT 通常出现在频繁主动关闭连接的客户端或网关，解决办法是连接复用，而不是随便改系统参数。",
        ],
      },
    ],
    followUps: ["SYN 洪泛在消耗服务器的什么资源？"],
  },
  {
    id: "net-reliable",
    category: "network",
    title: "TCP 凭什么可靠",
    difficulty: "medium",
    tags: ["TCP"],
    prompt: "序号、确认、重传、滑动窗口分别解决什么？",
    parts: [
      {
        type: "list",
        items: [
          "每个字节有序列号，接收方按序重组，重复的丢掉。",
          "ACK 表示期望的下一个序号，即这个序号之前的都收到了。可以累积确认。",
          "超时重传兜底。快速重传在收到足够的重复 ACK 时提前重传，不必干等超时。",
          "滑动窗口让发送方在没收到确认前连续发送多段，窗口大小同时受对方接收窗口和拥塞窗口限制。",
          "校验和发现损坏。可靠不等于不延迟，队头阻塞仍然存在。",
        ],
      },
    ],
    followUps: ["糊涂窗口综合征是什么？"],
  },
  {
    id: "net-https",
    category: "network",
    title: "HTTPS 加密的是哪一段",
    difficulty: "medium",
    tags: ["HTTPS", "TLS"],
    prompt: "证书、非对称加密、对称加密在握手里各自干什么？是不是整段流量都用公钥加密？",
    parts: [
      {
        type: "list",
        items: [
          "证书把站点公钥和域名绑在一起，由证书链上的机构签名。浏览器验证的是「这把公钥确实属于这个域名」，不是验证对方是好人。",
          "非对称加密或密钥交换（TLS 1.3 用 ECDHE）只用来协商出对称密钥。",
          "之后的业务数据用对称加密。公钥不拿来加密每一个请求，那样太慢，也做不到前向保密。",
          "TLS 1.3 把握手减到 1-RTT，去掉了若干过时套件。",
          "HTTPS 不隐藏域名（SNI 在加密前，ESNI/ECH 另说），也不替代应用层的鉴权。",
        ],
      },
    ],
    followUps: ["中间人在什么前提下能伪造一个浏览器不报警的证书？"],
  },
  {
    id: "net-http2",
    category: "network",
    title: "HTTP/2 和 HTTP/3 改了什么",
    difficulty: "medium",
    tags: ["HTTP"],
    prompt: "多路复用解决了什么，又留下了什么问题？HTTP/3 为什么换 QUIC？",
    parts: [
      {
        type: "list",
        items: [
          "HTTP/1.1 一个连接上请求要排队，队头的响应不回来，后面的请求就堵着。所以浏览器才会开多个连接。",
          "HTTP/2 在一个 TCP 连接上多路复用多个流，头部用 HPACK 压缩。",
          "TCP 仍是有序字节流。一个包丢失，整条连接都要等重传，所有流一起停，这是 TCP 层的队头阻塞。",
          "HTTP/3 跑在 QUIC（基于 UDP）上，流之间独立丢包重传，握手还能和 TLS 合并。",
          "升级协议解决不了后端慢查询。先看瀑布图里时间花在哪。",
        ],
      },
    ],
    followUps: ["服务器推送为什么在实践里用得不多？"],
  },
  {
    id: "net-dns",
    category: "network",
    title: "DNS 解析经过哪些缓存",
    difficulty: "easy",
    tags: ["DNS"],
    prompt: "浏览器输入域名后，解析可能命中哪些层？TTL 改小能立刻全球生效吗？",
    parts: [
      {
        type: "list",
        items: [
          "浏览器缓存、操作系统缓存、路由器，然后才是递归解析器（运营商或公共 DNS）。",
          "递归解析器从根、顶级域、权威服务器逐级查，自己也会按 TTL 缓存。",
          "权威服务器上的 TTL 只约束「接下来缓存多久」，已经缓存的记录要等它自己的 TTL 到期。",
          "所以切换 IP 前要提前把 TTL 调小，等旧缓存都过期后再切。",
          "CNAME 是别名，还要再解析一次真正的 A/AAAA。DNS 做负载均衡是可能的，但要接受缓存导致的不精确。",
        ],
      },
    ],
    followUps: ["DNS 劫持和 DNS 污染有什么差别？"],
  },
  {
    id: "net-udp",
    category: "network",
    title: "TCP 和 UDP 怎么选",
    difficulty: "easy",
    tags: ["TCP", "UDP"],
    prompt: "UDP 不保证可靠，为什么实时音视频和 QUIC 还用它？",
    parts: [
      {
        type: "list",
        items: [
          "TCP 是面向连接的字节流，有拥塞控制、重传和按序交付。适合不能丢、可以等的数据，例如网页、文件、数据库。",
          "UDP 是报文，不连接、不重传、不保证顺序，头部小，发送方不会因为一个旧包堵住新包。",
          "音视频宁可丢一帧也不要等重传把延迟越堆越高，所以用 UDP，自己决定哪些包值得重传。",
          "QUIC 在 UDP 上自己实现了可靠、加密和多路复用，是为了绕开内核里很难升级的 TCP。",
          "DNS 查询用 UDP 是因为报文短、往返一次就够，失败再重试；区域传送这类大传输才用 TCP。",
        ],
      },
    ],
    followUps: ["什么是 NAT 穿透，为什么 UDP 更常遇到这件事？"],
  },
  {
    id: "net-congestion",
    category: "network",
    title: "拥塞控制在怕什么",
    difficulty: "hard",
    tags: ["TCP", "拥塞"],
    prompt: "慢启动、拥塞避免、快重传、快恢复各自做什么？和流量控制有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "流量控制看接收方的窗口，怕对方来不及处理。拥塞控制看网络，怕路由器队列被打满。",
          "慢启动：拥塞窗口从很小开始指数增长，尽快探到可用带宽。",
          "到达阈值后进入拥塞避免，每个往返大约只加一个 MSS，线性增长。",
          "超时被看成严重拥塞：阈值降为当前窗口一半，窗口回到 1，重新慢启动。",
          "重复 ACK 被看成轻度拥塞：快重传丢失段，快恢复把窗口降到一半左右继续发，而不是回到 1。",
        ],
      },
    ],
    followUps: ["BBR 和基于丢包的拥塞控制，判断拥塞的信号有什么不同？"],
  },
  {
    id: "net-ws",
    category: "network",
    title: "WebSocket 和 HTTP 长轮询",
    difficulty: "medium",
    tags: ["WebSocket", "HTTP"],
    prompt: "WebSocket 是怎么从 HTTP 升级来的？它解决了长轮询的什么问题？",
    parts: [
      {
        type: "list",
        items: [
          "握手仍是 HTTP：Upgrade: websocket，服务端 101 同意后，这条 TCP 连接改用 WebSocket 帧，不再按请求-响应。",
          "之后服务端可以主动推。帧有掩码、长度和 opcode，文本和二进制都能传。",
          "长轮询每次消息都要重新走一遍 HTTP 头，空等时还占着连接。WebSocket 的头部小得多。",
          "它不自动给你消息可靠语义以上的业务保证。断线重连、序号、心跳、鉴权过期都要自己做。",
          "经过代理时要确认代理允许升级，空闲连接会被中间设备掐掉，所以需要心跳。",
        ],
      },
    ],
    followUps: ["SSE 和 WebSocket 怎么选？"],
  },
];
