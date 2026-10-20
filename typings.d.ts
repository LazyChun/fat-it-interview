declare namespace Block {
  interface Item {
    options?: Record<string, unknown>;
    [key: string]: unknown;
  }
}
