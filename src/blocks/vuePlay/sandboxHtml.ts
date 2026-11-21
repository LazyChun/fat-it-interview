/** 预览 iframe 与父页面之间的消息类型。 */
export const VUE_PLAY_MESSAGE = "fat-vue-play";

function escapeScript(source: string): string {
  return source.replace(/<\/script/gi, "<\\/script");
}

const BOOT = String.raw`
(function () {
  function post(payload) {
    try {
      parent.postMessage(payload, "*");
    } catch (error) {
      parent.postMessage({
        type: "fat-vue-play",
        kind: "done",
        id: window.__fatRunId || 0,
        ok: false,
        error: String(error)
      }, "*");
    }
  }
  function formatArg(value) {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    if (value instanceof Error) return value.stack || value.message;
    try { return JSON.stringify(value); } catch (error) { return String(value); }
  }
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level] ? console[level].bind(console) : function () {};
    console[level] = function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) parts.push(formatArg(arguments[i]));
      post({
        type: "fat-vue-play",
        kind: "log",
        id: window.__fatRunId || 0,
        level: level,
        text: parts.join(" ")
      });
      original.apply(console, arguments);
    };
  });
  window.addEventListener("error", function (event) {
    post({
      type: "fat-vue-play",
      kind: "log",
      id: window.__fatRunId || 0,
      level: "error",
      text: String(event.error && event.error.stack || event.message || event.error)
    });
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    post({
      type: "fat-vue-play",
      kind: "log",
      id: window.__fatRunId || 0,
      level: "error",
      text: String(reason && reason.stack || reason)
    });
  });
  function showError(error) {
    var text = String(error && error.stack || error);
    var rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.textContent = "";
      var pre = document.createElement("pre");
      pre.style.cssText = "color:#cf1322;white-space:pre-wrap;margin:0";
      pre.textContent = text;
      rootEl.appendChild(pre);
    }
    post({
      type: "fat-vue-play",
      kind: "done",
      id: window.__fatRunId || 0,
      ok: false,
      error: text
    });
  }
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "fat-vue-play") return;
    if (data.kind !== "render") return;
    window.__fatRunId = data.id || 0;
    var rootEl = document.getElementById("root");
    var styleEl = document.getElementById("fat-less");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "fat-less";
      document.head.appendChild(styleEl);
    }
    if (typeof data.css === "string") styleEl.textContent = data.css;
    var failed = false;
    function fail(error) {
      if (failed) return;
      failed = true;
      showError(error);
    }
    try {
      if (window.__fatApp && typeof window.__fatApp.unmount === "function") {
        window.__fatApp.unmount();
      }
    } catch (error) {}
    window.__fatApp = null;
    try {
      if (!window.Vue || typeof window.Vue.createApp !== "function") {
        throw new Error("Vue 运行时没有加载");
      }
      var factory = new Function("Vue", "_", String(data.code || ""));
      var component = factory(window.Vue, window._);
      if (!component || (typeof component !== "object" && typeof component !== "function")) {
        throw new Error("没有可渲染的组件");
      }
      var root = component;
      if (window.antd && window.antd.ConfigProvider && window.antdLocale) {
        var Inner = component;
        root = {
          name: "FatVuePlayRoot",
          setup: function () {
            return function () {
              return window.Vue.h(window.antd.ConfigProvider, { locale: window.antdLocale }, {
                default: function () { return window.Vue.h(Inner); }
              });
            };
          }
        };
      }
      var app = window.Vue.createApp(root);
      if (window.antd && typeof window.antd.install === "function") {
        app.use(window.antd);
      }
      app.config.errorHandler = function (error) { fail(error); };
      app.config.warnHandler = function (message) { console.warn(message); };
      window.__fatApp = app;
      app.mount(rootEl);
      if (!failed) {
        post({
          type: "fat-vue-play",
          kind: "done",
          id: window.__fatRunId,
          ok: true,
          error: ""
        });
      }
    } catch (error) {
      fail(error);
    }
  });
})();
`;

export function buildVueSandboxHtml(vueUmd: string, lodashUmd = "", antdUmd = ""): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; style-src-attr 'unsafe-inline'; img-src data: blob: http: https:; connect-src http: https:;">
<style>
  html, body, #root { min-height: 100%; }
  body {
    margin: 0;
    background: #fff;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  #root { box-sizing: border-box; padding: 12px; }
</style>
</head>
<body>
<div id="root"></div>
<script>${escapeScript(vueUmd)}</script>
<script>${escapeScript(lodashUmd)}</script>
<script>${escapeScript(antdUmd)}</script>
<script>${BOOT}</script>
</body>
</html>`;
}
