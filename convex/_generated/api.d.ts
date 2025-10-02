/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as boards from "../boards.js";
import type * as edges from "../edges.js";
import type * as exports from "../exports.js";
import type * as http from "../http.js";
import type * as keys from "../keys.js";
import type * as llm from "../llm.js";
import type * as nodes from "../nodes.js";
import type * as router from "../router.js";
import type * as usage from "../usage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  boards: typeof boards;
  edges: typeof edges;
  exports: typeof exports;
  http: typeof http;
  keys: typeof keys;
  llm: typeof llm;
  nodes: typeof nodes;
  router: typeof router;
  usage: typeof usage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
