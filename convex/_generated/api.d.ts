/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as claudeActions from "../claudeActions.js";
import type * as commodities from "../commodities.js";
import type * as commodityActions from "../commodityActions.js";
import type * as commodityMutations from "../commodityMutations.js";
import type * as commodityQueries from "../commodityQueries.js";
import type * as cron from "../cron.js";
import type * as fredActions from "../fredActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  claudeActions: typeof claudeActions;
  commodities: typeof commodities;
  commodityActions: typeof commodityActions;
  commodityMutations: typeof commodityMutations;
  commodityQueries: typeof commodityQueries;
  cron: typeof cron;
  fredActions: typeof fredActions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
