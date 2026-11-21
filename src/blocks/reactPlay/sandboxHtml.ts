/** 预览 iframe 与父页面之间的消息类型。 */
export const REACT_PLAY_MESSAGE = "fat-react-play";

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
        type: "fat-react-play",
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
        type: "fat-react-play",
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
      type: "fat-react-play",
      kind: "log",
      id: window.__fatRunId || 0,
      level: "error",
      text: String(event.error && event.error.stack || event.message || event.error)
    });
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    post({
      type: "fat-react-play",
      kind: "log",
      id: window.__fatRunId || 0,
      level: "error",
      text: String(reason && reason.stack || reason)
    });
  });
  class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error: error };
    }
    componentDidCatch(error) {
      post({
        type: "fat-react-play",
        kind: "done",
        id: this.props.runId,
        ok: false,
        error: String(error && error.stack || error)
      });
    }
    render() {
      if (this.state.error) {
        return React.createElement("pre", {
          style: { color: "#cf1322", whiteSpace: "pre-wrap", margin: 0 }
        }, String(this.state.error.stack || this.state.error));
      }
      return React.createElement(React.Fragment, null, this.props.children);
    }
  }
  function Ready(props) {
    React.useEffect(function () {
      post({
        type: "fat-react-play",
        kind: "done",
        id: props.runId,
        ok: true,
        error: ""
      });
    }, [props.runId]);
    return null;
  }
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "fat-react-play") return;
    if (data.kind !== "render") return;
    window.__fatRunId = data.id || 0;
    var rootEl = document.getElementById("root");
    try {
      if (!window.React || !window.ReactDOM || typeof window.ReactDOM.createRoot !== "function") {
        throw new Error("React 运行时没有加载");
      }
      var factory = new Function("React", "ReactDOM", String(data.code || ""));
      var component = factory(window.React, window.ReactDOM);
      if (typeof component !== "function") {
        throw new Error("没有可渲染的组件");
      }
      if (!window.__fatRoot) {
        window.__fatRoot = window.ReactDOM.createRoot(rootEl);
      }
      var runId = window.__fatRunId;
      window.__fatRoot.render(window.React.createElement(
        Boundary,
        { key: runId, runId: runId },
        window.React.createElement(component),
        window.React.createElement(Ready, { runId: runId })
      ));
    } catch (error) {
      post({
        type: "fat-react-play",
        kind: "done",
        id: window.__fatRunId,
        ok: false,
        error: String(error && error.stack || error)
      });
    }
  });
})();
`;

export function buildReactSandboxHtml(
  reactUmd: string,
  reactDomUmd: string,
  lodashUmd = "",
  antdUmd = "",
): string {
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
<script>${escapeScript(reactUmd)}</script>
<script>${escapeScript(reactDomUmd)}</script>
<script>${escapeScript(lodashUmd)}</script>
<script>${escapeScript(antdUmd)}</script>
<script>${BOOT}</script>
</body>
</html>`;
}
