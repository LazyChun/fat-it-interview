declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "fat-react-umd" {
  const content: string;
  export default content;
}

declare module "fat-react-dom-umd" {
  const content: string;
  export default content;
}

declare module "fat-lodash-umd" {
  const content: string;
  export default content;
}

declare module "fat-antd-sandbox" {
  const content: string;
  export default content;
}

declare module "fat-vue-umd" {
  const content: string;
  export default content;
}

declare module "fat-antd-vue-sandbox" {
  const content: string;
  export default content;
}

declare module "*.css";

declare module "less/lib/less/index.js" {
  interface LessRenderOptions {
    filename?: string;
    javascriptEnabled?: boolean;
  }

  interface LessApi {
    options: LessRenderOptions;
    PluginLoader: new (api: unknown) => unknown;
    render(input: string, options?: LessRenderOptions): Promise<{ css: string }>;
  }

  function createLess(): LessApi;
  export default createLess;
}

declare module "less/lib/less/default-options.js" {
  function createDefaultOptions(): {
    filename?: string;
    javascriptEnabled?: boolean;
  };
  export default createDefaultOptions;
}

declare namespace Block {
  interface Item {
    options?: Record<string, unknown>;
    [key: string]: unknown;
  }
}
