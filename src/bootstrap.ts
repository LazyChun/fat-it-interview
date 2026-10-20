/*
 * Async bootstrap — required by Module Federation so shared dependencies
 * can be negotiated with the host before the plugin module evaluates.
 */
import("./index");
export {};
