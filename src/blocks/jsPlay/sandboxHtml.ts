/** 执行 iframe 与父页面之间的消息类型。 */
export const JS_PLAY_MESSAGE = "fat-js-play";

function escapeScript(source: string): string {
  return source.replace(/<\/script/gi, "<\\/script");
}

const BOOT = `
(function () {
  var currentId = 0;
  function post(payload) {
    try {
      parent.postMessage(payload, "*");
    } catch (error) {
      try {
        parent.postMessage({
          type: "fat-js-play",
          kind: "done",
          id: currentId,
          ok: false,
          hasResult: false,
          result: null,
          error: String(error)
        }, "*");
      } catch (again) {}
    }
  }
  function formatArg(value) {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    if (typeof value === "bigint") return String(value) + "n";
    if (value instanceof Error) return value.stack || value.message;
    try { return JSON.stringify(value); } catch (error) { return String(value); }
  }
  function emit(level, args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) parts.push(formatArg(args[i]));
    post({
      type: "fat-js-play",
      kind: "log",
      id: currentId,
      level: level,
      text: parts.join(" ")
    });
  }
  function cloneResult(value) {
    if (typeof value === "bigint") return String(value);
    try { return JSON.parse(JSON.stringify(value)); }
    catch (error) { return String(value); }
  }
  var consoleProxy = {
    log: function () { emit("log", arguments); },
    info: function () { emit("info", arguments); },
    warn: function () { emit("warn", arguments); },
    error: function () { emit("error", arguments); },
    debug: function () { emit("log", arguments); },
    trace: function () { emit("log", arguments); },
    dir: function () { emit("log", arguments); },
    table: function () { emit("log", arguments); },
    group: function () {},
    groupEnd: function () {},
    clear: function () {}
  };
  window.addEventListener("error", function (event) {
    emit("error", [event.error || event.message]);
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    emit("error", [reason && reason.stack || reason]);
  });
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "fat-js-play" || data.kind !== "run") return;
    currentId = data.id || 0;
    if (typeof window._ !== "function") {
      post({
        type: "fat-js-play",
        kind: "done",
        id: currentId,
        ok: false,
        hasResult: false,
        result: null,
        error: "lodash 没有加载"
      });
      return;
    }
    try {
      var fn = new Function("_", "console", String(data.code || ""));
      Promise.resolve(fn(window._, consoleProxy)).then(function (value) {
        post({
          type: "fat-js-play",
          kind: "done",
          id: currentId,
          ok: true,
          hasResult: value !== undefined,
          result: value === undefined ? null : cloneResult(value),
          error: ""
        });
      }, function (err) {
        post({
          type: "fat-js-play",
          kind: "done",
          id: currentId,
          ok: false,
          hasResult: false,
          result: null,
          error: String(err && err.stack || err)
        });
      });
    } catch (err) {
      post({
        type: "fat-js-play",
        kind: "done",
        id: currentId,
        ok: false,
        hasResult: false,
        result: null,
        error: String(err && err.stack || err)
      });
    }
  });
})();
`;

export function buildJsSandboxHtml(lodashUmd: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval';">
</head>
<body>
<script>${escapeScript(lodashUmd)}</script>
<script>${BOOT}</script>
</body>
</html>`;
}
