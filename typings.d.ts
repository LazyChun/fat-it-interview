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

declare module "*.css";

declare namespace Block {
  interface Item {
    options?: Record<string, unknown>;
    [key: string]: unknown;
  }
}
